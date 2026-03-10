import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import { useTranslation } from "react-i18next";
import { api } from "../api";
import { Layout } from "../components/layout";
import { HeroSection } from "../components/HeroSection";
import {
  Ban,
  FileText,
  Target,
  PenTool,
  Search,
  DollarSign,
  Rocket,
  Send,
  Loader2,
  Lightbulb,
  Brain,
  Zap,
  Menu,
  X,
  Plus,
  MessageSquare,
  Clock,
  MoreVertical,
  Star,
  Edit2,
  Trash2,
  Check,
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: number;
  title: string;
  is_starred: boolean;
  created_at: string;
  updated_at: string;
  message_count: number;
}

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  description: string;
  prompt: string;
}

export const AICoachPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copyWarning, setCopyWarning] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [contextMenuOpen, setContextMenuOpen] = useState<number | null>(null);
  const [renamingSession, setRenamingSession] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Fetch chat sessions
  const { data: sessions = [] } = useQuery<ChatSession[]>({
    queryKey: ['chat-sessions'],
    queryFn: async () => {
      const res = await api.get('/ai/chat/');
      return res.data;
    },
  });

  // Fetch messages for current session
  const { data: sessionMessages } = useQuery({
    queryKey: ['chat-messages', currentSessionId],
    queryFn: async () => {
      if (!currentSessionId) return [];
      const res = await api.get(`/ai/chat/${currentSessionId}/messages/`);
      return res.data.messages;
    },
    enabled: !!currentSessionId,
  });

  // Update messages when session messages load
  useEffect(() => {
    if (sessionMessages) {
      setMessages(sessionMessages.map((msg: any) => ({
        id: msg.id.toString(),
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp),
      })));
    }
  }, [sessionMessages]);

  const quickActions: QuickAction[] = [
    {
      id: "1",
      label: "Resume Review",
      icon: "FileText",
      description: "Get feedback on your resume",
      prompt: "Can you help me review and improve my resume? I need advice on formatting, content, and making it more appealing to employers.",
    },
    {
      id: "2",
      label: "Interview Prep",
      icon: "Target",
      description: "Practice interview questions",
      prompt: "I have an upcoming interview. Can you help me prepare with common interview questions and provide tips on how to answer them effectively?",
    },
    {
      id: "3",
      label: "Cover Letter",
      icon: "PenTool",
      description: "Write compelling cover letters",
      prompt: "I need help writing a cover letter for a job application. Can you guide me through creating a compelling and personalized cover letter?",
    },
    {
      id: "4",
      label: "Job Search",
      icon: "Search",
      description: "Find the right opportunities",
      prompt: "I'm looking for job opportunities in my field. Can you help me with job search strategies and where to find the best positions?",
    },
    {
      id: "5",
      label: "Salary Negotiation",
      icon: "DollarSign",
      description: "Negotiate your worth",
      prompt: "I received a job offer and want to negotiate the salary. Can you provide guidance on how to approach salary negotiations effectively?",
    },
    {
      id: "6",
      label: "Career Pivot",
      icon: "Rocket",
      description: "Change career paths",
      prompt: "I'm considering changing my career path. Can you help me understand how to transition to a new field and what steps I should take?",
    },
  ];

  const chatMutation = useMutation({
    mutationFn: (data: { message: string; session_id?: number }) => {
      const langMap: Record<string, string> = {
        'en':'English','sw':'Swahili','am':'Amharic','ha':'Hausa',
        'yo':'Yoruba','zu':'Zulu','ar':'Arabic','fr':'French',
        'pt':'Portuguese','dinka':'Dinka'
      };
      const langCode = i18n.language || localStorage.getItem('bebrivus_language') || 'en';
      const language = langMap[langCode] || 'English';

      return api.post("/ai/chat/", {
        message: data.message,
        context: "career_coach",
        session_id: data.session_id,
        language: language,
      });
    },
    onMutate: () => {
      setIsTyping(true);
    },
    onSuccess: (response: any) => {
      // Check if response contains an error
      if (response.data.error || response.data.response.includes('error') || response.data.response.includes('unavailable')) {
        const errorMessage: ChatMessage = {
          id: Date.now().toString(),
          role: "assistant",
          content: response.data.response || "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        setIsTyping(false);
        return;
      }
      
      const aiMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: response.data.response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
      
      // Update current session ID if new session created
      if (response.data.session_id && !currentSessionId) {
        setCurrentSessionId(response.data.session_id);
      }
      
      // Refresh sessions list
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
    },
    onError: () => {
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsTyping(false);
    },
  });

  const sendMessage = (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    chatMutation.mutate({ 
      message: content.trim(),
      session_id: currentSessionId || undefined 
    });
    setInputMessage("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  const handleBlockedCopy = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!copyWarning) {
      setCopyWarning("Copying AI responses is disabled.");
      setTimeout(() => setCopyWarning(null), 2500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputMessage);
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    sendMessage(action.prompt);
  };

  const handleNewChat = () => {
    setCurrentSessionId(null);
    setMessages([]);
  };

  const handleLoadSession = (sessionId: number) => {
    setCurrentSessionId(sessionId);
  };

  // Star/unstar mutation
  const starMutation = useMutation({
    mutationFn: ({ id, is_starred }: { id: number; is_starred: boolean }) =>
      api.patch(`/ai/chat/${id}/`, { is_starred }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
    },
  });

  // Rename mutation
  const renameMutation = useMutation({
    mutationFn: ({ id, title }: { id: number; title: string }) =>
      api.patch(`/ai/chat/${id}/`, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
      setRenamingSession(null);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/ai/chat/${id}/`),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
      if (currentSessionId === deletedId) {
        setCurrentSessionId(null);
        setMessages([]);
      }
    },
  });

  const handleStarToggle = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    starMutation.mutate({ id: session.id, is_starred: !session.is_starred });
    setContextMenuOpen(null);
  };

  const handleRenameStart = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingSession(session.id);
    setRenameValue(session.title);
    setContextMenuOpen(null);
  };

  const handleRenameSubmit = (sessionId: number) => {
    if (renameValue.trim()) {
      renameMutation.mutate({ id: sessionId, title: renameValue.trim() });
    }
  };

  const handleRenameCancel = () => {
    setRenamingSession(null);
    setRenameValue("");
  };

  const handleDelete = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${session.title}"? This will permanently delete all messages.`)) {
      deleteMutation.mutate(session.id);
    }
    setContextMenuOpen(null);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (renamingSession && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingSession]);

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getQuickActionIcon = (iconName: string) => {
    const iconMap = {
      FileText: FileText,
      Target: Target,
      PenTool: PenTool,
      Search: Search,
      DollarSign: DollarSign,
      Rocket: Rocket,
    };
    return iconMap[iconName as keyof typeof iconMap] || FileText;
  };

  const filteredSessions = sessions.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const starredSessions = filteredSessions.filter(s => s.is_starred);
  const regularSessions = filteredSessions.filter(s => !s.is_starred);

  return (
    <Layout>
      <HeroSection
        key={i18n.language}
        title={t('AI Career Coach')}
        subtitle={t('AI Coach Description')}
        backgroundImage="/ai-coach.png"
        showZigZag
      />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-4 mb-8 ai-coach-chat-wrapper">
          {/* Sidebar */}
          <div className={`${sidebarOpen ? 'w-full lg:w-80' : 'w-0'} transition-all duration-300 overflow-hidden flex-shrink-0 ${sidebarOpen ? 'block' : 'hidden lg:block'} ai-coach-sidebar`}>
            <div className="h-full bg-white rounded-xl shadow-sm border border-neutral-100 flex flex-col">
              {/* Sidebar Header */}
              <div className="p-4 border-b border-neutral-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-primary-600">{t("beBrivus AI Coach")}</h2>
                  <button onClick={() => setSidebarOpen(false)} className="text-neutral-400 hover:text-neutral-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <button
                  onClick={handleNewChat}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t("New Chat")}
                </button>
              </div>

              {/* Search */}
              <div className="p-4 border-b border-neutral-100">
                <input
                  type="text"
                  placeholder={t("Search chats")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Chat History */}
              <div className="flex-1 overflow-y-auto p-2">
                {starredSessions.length > 0 && (
                  <>
                    <div className="text-xs font-semibold text-neutral-500 px-3 py-2">{t("STARRED")}</div>
                    {starredSessions.map((session) => (
                      <ChatSessionItem
                        key={session.id}
                        session={session}
                        currentSessionId={currentSessionId}
                        contextMenuOpen={contextMenuOpen}
                        renamingSession={renamingSession}
                        renameValue={renameValue}
                        onLoadSession={handleLoadSession}
                        onContextMenuToggle={setContextMenuOpen}
                        onStarToggle={handleStarToggle}
                        onRenameStart={handleRenameStart}
                        onRenameSubmit={handleRenameSubmit}
                        onRenameCancel={handleRenameCancel}
                        onRenameChange={setRenameValue}
                        onDelete={handleDelete}
                        renameInputRef={renameInputRef}
                        formatDate={formatDate}
                      />
                    ))}
                  </>
                )}
                <div className="text-xs font-semibold text-neutral-500 px-3 py-2">{t("RECENT CHATS")}</div>
                {regularSessions.length === 0 && starredSessions.length === 0 ? (
                  <div className="text-center py-8 text-neutral-400 text-sm">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    {t("No chats yet")}
                  </div>
                ) : regularSessions.length === 0 ? (
                  <div className="text-center py-4 text-neutral-400 text-xs">
                    {t("No recent chats")}
                  </div>
                ) : (
                  regularSessions.map((session) => (
                    <ChatSessionItem
                      key={session.id}
                      session={session}
                      currentSessionId={currentSessionId}
                      contextMenuOpen={contextMenuOpen}
                      renamingSession={renamingSession}
                      renameValue={renameValue}
                      onLoadSession={handleLoadSession}
                      onContextMenuToggle={setContextMenuOpen}
                      onStarToggle={handleStarToggle}
                      onRenameStart={handleRenameStart}
                      onRenameSubmit={handleRenameSubmit}
                      onRenameCancel={handleRenameCancel}
                      onRenameChange={setRenameValue}
                      onDelete={handleDelete}
                      renameInputRef={renameInputRef}
                      formatDate={formatDate}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col min-w-0 ai-coach-main">
            {/* Toggle Sidebar Button */}
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="mb-4 w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm border border-neutral-100 hover:bg-neutral-50 lg:hidden"
              >
                <Menu className="w-5 h-5 text-neutral-600" />
              </button>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mb-4 w-10 h-10 hidden lg:flex items-center justify-center bg-white rounded-lg shadow-sm border border-neutral-100 hover:bg-neutral-50"
            >
              {sidebarOpen ? <X className="w-5 h-5 text-neutral-600" /> : <Menu className="w-5 h-5 text-neutral-600" />}
            </button>

            {/* Quick Actions - Show only when no messages */}
            {messages.length === 0 && (
              <div className="card mb-4">
                <div className="card-body">
                  <h3 className="text-lg font-semibold text-secondary-900 mb-6 text-center">
                    {t("How can I help you today?")}
                  </h3>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: '12px',
                    width: '100%',
                    maxWidth: '100%',
                  }}>
                    {quickActions.map((action) => {
                      const IconComponent = getQuickActionIcon(action.icon);
                      return (
                        <div
                          key={action.id}
                          onClick={() => handleQuickAction(action)}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            padding: '16px',
                            borderRadius: '12px',
                            border: '1px solid #e5e7eb',
                            background: 'white',
                            cursor: 'pointer',
                            width: 'calc(100% - 24px)',
                            maxWidth: '280px',
                            boxSizing: 'border-box',
                            overflow: 'hidden',
                            minHeight: '100px',
                          }}
                          className="hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 group"
                        >
                          <div style={{ marginBottom: '8px', flexShrink: 0 }}>
                            <div className="w-8 h-8 text-primary-600 group-hover:text-primary-700">
                              <IconComponent className="w-full h-full" />
                            </div>
                          </div>
                          <h3 style={{
                            fontSize: 'clamp(13px, 2vw, 16px)',
                            fontWeight: '600',
                            margin: '0 0 4px 0',
                            overflowWrap: 'break-word',
                            wordBreak: 'break-word',
                            maxWidth: '100%',
                            lineHeight: '1.3',
                          }} className="text-secondary-900 group-hover:text-primary-700">
                            {t(action.label)}
                          </h3>
                          <p style={{
                            fontSize: 'clamp(11px, 1.5vw, 13px)',
                            color: '#6b7280',
                            margin: 0,
                            overflowWrap: 'break-word',
                            wordBreak: 'break-word',
                            maxWidth: '100%',
                            lineHeight: '1.4',
                          }} className="group-hover:text-secondary-700">
                            {t(action.description)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Chat Interface */}
            <div className="card flex flex-col flex-1">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-12 text-neutral-400">
                    <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">{t("Start a conversation")}</p>
                    <p className="text-sm mt-2">{t("Ask me anything about your career!")}</p>
                  </div>
                )}
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      onCopy={
                        message.role === "assistant" ? handleBlockedCopy : undefined
                      }
                      className={`max-w-3xl px-4 py-3 rounded-lg ${
                        message.role === "user"
                          ? "bg-primary-600 text-white rounded-br-none"
                          : "bg-neutral-100 text-neutral-900 rounded-bl-none select-none"
                      }`}
                    >
                      <div className="whitespace-pre-wrap break-words">
                        {message.role === "assistant" ? (
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                              ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                              li: ({ children }) => <li className="ml-2">{children}</li>,
                              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                              code: ({ children }) => <code className="bg-neutral-200 px-1 py-0.5 rounded text-sm">{children}</code>,
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        ) : (
                          message.content
                        )}
                      </div>
                      <div className={`text-xs mt-2 opacity-75 ${
                        message.role === "user" ? "text-primary-100" : "text-neutral-500"
                      }`}>
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-neutral-100 px-4 py-3 rounded-lg rounded-bl-none">
                      <div className="flex items-center gap-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                          <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        </div>
                        <span className="text-sm text-neutral-500">{t("AI is thinking...")}</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Form */}
              <div className="border-t border-neutral-200 p-4">
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                  <textarea
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t("Type a message")}
                    className="flex-1 resize-none border border-neutral-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={3}
                    disabled={chatMutation.isPending}
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || chatMutation.isPending}
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2 sm:self-end"
                  >
                    {chatMutation.isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{t("Send")}</span>
                      </>
                    )}
                  </button>
                </form>

                {copyWarning && (
                  <div className="mt-2 text-sm text-error-700 bg-error-50 border border-error-200 rounded-md px-3 py-2 flex items-center justify-center gap-2">
                    <Ban className="w-4 h-4" />
                    <span className="font-medium">{t(copyWarning)}</span>
                  </div>
                )}

                <div className="mt-3 text-xs sm:text-sm text-neutral-500 text-center flex items-center justify-center gap-2">
                  <Lightbulb className="w-4 h-4 flex-shrink-0" />
                  <span>
                    {t("Tip: Be specific about your situation for more personalized advice")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card text-center h-full">
            <div className="card-body flex flex-col items-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-3">
                <Target className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                {t("Personalized Advice")}
              </h3>
              <p className="text-secondary-600 text-sm">
                {t("Get tailored career guidance based on your specific situation and goals.")}
              </p>
            </div>
          </div>
          <div className="card text-center h-full">
            <div className="card-body flex flex-col items-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-3">
                <Brain className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                {t("Expert Knowledge")}
              </h3>
              <p className="text-secondary-600 text-sm">
                {t("Access industry best practices and proven strategies for job search success.")}
              </p>
            </div>
          </div>
          <div className="card text-center h-full sm:col-span-2 lg:col-span-1">
            <div className="card-body flex flex-col items-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-3">
                <Zap className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                {t("Instant Support")}
              </h3>
              <p className="text-secondary-600 text-sm">
                {t("Get immediate answers to your career questions, available 24/7.")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

interface ChatSessionItemProps {
  session: ChatSession;
  currentSessionId: number | null;
  contextMenuOpen: number | null;
  renamingSession: number | null;
  renameValue: string;
  onLoadSession: (id: number) => void;
  onContextMenuToggle: (id: number | null) => void;
  onStarToggle: (session: ChatSession, e: React.MouseEvent) => void;
  onRenameStart: (session: ChatSession, e: React.MouseEvent) => void;
  onRenameSubmit: (id: number) => void;
  onRenameCancel: () => void;
  onRenameChange: (value: string) => void;
  onDelete: (session: ChatSession, e: React.MouseEvent) => void;
  renameInputRef: React.RefObject<HTMLInputElement>;
  formatDate: (date: string) => string;
}

const ChatSessionItem: React.FC<ChatSessionItemProps> = ({
  session,
  currentSessionId,
  contextMenuOpen,
  renamingSession,
  renameValue,
  onLoadSession,
  onContextMenuToggle,
  onStarToggle,
  onRenameStart,
  onRenameSubmit,
  onRenameCancel,
  onRenameChange,
  onDelete,
  renameInputRef,
  formatDate,
}) => {
  const { t } = useTranslation();
  const isActive = currentSessionId === session.id;
  const isRenaming = renamingSession === session.id;

  return (
    <div
      className={`relative group w-full px-3 py-2 rounded-lg mb-1 transition-colors ${
        isActive ? 'bg-primary-50 border border-primary-200' : 'hover:bg-neutral-50'
      }`}
    >
      <button
        onClick={() => !isRenaming && onLoadSession(session.id)}
        className="w-full text-left"
        disabled={isRenaming}
      >
        <div className="flex items-start gap-2">
          {session.is_starred ? (
            <Star className="w-4 h-4 mt-0.5 flex-shrink-0 text-yellow-500 fill-yellow-500" />
          ) : (
            <MessageSquare className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
              isActive ? 'text-primary-600' : 'text-neutral-400'
            }`} />
          )}
          <div className="flex-1 min-w-0">
            {isRenaming ? (
              <input
                ref={renameInputRef}
                type="text"
                value={renameValue}
                onChange={(e) => onRenameChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onRenameSubmit(session.id);
                  if (e.key === 'Escape') onRenameCancel();
                }}
                onBlur={() => onRenameSubmit(session.id)}
                className="w-full text-sm font-medium px-2 py-1 border border-primary-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div className={`text-sm font-medium truncate ${
                isActive ? 'text-primary-900' : 'text-neutral-900'
              }`}>
                {session.title}
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
              <Clock className="w-3 h-3" />
              {formatDate(session.updated_at)}
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onContextMenuToggle(contextMenuOpen === session.id ? null : session.id);
            }}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-neutral-200 rounded transition-opacity"
          >
            <MoreVertical className="w-4 h-4 text-neutral-600" />
          </button>
        </div>
      </button>

      {/* Context Menu */}
      {contextMenuOpen === session.id && (
        <div className="absolute right-2 top-10 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 py-1 min-w-[150px]">
          <button
            onClick={(e) => onStarToggle(session, e)}
            className="w-full text-left px-4 py-2 text-sm hover:bg-neutral-50 flex items-center gap-2"
          >
            <Star className={`w-4 h-4 ${session.is_starred ? 'fill-yellow-500 text-yellow-500' : 'text-neutral-600'}`} />
            {session.is_starred ? t('Unstar') : t('Star')}
          </button>
          <button
            onClick={(e) => onRenameStart(session, e)}
            className="w-full text-left px-4 py-2 text-sm hover:bg-neutral-50 flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4 text-neutral-600" />
            {t('Rename')}
          </button>
          <button
            onClick={(e) => onDelete(session, e)}
            className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {t('Delete')}
          </button>
        </div>
      )}
    </div>
  );
};
