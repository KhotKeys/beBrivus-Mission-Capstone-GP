import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  ScreenShare,
  ScreenShareOff,
  MessageCircle,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Button } from "../ui";

interface VideoCallProps {
  sessionId: string;
  isInitiator?: boolean;
  onCallEnd?: () => void;
  participantName?: string;
}

interface PeerConnection {
  pc: RTCPeerConnection;
  remoteStream?: MediaStream;
}

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: Date;
}

const VideoCall: React.FC<VideoCallProps> = ({
  sessionId,
  isInitiator = false,
  onCallEnd,
  participantName = "Participant",
}) => {
  // Video and Audio streams
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  // State management
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("connecting");

  // UI State
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // ICE configuration for STUN/TURN servers
  const iceConfiguration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      // Add TURN servers for production
      // {
      //   urls: 'turn:your-turn-server.com:3478',
      //   username: 'username',
      //   credential: 'password'
      // }
    ],
  };

  // WebSocket connection for signaling
  const connectWebSocket = useCallback(() => {
    // Use current host for WebSocket connection (localhost in dev, production in prod)
    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsHost = window.location.host;
    const wsUrl = `${wsProtocol}//${wsHost}/ws/video-call/${sessionId}/`;

    socketRef.current = new WebSocket(wsUrl);

    socketRef.current.onopen = () => {
      console.log("WebSocket connected");
      setConnectionStatus("connecting");
    };

    socketRef.current.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      await handleSignalingData(data);
    };

    socketRef.current.onclose = () => {
      console.log("WebSocket disconnected");
      setConnectionStatus("disconnected");
    };

    socketRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      setConnectionStatus("disconnected");
    };
  }, [sessionId]);

  // Initialize peer connection
  const initializePeerConnection = useCallback(() => {
    peerConnectionRef.current = new RTCPeerConnection(iceConfiguration);

    const pc = peerConnectionRef.current;

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current?.readyState === WebSocket.OPEN) {
        sendSignalingData({
          type: "ice-candidate",
          candidate: event.candidate,
        });
      }
    };

    // Handle remote stream
    pc.ontrack = (event) => {
      console.log("Received remote stream");
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setIsConnected(true);
        setConnectionStatus("connected");
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log("Connection state:", pc.connectionState);
      if (pc.connectionState === "connected") {
        setIsConnected(true);
        setConnectionStatus("connected");
      } else if (
        pc.connectionState === "disconnected" ||
        pc.connectionState === "failed"
      ) {
        setIsConnected(false);
        setConnectionStatus("disconnected");
      }
    };

    return pc;
  }, []);

  // Get user media (camera and microphone)
  const initializeLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Add tracks to peer connection
      if (peerConnectionRef.current) {
        stream.getTracks().forEach((track) => {
          peerConnectionRef.current?.addTrack(track, stream);
        });
      }

      return stream;
    } catch (error) {
      console.error("Error accessing user media:", error);
      throw error;
    }
  }, []);

  // Send signaling data through WebSocket
  const sendSignalingData = useCallback(
    (data: any) => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            ...data,
            sessionId,
          })
        );
      }
    },
    [sessionId]
  );

  // Handle incoming signaling data
  const handleSignalingData = useCallback(
    async (data: any) => {
      const pc = peerConnectionRef.current;
      if (!pc) return;

      try {
        switch (data.type) {
          case "offer":
            await pc.setRemoteDescription(
              new RTCSessionDescription(data.offer)
            );
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            sendSignalingData({
              type: "answer",
              answer: answer,
            });
            break;

          case "answer":
            await pc.setRemoteDescription(
              new RTCSessionDescription(data.answer)
            );
            break;

          case "ice-candidate":
            if (data.candidate) {
              await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
            break;

          case "chat":
            setChatMessages((prev) => [
              ...prev,
              {
                id: Date.now().toString(),
                sender: data.sender || "Remote",
                message: data.message,
                timestamp: new Date(),
              },
            ]);
            break;

          case "user-joined":
            console.log("User joined the call");
            break;

          case "user-left":
            console.log("User left the call");
            setIsConnected(false);
            break;
        }
      } catch (error) {
        console.error("Error handling signaling data:", error);
      }
    },
    [sendSignalingData]
  );

  // Create and send offer (for call initiator)
  const createOffer = useCallback(async () => {
    const pc = peerConnectionRef.current;
    if (!pc) return;

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendSignalingData({
        type: "offer",
        offer: offer,
      });
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  }, [sendSignalingData]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    const stream = localStreamRef.current;
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  }, []);

  // Toggle video
  const toggleVideo = useCallback(() => {
    const stream = localStreamRef.current;
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  }, []);

  // Screen sharing
  const toggleScreenShare = useCallback(async () => {
    const pc = peerConnectionRef.current;
    if (!pc || !localStreamRef.current) return;

    try {
      if (isScreenSharing) {
        // Stop screen sharing, return to camera
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Replace tracks in peer connection
        const videoTrack = stream.getVideoTracks()[0];
        const sender = pc
          .getSenders()
          .find((s) => s.track && s.track.kind === "video");
        if (sender && videoTrack) {
          await sender.replaceTrack(videoTrack);
        }

        setIsScreenSharing(false);
      } else {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        // Replace video track in peer connection
        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = pc
          .getSenders()
          .find((s) => s.track && s.track.kind === "video");
        if (sender && videoTrack) {
          await sender.replaceTrack(videoTrack);
        }

        // Handle screen share ending
        videoTrack.onended = async () => {
          await toggleScreenShare();
        };

        setIsScreenSharing(true);
      }
    } catch (error) {
      console.error("Error toggling screen share:", error);
    }
  }, [isScreenSharing]);

  // Send chat message
  const sendChatMessage = useCallback(() => {
    if (newMessage.trim() && socketRef.current?.readyState === WebSocket.OPEN) {
      sendSignalingData({
        type: "chat",
        message: newMessage,
        sender: "You",
      });

      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "You",
          message: newMessage,
          timestamp: new Date(),
        },
      ]);

      setNewMessage("");
    }
  }, [newMessage, sendSignalingData]);

  // End call
  const endCall = useCallback(() => {
    // Clean up streams
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    // Close WebSocket
    if (socketRef.current) {
      socketRef.current.close();
    }

    // Notify parent component
    if (onCallEnd) {
      onCallEnd();
    }
  }, [onCallEnd]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Initialize call
  useEffect(() => {
    const initializeCall = async () => {
      try {
        // Connect to WebSocket
        connectWebSocket();

        // Initialize peer connection
        initializePeerConnection();

        // Get user media
        await initializeLocalStream();

        // If this is the initiator, create offer after short delay
        if (isInitiator) {
          setTimeout(() => {
            createOffer();
          }, 1000);
        }
      } catch (error) {
        console.error("Error initializing call:", error);
        setConnectionStatus("disconnected");
      }
    };

    initializeCall();

    // Cleanup on unmount
    return () => {
      endCall();
    };
  }, []);

  // Auto-hide controls
  useEffect(() => {
    let timeout: number;

    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = window.setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    if (isConnected) {
      document.addEventListener("mousemove", handleMouseMove);
      timeout = window.setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(timeout);
    };
  }, [isConnected]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div
        className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/50 to-transparent p-4 z-10 transition-opacity duration-300 ${
          showControls || !isConnected ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <div
              className={`w-3 h-3 rounded-full ${
                connectionStatus === "connected"
                  ? "bg-success-500"
                  : connectionStatus === "connecting"
                  ? "bg-warning-500"
                  : "bg-error-500"
              }`}
            />
            <span className="font-medium">
              {connectionStatus === "connected"
                ? `Connected with ${participantName}`
                : connectionStatus === "connecting"
                ? "Connecting..."
                : "Disconnected"}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={toggleFullscreen}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              {isFullscreen ? (
                <Minimize2 className="w-5 h-5" />
              ) : (
                <Maximize2 className="w-5 h-5" />
              )}
            </Button>

            <Button
              onClick={() => setShowChat(!showChat)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 relative"
            >
              <MessageCircle className="w-5 h-5" />
              {chatMessages.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {chatMessages.length}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Video Container */}
      <div className="flex-1 relative">
        {/* Remote Video (Full Screen) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
          style={{ display: isConnected ? "block" : "none" }}
        />

        {/* Connection Status Overlay */}
        {!isConnected && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-900">
            <div className="text-center text-white">
              {connectionStatus === "connecting" && (
                <>
                  <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    Connecting to {participantName}...
                  </h3>
                  <p className="text-neutral-300">
                    Please wait while we establish the connection
                  </p>
                </>
              )}
              {connectionStatus === "disconnected" && (
                <>
                  <div className="w-16 h-16 bg-error-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <PhoneOff className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    Connection Lost
                  </h3>
                  <p className="text-neutral-300 mb-6">
                    Unable to connect to the other participant. Please check:
                  </p>
                  <ul className="text-neutral-300 text-sm mb-6 space-y-2">
                    <li>✓ Your internet connection is stable</li>
                    <li>✓ Camera and microphone permissions are granted</li>
                    <li>✓ The session ID is correct</li>
                    <li>✓ The other participant is online</li>
                  </ul>
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-primary-600 hover:bg-primary-700 px-6 py-2 rounded text-white font-medium"
                  >
                    Try Again
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Local Video (Picture-in-Picture) */}
        <div
          className={`absolute top-4 right-4 w-64 h-48 bg-neutral-800 rounded-lg overflow-hidden border-2 border-white/20 shadow-lg transition-opacity duration-300 ${
            showControls || !isConnected ? "opacity-100" : "opacity-50"
          }`}
        >
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          {!isVideoEnabled && (
            <div className="absolute inset-0 bg-neutral-800 flex items-center justify-center">
              <VideoOff className="w-8 h-8 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 transition-opacity duration-300 ${
          showControls || !isConnected ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex items-center justify-center space-x-4">
          <Button
            onClick={toggleAudio}
            className={`w-14 h-14 rounded-full ${
              isAudioEnabled
                ? "bg-neutral-600 hover:bg-neutral-700"
                : "bg-error-500 hover:bg-error-600"
            }`}
          >
            {isAudioEnabled ? (
              <Mic className="w-6 h-6 text-white" />
            ) : (
              <MicOff className="w-6 h-6 text-white" />
            )}
          </Button>

          <Button
            onClick={toggleVideo}
            className={`w-14 h-14 rounded-full ${
              isVideoEnabled
                ? "bg-neutral-600 hover:bg-neutral-700"
                : "bg-error-500 hover:bg-error-600"
            }`}
          >
            {isVideoEnabled ? (
              <Video className="w-6 h-6 text-white" />
            ) : (
              <VideoOff className="w-6 h-6 text-white" />
            )}
          </Button>

          <Button
            onClick={toggleScreenShare}
            className={`w-14 h-14 rounded-full ${
              isScreenSharing
                ? "bg-primary-500 hover:bg-primary-600"
                : "bg-neutral-600 hover:bg-neutral-700"
            }`}
          >
            {isScreenSharing ? (
              <ScreenShareOff className="w-6 h-6 text-white" />
            ) : (
              <ScreenShare className="w-6 h-6 text-white" />
            )}
          </Button>

          <Button
            onClick={endCall}
            className="w-14 h-14 rounded-full bg-error-500 hover:bg-error-600"
          >
            <PhoneOff className="w-6 h-6 text-white" />
          </Button>
        </div>
      </div>

      {/* Chat Panel */}
      {showChat && (
        <div className="absolute top-0 right-0 w-80 h-full bg-white border-l border-neutral-200 flex flex-col z-20">
          <div className="p-4 border-b border-neutral-200">
            <h3 className="font-semibold text-secondary-900">Chat</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`${
                  msg.sender === "You" ? "text-right" : "text-left"
                }`}
              >
                <div
                  className={`inline-block max-w-xs px-3 py-2 rounded-lg ${
                    msg.sender === "You"
                      ? "bg-primary-500 text-white"
                      : "bg-neutral-100 text-neutral-900"
                  }`}
                >
                  <p className="text-sm">{msg.message}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.sender === "You"
                        ? "text-primary-100"
                        : "text-neutral-500"
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-neutral-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendChatMessage()}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <Button
                onClick={sendChatMessage}
                className="bg-primary-500 hover:bg-primary-600"
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCall;
