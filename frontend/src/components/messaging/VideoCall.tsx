import React, { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { bookingApi } from "../../api/messaging";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Settings,
  Users,
  MessageSquare,
  Share,
  X,
} from "lucide-react";
import { Button } from "../ui";

interface VideoCallProps {
  sessionId: number;
  isOpen: boolean;
  onClose: () => void;
}

interface CallState {
  isVideoOn: boolean;
  isAudioOn: boolean;
  isConnected: boolean;
  participants: number;
  duration: number;
}

export const VideoCall: React.FC<VideoCallProps> = ({
  sessionId,
  isOpen,
  onClose,
}) => {
  const [callState, setCallState] = useState<CallState>({
    isVideoOn: true,
    isAudioOn: true,
    isConnected: false,
    participants: 1,
    duration: 0,
  });
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<
    Array<{
      id: string;
      sender: string;
      message: string;
      timestamp: Date;
    }>
  >([]);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const durationIntervalRef = useRef<number | null>(null);

  // Fetch session details
  const { data: sessionData } = useQuery({
    queryKey: ["booking-session", sessionId],
    queryFn: () => bookingApi.getBooking(sessionId),
    enabled: isOpen,
  });

  const session = sessionData?.data;

  // Join call mutation
  const joinCallMutation = useMutation({
    mutationFn: () => bookingApi.joinSession(sessionId),
    onSuccess: (response) => {
      // In a real implementation, this would connect to the video service
      console.log("Joined call:", response.data);
      setCallState((prev) => ({ ...prev, isConnected: true }));
      startDurationTimer();
    },
  });

  // Leave call mutation
  const leaveCallMutation = useMutation({
    mutationFn: () => bookingApi.endSession(sessionId),
    onSuccess: () => {
      setCallState((prev) => ({ ...prev, isConnected: false }));
      stopDurationTimer();
      onClose();
    },
  });

  const startDurationTimer = () => {
    durationIntervalRef.current = setInterval(() => {
      setCallState((prev) => ({ ...prev, duration: prev.duration + 1 }));
    }, 1000);
  };

  const stopDurationTimer = () => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
  };

  const toggleVideo = () => {
    setCallState((prev) => ({ ...prev, isVideoOn: !prev.isVideoOn }));
    // In real implementation, toggle video stream
  };

  const toggleAudio = () => {
    setCallState((prev) => ({ ...prev, isAudioOn: !prev.isAudioOn }));
    // In real implementation, toggle audio stream
  };

  const handleJoinCall = () => {
    joinCallMutation.mutate();
  };

  const handleLeaveCall = () => {
    leaveCallMutation.mutate();
  };

  const sendChatMessage = () => {
    if (!chatMessage.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      sender: "You",
      message: chatMessage,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, newMessage]);
    setChatMessage("");
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopDurationTimer();
    };
  }, []);

  // Initialize local video stream
  useEffect(() => {
    if (isOpen && localVideoRef.current) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch((err) => console.error("Error accessing media devices:", err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <div className="w-full h-full flex flex-col">
        {/* Header */}
        <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold">
              {session?.title || "Video Call"}
            </h2>
            {session?.mentor && (
              <span className="text-gray-300">
                with {session.mentor.first_name} {session.mentor.last_name}
              </span>
            )}
            {callState.isConnected && (
              <span className="text-green-400 text-sm">
                {formatDuration(callState.duration)}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span className="text-sm">{callState.participants}</span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Video Area */}
        <div className="flex-1 relative bg-gray-900">
          {/* Remote Video */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
            style={{ display: callState.isConnected ? "block" : "none" }}
          />

          {/* Waiting State */}
          {!callState.isConnected && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Waiting for mentor to join...
                </h3>
                <p className="text-gray-300 mb-6">
                  Your session will start shortly
                </p>
                <Button
                  onClick={handleJoinCall}
                  disabled={joinCallMutation.isPending}
                >
                  {joinCallMutation.isPending ? "Joining..." : "Join Call"}
                </Button>
              </div>
            </div>
          )}

          {/* Local Video (Picture-in-Picture) */}
          <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ display: callState.isVideoOn ? "block" : "none" }}
            />
            {!callState.isVideoOn && (
              <div className="w-full h-full flex items-center justify-center">
                <VideoOff className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>

          {/* Chat Panel */}
          {showChat && (
            <div className="absolute top-0 right-0 w-80 h-full bg-white shadow-lg flex flex-col">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold">Chat</h3>
                <button
                  onClick={() => setShowChat(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="text-sm">
                    <div className="font-medium text-gray-900">
                      {msg.sender}
                    </div>
                    <div className="text-gray-600">{msg.message}</div>
                    <div className="text-xs text-gray-400">
                      {msg.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-200 flex space-x-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendChatMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <Button size="sm" onClick={sendChatMessage}>
                  Send
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="bg-gray-900 p-4 flex items-center justify-center space-x-6">
          <button
            onClick={toggleAudio}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              callState.isAudioOn
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-red-600 hover:bg-red-700 text-white"
            }`}
          >
            {callState.isAudioOn ? (
              <Mic className="w-6 h-6" />
            ) : (
              <MicOff className="w-6 h-6" />
            )}
          </button>

          <button
            onClick={toggleVideo}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              callState.isVideoOn
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-red-600 hover:bg-red-700 text-white"
            }`}
          >
            {callState.isVideoOn ? (
              <Video className="w-6 h-6" />
            ) : (
              <VideoOff className="w-6 h-6" />
            )}
          </button>

          <button
            onClick={() => setShowChat(!showChat)}
            className="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center transition-colors"
          >
            <MessageSquare className="w-6 h-6" />
          </button>

          <button className="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center transition-colors">
            <Share className="w-6 h-6" />
          </button>

          <button className="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center transition-colors">
            <Settings className="w-6 h-6" />
          </button>

          <button
            onClick={handleLeaveCall}
            disabled={leaveCallMutation.isPending}
            className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
