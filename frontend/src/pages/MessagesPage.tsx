import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { Layout } from '../components/layout';

const BRAND = '#0F4F59';

function useConvWS(convId: number | null, onMsg: (d: any) => void) {
  const wsRef    = useRef<WebSocket | null>(null);
  const cbRef    = useRef(onMsg);
  cbRef.current  = onMsg;

  useEffect(() => {
    if (!convId) return;
    const token = localStorage.getItem('access_token');
    const ws = new WebSocket(`ws://127.0.0.1:8001/ws/messaging/${convId}/?token=${token}`);
    wsRef.current = ws;
    ws.onmessage = (e) => { try { cbRef.current(JSON.parse(e.data)); } catch {} };
    ws.onerror   = () => {};
    const ping = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'ping' }));
    }, 30000);
    return () => { clearInterval(ping); ws.close(); };
  }, [convId]);

  const sendTyping = useCallback((isTyping: boolean) => {
    if (wsRef.current?.readyState === WebSocket.OPEN)
      wsRef.current.send(JSON.stringify({ type: 'typing', is_typing: isTyping }));
  }, []);

  return { sendTyping };
}

export const MessagesPage: React.FC = () => {
  const qc = useQueryClient();

  const currentUserId = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}').id; } catch { return null; }
  })();

  const [selectedConvId, setSelectedConvId] = useState<number | null>(null);
  const [input,          setInput]          = useState('');
  const [searchQ,        setSearchQ]        = useState('');
  const [showNew,        setShowNew]        = useState(false);
  const [typing,         setTyping]         = useState<Record<number, boolean>>({});
  const [localMsgs,      setLocalMsgs]      = useState<any[]>([]);

  // Edit state
  const [editingId,      setEditingId]      = useState<number | null>(null);
  const [editContent,    setEditContent]    = useState('');

  // ⋮ menu open for which message
  const [menuMsgId,      setMenuMsgId]      = useState<number | null>(null);

  // Confirm delete dialog: { type: 'message'|'conversation', id }
  const [confirmDelete,  setConfirmDelete]  = useState<{ type: string; id: number } | null>(null);

  const bottomRef   = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<any>(null);
  const menuRef     = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuMsgId(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── WS handler ──────────────────────────────────────────────────────────────
  const handleWs = useCallback((data: any) => {
    if (data.type === 'new_message') {
      // Skip own messages — already added by sendMsg.onSuccess
      if (String(data.sender_id) === String(currentUserId)) {
        qc.invalidateQueries({ queryKey: ['e2e-convs'] });
        return;
      }
      setLocalMsgs(prev =>
        prev.some(m => String(m.id) === String(data.message_id))
          ? prev
          : [...prev, {
              id: data.message_id, sender_id: data.sender_id, sender_name: data.sender_name,
              content: data.encrypted_content, created_at: data.created_at,
              is_mine: false, is_edited: false, is_deleted: false,
            }]
      );
      qc.invalidateQueries({ queryKey: ['e2e-convs'] });
    }
    if (data.type === 'message_edited') {
      setLocalMsgs(prev => prev.map(m =>
        m.id === data.message_id ? { ...m, content: data.encrypted_content, is_edited: true } : m
      ));
    }
    if (data.type === 'message_deleted') {
      setLocalMsgs(prev => prev.map(m =>
        m.id === data.message_id ? { ...m, is_deleted: true, content: '' } : m
      ));
    }
    if (data.type === 'typing') {
      setTyping(p => ({ ...p, [data.user_id]: data.is_typing }));
      setTimeout(() => setTyping(p => ({ ...p, [data.user_id]: false })), 3000);
    }
  }, [qc, currentUserId]);

  const { sendTyping } = useConvWS(selectedConvId, handleWs);

  // ── Queries ─────────────────────────────────────────────────────────────────
  const { data: convs = [], isLoading: convsLoading } = useQuery({
    queryKey: ['e2e-convs'],
    queryFn: () => apiClient.get('/messaging/e2e/conversations/').then(r => r.data),
    refetchInterval: 15000,
  });

  useEffect(() => {
    if (!selectedConvId) return;
    setLocalMsgs([]);
    apiClient.get(`/messaging/e2e/conversations/${selectedConvId}/messages/`)
      .then(r => setLocalMsgs(r.data.map((m: any) => ({ ...m, content: m.encrypted_content }))))
      .catch(() => {});
  }, [selectedConvId]);

  const { data: searchResults = [] } = useQuery({
    queryKey: ['user-search', searchQ],
    queryFn: () => searchQ.length >= 2
      ? apiClient.get(`/messaging/users/search/?q=${encodeURIComponent(searchQ)}`).then(r => r.data.results)
      : [],
    enabled: searchQ.length >= 2,
  });

  // ── Mutations ────────────────────────────────────────────────────────────────
  const startConv = useMutation({
    mutationFn: (recipientId: number) =>
      apiClient.post('/messaging/e2e/conversations/', { recipient_id: recipientId }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['e2e-convs'] });
      setSelectedConvId(res.data.id);
      setShowNew(false);
      setSearchQ('');
    },
  });

  const sendMsg = useMutation({
    mutationFn: (content: string) =>
      apiClient.post(`/messaging/e2e/conversations/${selectedConvId}/send/`, { content }),
    onSuccess: (res) => {
      const serverMsg = { ...res.data, content: res.data.encrypted_content, is_mine: true };
      // Replace if already exists by ID (WS beat us), otherwise append
      setLocalMsgs(prev =>
        prev.some(m => String(m.id) === String(serverMsg.id))
          ? prev.map(m => String(m.id) === String(serverMsg.id) ? serverMsg : m)
          : [...prev, serverMsg]
      );
      setInput('');
      qc.invalidateQueries({ queryKey: ['e2e-convs'] });
    },
    onError: () => alert('Failed to send message.'),
  });

  const editMsg = useMutation({
    mutationFn: ({ id, content }: { id: number; content: string }) =>
      apiClient.patch(`/messaging/e2e/messages/${id}/edit/`, { encrypted_content: content, nonce: '' }),
    onSuccess: (_, vars) => {
      setLocalMsgs(prev => prev.map(m =>
        m.id === vars.id ? { ...m, content: vars.content, is_edited: true } : m
      ));
      setEditingId(null);
      setEditContent('');
    },
    onError: () => alert('Failed to edit message.'),
  });

  const deleteMsg = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/messaging/e2e/messages/${id}/delete/`),
    onSuccess: (_, id) => {
      setLocalMsgs(prev => prev.map(m =>
        m.id === id ? { ...m, is_deleted: true, content: '' } : m
      ));
      setConfirmDelete(null);
    },
    onError: () => alert('Failed to delete message.'),
  });

  const deleteConv = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/messaging/e2e/conversations/${id}/delete/`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['e2e-convs'] });
      setSelectedConvId(null);
      setLocalMsgs([]);
      setConfirmDelete(null);
    },
    onError: () => alert('Failed to delete conversation.'),
  });

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleSend = () => {
    if (!input.trim() || !selectedConvId) return;
    sendMsg.mutate(input.trim());
  };

  const handleTyping = () => {
    sendTyping(true);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => sendTyping(false), 2000);
  };

  const startEdit = (msg: any) => {
    setEditingId(msg.id);
    setEditContent(msg.content || '');
    setMenuMsgId(null);
  };

  const submitEdit = () => {
    if (!editContent.trim() || !editingId) return;
    editMsg.mutate({ id: editingId, content: editContent.trim() });
  };

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [localMsgs]);

  const selectedConv = (convs as any[]).find((c: any) => c.id === selectedConvId);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <Layout>
      <style>{`
        .msg-layout { display:flex; height:calc(100vh - 80px); background:#f9fafb; overflow:hidden; min-width:0; }
        .conv-panel  { width:min(300px,100%); flex-shrink:0; border-right:1px solid #e5e7eb; background:white; display:flex; flex-direction:column; min-width:0; overflow:hidden; }
        .chat-panel  { flex:1; display:flex; flex-direction:column; min-width:0; overflow:hidden; }
        .msg-menu-btn { opacity:0; transition:opacity .15s; background:none; border:none; cursor:pointer; padding:2px 5px; border-radius:4px; font-size:14px; color:#6b7280; line-height:1; flex-shrink:0; }
        .msg-row:hover .msg-menu-btn { opacity:1; }
        @media(hover:none){ .msg-menu-btn { opacity:1; } }
        .avatar { width:38px; height:38px; border-radius:50%; background:linear-gradient(135deg,#0F4F59,#0a3840); display:flex; align-items:center; justify-content:center; color:white; font-weight:700; font-size:14px; flex-shrink:0; overflow:hidden; }
        .avatar img { width:100%; height:100%; object-fit:cover; border-radius:50%; }
        .avatar-sm { width:32px; height:32px; border-radius:50%; background:linear-gradient(135deg,#0F4F59,#0a3840); display:flex; align-items:center; justify-content:center; color:white; font-weight:700; font-size:12px; flex-shrink:0; overflow:hidden; }
        .avatar-sm img { width:100%; height:100%; object-fit:cover; border-radius:50%; }
        .del-chat-label { display:inline; }
        @media(max-width:768px){
          .conv-panel { width:100%; display:${selectedConvId ? 'none' : 'flex'}; }
          .chat-panel { display:${selectedConvId ? 'flex' : 'none'}; }
        }
        @media(max-width:480px){
          .del-chat-label { display:none; }
        }
      `}</style>

      {/* ── Confirm Delete Dialog ── */}
      {confirmDelete && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px', boxSizing:'border-box' }}>
          <div style={{ background:'white', borderRadius:'16px', padding:'24px 20px', maxWidth:'360px', width:'100%', boxShadow:'0 20px 60px rgba(0,0,0,0.2)', boxSizing:'border-box' }}>
            <h3 style={{ margin:'0 0 8px', fontSize:'16px', fontWeight:'700', color:'#111827' }}>
              {confirmDelete.type === 'conversation' ? 'Delete Conversation?' : 'Delete Message?'}
            </h3>
            <p style={{ margin:'0 0 20px', fontSize:'13px', color:'#6b7280', lineHeight:'1.5' }}>
              {confirmDelete.type === 'conversation'
                ? 'This will remove you from the conversation. This cannot be undone.'
                : 'This message will be permanently deleted for everyone.'}
            </p>
            <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end', flexWrap:'wrap' }}>
              <button onClick={() => setConfirmDelete(null)}
                style={{ flex:'1 1 auto', minWidth:'80px', maxWidth:'120px', padding:'9px 12px', borderRadius:'8px', border:'1px solid #d1d5db', background:'white', cursor:'pointer', fontSize:'13px', fontWeight:'600', color:'#374151', boxSizing:'border-box' }}>
                Cancel
              </button>
              <button
                onClick={() => confirmDelete.type === 'conversation'
                  ? deleteConv.mutate(confirmDelete.id)
                  : deleteMsg.mutate(confirmDelete.id)}
                disabled={deleteMsg.isPending || deleteConv.isPending}
                style={{ flex:'1 1 auto', minWidth:'80px', maxWidth:'120px', padding:'9px 12px', borderRadius:'8px', border:'none', background:'#dc2626', color:'white', cursor:'pointer', fontSize:'13px', fontWeight:'700', boxSizing:'border-box' }}>
                {deleteMsg.isPending || deleteConv.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="msg-layout">
        {/* ── Left: Conversations ── */}
        <div className="conv-panel">
          <div style={{ padding:'20px 16px 12px', borderBottom:'1px solid #f3f4f6' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h2 style={{ margin:0, fontSize:'18px', fontWeight:'800', color:'#111827' }}>Messages</h2>
              <button onClick={() => setShowNew(!showNew)}
                style={{ background:BRAND, color:'white', border:'none', borderRadius:'8px', padding:'6px 14px', cursor:'pointer', fontSize:'13px', fontWeight:'700' }}>
                + New
              </button>
            </div>
          </div>

          {showNew && (
            <div style={{ padding:'12px 16px', borderBottom:'1px solid #f3f4f6', background:'#f9fafb' }}>
              <input type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)}
                placeholder="Search users..." autoFocus
                style={{ width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid #d1d5db', fontSize:'14px', boxSizing:'border-box', outline:'none' }} />
              {Array.isArray(searchResults) && searchResults.length > 0 && (
                <div style={{ marginTop:'8px', background:'white', borderRadius:'8px', border:'1px solid #e5e7eb', overflow:'hidden' }}>
                  {(searchResults as any[]).map((u: any) => (
                    <div key={u.id} onClick={() => startConv.mutate(u.id)}
                      style={{ padding:'10px 14px', cursor:'pointer', display:'flex', alignItems:'center', gap:'10px', borderBottom:'1px solid #f3f4f6' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
                      <div className="avatar-sm">
                        {u.profile_picture ? <img src={u.profile_picture} alt={u.full_name} /> : u.avatar_initials}
                      </div>
                      <div>
                        <p style={{ margin:0, fontWeight:'600', fontSize:'14px', color:'#111827' }}>{u.full_name}</p>
                        <p style={{ margin:0, fontSize:'12px', color:'#9ca3af' }}>{u.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div style={{ flex:1, overflowY:'auto' }}>
            {convsLoading ? (
              <div style={{ padding:'40px', textAlign:'center', color:'#9ca3af' }}>Loading...</div>
            ) : (convs as any[]).length === 0 ? (
              <div style={{ padding:'40px 20px', textAlign:'center' }}>
                <p style={{ fontSize:'32px', margin:'0 0 8px' }}>💬</p>
                <p style={{ color:'#6b7280', margin:'0 0 4px', fontWeight:'600' }}>No messages yet</p>
                <p style={{ color:'#9ca3af', fontSize:'13px', margin:0 }}>Click + New to start</p>
              </div>
            ) : (convs as any[]).map((conv: any) => {
              const isSel  = conv.id === selectedConvId;
              const other  = conv.other_participant;
              const unread = conv.unread_count > 0;
              const preview = conv.last_message
                ? (conv.last_message.sender_id === currentUserId ? 'You: ' : '') + (conv.last_message.encrypted_content || 'Message')
                : 'No messages yet';
              return (
                <div key={conv.id}
                  style={{ padding:'14px 16px', cursor:'pointer', background: isSel ? '#e6f2f4' : 'white', borderBottom:'1px solid #f3f4f6', borderLeft: isSel ? `3px solid ${BRAND}` : '3px solid transparent', display:'flex', alignItems:'center', gap:'12px', position:'relative' }}
                  onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = '#f9fafb'; }}
                  onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = 'white'; }}>
                  <div onClick={() => setSelectedConvId(conv.id)} style={{ display:'flex', alignItems:'center', gap:'12px', flex:1, minWidth:0 }}>
                    <div className="avatar">
                      {conv.other_participant?.profile_picture
                        ? <img src={conv.other_participant.profile_picture} alt={conv.other_participant?.full_name} />
                        : (conv.other_participant?.avatar_initials || '?')}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <p style={{ margin:0, fontWeight: unread ? '700' : '600', fontSize:'14px', color:'#111827' }}>{other?.full_name || 'Unknown'}</p>
                        {unread && <span style={{ background:BRAND, color:'white', borderRadius:'20px', padding:'1px 8px', fontSize:'11px', fontWeight:'700' }}>{conv.unread_count}</span>}
                      </div>
                      <p style={{ margin:0, fontSize:'12px', color:'#9ca3af', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{preview}</p>
                    </div>
                  </div>
                  {/* Delete conversation button */}
                  <button
                    title="Delete conversation"
                    onClick={e => { e.stopPropagation(); setConfirmDelete({ type: 'conversation', id: conv.id }); }}
                    style={{ background:'none', border:'none', cursor:'pointer', color:'#d1d5db', fontSize:'16px', padding:'4px', borderRadius:'4px', flexShrink:0, lineHeight:1 }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#dc2626')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#d1d5db')}>
                    🗑
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right: Chat ── */}
        <div className="chat-panel">
          {!selectedConvId ? (
            <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', inset:0, backgroundImage:'url(/chat.jpg)', backgroundSize:'cover', backgroundPosition:'center', filter:'blur(6px)', transform:'scale(1.05)' }} />
              <div style={{ position:'absolute', inset:0, background:'rgba(15,79,89,0.55)' }} />
              <div style={{ position:'relative', zIndex:1, display:'flex', flexDirection:'column', alignItems:'center', color:'white' }}>
                <p style={{ fontSize:'48px', margin:'0 0 12px' }}>🔒</p>
                <p style={{ fontSize:'18px', fontWeight:'700', margin:'0 0 6px' }}>Your messages are private</p>
                <p style={{ fontSize:'14px', opacity:0.8, margin:0 }}>Select a conversation or start a new one</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div style={{ padding:'10px 12px', borderBottom:'1px solid #e5e7eb', background:'white', display:'flex', alignItems:'center', gap:'8px' }}>
                <button onClick={() => setSelectedConvId(null)}
                  style={{ background:'none', border:'none', cursor:'pointer', fontSize:'18px', color:'#6b7280', padding:'4px', flexShrink:0 }}>←</button>
                <div className="avatar" style={{ width:'34px', height:'34px', fontSize:'13px' }}>
                  {selectedConv?.other_participant?.profile_picture
                    ? <img src={selectedConv.other_participant.profile_picture} alt={selectedConv?.other_participant?.full_name} />
                    : (selectedConv?.other_participant?.avatar_initials || '?')}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ margin:0, fontWeight:'700', fontSize:'14px', color:'#111827', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{selectedConv?.other_participant?.full_name || 'Unknown'}</p>
                  <p style={{ margin:0, fontSize:'11px', color:'#9ca3af' }}>Active now</p>
                </div>
                <button
                  title="Delete conversation"
                  onClick={() => setConfirmDelete({ type: 'conversation', id: selectedConvId })}
                  style={{ background:'none', border:'1px solid #fecaca', borderRadius:'8px', cursor:'pointer', color:'#dc2626', fontSize:'13px', fontWeight:'600', padding:'5px 10px', flexShrink:0, display:'flex', alignItems:'center', gap:'4px' }}>
                  🗑 <span className="del-chat-label">Delete Chat</span>
                </button>
              </div>

              {/* Messages */}
              <div style={{ flex:1, overflowY:'auto', padding:'20px', display:'flex', flexDirection:'column', gap:'12px' }}>
                {localMsgs.map((msg: any) => (
                  <div key={msg.id} className="msg-row" style={{ display:'flex', justifyContent: msg.is_mine ? 'flex-end' : 'flex-start', alignItems:'flex-end', gap:'4px', position:'relative' }}>

                    {/* ⋮ menu for own messages — left of bubble */}
                    {msg.is_mine && (
                      <div style={{ position:'relative', alignSelf:'center' }} ref={menuMsgId === msg.id ? menuRef : undefined}>
                        <button className="msg-menu-btn" onClick={() => setMenuMsgId(menuMsgId === msg.id ? null : msg.id)}>⋮</button>
                        {menuMsgId === msg.id && (
                          <div style={{ position:'absolute', right:0, bottom:'28px', background:'white', border:'1px solid #e5e7eb', borderRadius:'10px', boxShadow:'0 8px 24px rgba(0,0,0,0.12)', zIndex:100, minWidth:'120px', overflow:'hidden' }}>
                            {!msg.is_deleted && (
                              <button onClick={() => startEdit(msg)}
                                style={{ display:'block', width:'100%', padding:'9px 14px', background:'none', border:'none', cursor:'pointer', textAlign:'left', fontSize:'13px', fontWeight:'600', color:'#111827' }}
                                onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                                ✏️ Edit
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setMenuMsgId(null);
                                if (msg.is_deleted) {
                                  // Already deleted — remove from local list entirely
                                  setLocalMsgs(prev => prev.filter(m => m.id !== msg.id));
                                } else {
                                  setConfirmDelete({ type: 'message', id: msg.id });
                                }
                              }}
                              style={{ display:'block', width:'100%', padding:'9px 14px', background:'none', border:'none', cursor:'pointer', textAlign:'left', fontSize:'13px', fontWeight:'600', color:'#dc2626' }}
                              onMouseEnter={e => (e.currentTarget.style.background = '#fef2f2')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                              🗑 {msg.is_deleted ? 'Remove' : 'Delete'}
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Bubble */}
                    <div style={{ maxWidth:'min(68%, 280px)', background: msg.is_mine ? BRAND : 'white', color: msg.is_mine ? 'white' : '#111827', borderRadius: msg.is_mine ? '18px 18px 4px 18px' : '18px 18px 18px 4px', padding:'8px 12px', border: msg.is_mine ? 'none' : '1px solid #e5e7eb', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                      {!msg.is_mine && <p style={{ margin:'0 0 3px', fontSize:'11px', fontWeight:'700', color:'#6b7280' }}>{msg.sender_name}</p>}

                      {/* Inline edit mode */}
                      {editingId === msg.id ? (
                        <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                          <textarea value={editContent} onChange={e => setEditContent(e.target.value)}
                            autoFocus rows={2}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitEdit(); } if (e.key === 'Escape') { setEditingId(null); } }}
                            style={{ padding:'6px 8px', borderRadius:'6px', border:'1px solid rgba(255,255,255,0.4)', background:'rgba(255,255,255,0.15)', color:'white', fontSize:'14px', resize:'none', fontFamily:'inherit', outline:'none', width:'100%', boxSizing:'border-box' }} />
                          <div style={{ display:'flex', gap:'6px', justifyContent:'flex-end' }}>
                            <button onClick={() => setEditingId(null)}
                              style={{ padding:'3px 10px', borderRadius:'6px', border:'1px solid rgba(255,255,255,0.4)', background:'transparent', color:'white', cursor:'pointer', fontSize:'12px' }}>
                              Cancel
                            </button>
                            <button onClick={submitEdit} disabled={editMsg.isPending}
                              style={{ padding:'3px 10px', borderRadius:'6px', border:'none', background:'white', color:BRAND, cursor:'pointer', fontSize:'12px', fontWeight:'700' }}>
                              {editMsg.isPending ? '...' : 'Save'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p style={{ margin:'0 0 4px', fontSize:'13px', lineHeight:'1.5', wordBreak:'break-word' }}>
                          {msg.is_deleted
                            ? <em style={{ opacity:0.5, fontSize:'12px' }}>Message deleted</em>
                            : (msg.content || msg.encrypted_content)}
                        </p>
                      )}

                      <p style={{ margin:0, fontSize:'10px', opacity:0.7, textAlign:'right' }}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
                        {msg.is_edited && !msg.is_deleted && ' · edited'}
                        {msg.is_mine && msg.is_read && ' ✓✓'}
                      </p>
                    </div>
                  </div>
                ))}

                {Object.values(typing).some(Boolean) && (
                  <div style={{ display:'flex' }}>
                    <div style={{ background:'white', borderRadius:'18px', padding:'10px 16px', border:'1px solid #e5e7eb', color:'#9ca3af', fontSize:'18px' }}>•••</div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input bar */}
              <div style={{ padding:'10px 12px', borderTop:'1px solid #e5e7eb', background:'white', display:'flex', gap:'8px', alignItems:'flex-end' }}>
                <textarea value={input}
                  onChange={e => { setInput(e.target.value); handleTyping(); }}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Type a message... (Enter to send)"
                  rows={1}
                  style={{ flex:1, padding:'8px 12px', borderRadius:'12px', border:'1px solid #d1d5db', fontSize:'14px', resize:'none', fontFamily:'inherit', outline:'none', maxHeight:'100px', lineHeight:'1.5', boxSizing:'border-box' }} />
                <button onClick={handleSend} disabled={!input.trim() || sendMsg.isPending}
                  style={{ background: !input.trim() ? '#e5e7eb' : BRAND, color:'white', border:'none', borderRadius:'12px', padding:'8px 16px', cursor: !input.trim() ? 'not-allowed' : 'pointer', fontWeight:'700', fontSize:'14px', flexShrink:0 }}>
                  {sendMsg.isPending ? '...' : 'Send'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MessagesPage;
