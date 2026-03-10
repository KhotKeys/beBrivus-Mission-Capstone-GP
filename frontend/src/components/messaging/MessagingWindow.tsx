import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { messagingApi } from "../../api/messaging";
import { Send, Video, X, Loader2 } from "lucide-react";
import { Button } from "../ui";

interface MessagingWindowProps {
  mentorUserId: number;
  mentorName: string;
  onClose: () => void;
  onBookSession: () => void;
}

export const MessagingWindow: React.FC<MessagingWindowProps> = ({
  mentorUserId,
  mentorName,
  onClose,
  onBookSession,
}) => {
  const [newMessage, setNewMessage] = useState("");
  const [conversationId, setConversationId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Get or create conversation
  const { data: conversationsData, isLoading: loadingConversations } = useQuery(
    {
      queryKey: ["conversations"],
      queryFn: () => messagingApi.getConversations(),
    }
  );

  // Find existing conversation with this mentor
  useEffect(() => {
    console.log("Conversations Data:", conversationsData);
    const conversationResults =
      conversationsData?.data?.results || conversationsData?.results || [];
    if (conversationResults.length > 0) {
      const existingConversation = conversationResults.find((conv: any) => {
        return (
          conv.participants &&
          conv.participants.some((p: any) => p.id === mentorUserId)
        );
      });
      console.log("Existing conversation found:", existingConversation);
      if (existingConversation) {
        setConversationId(existingConversation.id);
      }
    }
  }, [conversationsData, mentorUserId]);

  // Get messages for this conversation
  const { data: messagesData, isLoading: loadingMessages } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => messagingApi.getMessages(conversationId!),
    enabled: !!conversationId,
    refetchInterval: 3000, // Poll for new messages every 3 seconds
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesData]);

  // Start conversation mutation
  const startConversationMutation = useMutation({
    mutationFn: (initialMessage: string) =>
      messagingApi.startConversation(mentorUserId, initialMessage),
    onSuccess: (response) => {
      setConversationId(response.data.id);
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({
        queryKey: ["messages", response.data.id],
      });
    },
    onError: (error) => {
      console.error("Failed to start conversation:", error);
      alert("Failed to send message. Please try again.");
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: ({
      conversationId,
      content,
    }: {
      conversationId: number;
      content: string;
    }) => messagingApi.sendMessage(conversationId, content),
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error) => {
      console.error("Failed to send message:", error);
      alert("Failed to send message. Please try again.");
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    if (conversationId) {
      // Send to existing conversation
      sendMessageMutation.mutate({ conversationId, content: newMessage });
    } else {
      // Start new conversation with initial message
      startConversationMutation.mutate(newMessage);
    }
  };

  const messages = messagesData?.data?.results || [];
  const isLoading =
    loadingConversations ||
    loadingMessages ||
    startConversationMutation.isPending ||
    sendMessageMutation.isPending;

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Mock messages for when no backend conversation exists yet
  const mockMessages = [
    {
      id: 1,
      content: `Hi! I'm ${
        mentorName || "your mentor"
      }. How can I help you with your career goals?`,
      sender: {
        id: mentorId,
        first_name: mentorName ? mentorName.split(" ")[0] : "Mentor",
      },
      timestamp: new Date().toISOString(),
      is_read: true,
    },
  ];

  const displayMessages =
    messages.length > 0 ? messages : conversationId ? [] : mockMessages;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="font-medium text-gray-600">
                {mentorName
                  ? mentorName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                  : "M"}
              </span>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">
                {mentorName || "Mentor"}
              </h2>
              <span className="text-sm text-[#125B66]">Online</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={onBookSession}>
              <Video className="w-4 h-4 mr-2" />
              Book Session
            </Button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {displayMessages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>Start a conversation with {mentorName || "your mentor"}</p>
            </div>
          ) : (
            displayMessages.map((message: any) => {
              const isFromMentor = message.sender.id === mentorUserId;
              return (
                <div
                  key={message.id}
                  className={`flex ${
                    isFromMentor ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      isFromMentor
                        ? "bg-gray-100 text-gray-900"
                        : "bg-primary-600 text-white"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isFromMentor ? "text-gray-500" : "text-primary-100"
                      }`}
                    >
                      {formatTime(message.created_at || message.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />

          {/* Loading states */}
          {(startConversationMutation.isPending ||
            sendMessageMutation.isPending) && (
            <div className="flex justify-end">
              <div className="bg-primary-600 text-white px-4 py-2 rounded-lg max-w-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <div
                    className="w-2 h-2 bg-white rounded-full animate-pulse"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-white rounded-full animate-pulse"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Message Input */}
        <form
          onSubmit={handleSendMessage}
          className="p-4 border-t border-gray-200"
        >
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <Button type="submit" disabled={!newMessage.trim() || isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
