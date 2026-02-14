import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import VideoCall from "../components/video/VideoCall";
import { PhoneOff } from "lucide-react";

const VideoCallPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const handleCallEnd = () => {
    navigate("/mentors");
  };

  if (!sessionId) {
    return (
      <div className="fixed inset-0 bg-neutral-900 flex items-center justify-center z-50">
        <div className="text-center text-white">
          <div className="w-16 h-16 bg-error-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <PhoneOff className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Invalid Session</h1>
          <p className="text-neutral-300 mb-6">No session ID provided</p>
          <button
            onClick={() => navigate("/mentors")}
            className="bg-primary-600 hover:bg-primary-700 px-6 py-3 rounded-lg text-white font-medium transition-colors"
          >
            Go to Mentors
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0">
      <VideoCall
        sessionId={sessionId}
        isInitiator={true}
        onCallEnd={handleCallEnd}
        participantName="Mentor"
      />
    </div>
  );
};

export default VideoCallPage;
