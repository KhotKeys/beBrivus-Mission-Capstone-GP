import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mentorApi, type MentorSession } from "../api/mentors";
import apiClient from "../api/client";
import { Layout } from "../components/layout";
import { Button } from "../components/ui";
import { useLanguage } from "../hooks/useLanguage";
import {
  Calendar,
  Clock,
  Users,
  Video,
  MessageCircle,
  CheckCircle,
  XCircle,
  Play,
  Square,
  User,
  Award,
  TrendingUp,
  FileText,
} from "lucide-react";
import { notificationsApi, type NotificationItem } from "../api/notifications";
import { MentorHero } from "../components/mentor/MentorHero";

interface Mentee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  profile_picture?: string;
  total_sessions: number;
  completed_sessions: number;
  last_session?: string;
  next_session?: string;
}

const MentorDashboard: React.FC = () => {
  useLanguage();
  
  const [activeTab, setActiveTab] = useState<
    "overview" | "pending" | "upcoming" | "mentees" | "history" | "sessions"
  >("overview");

  const [selectedSession, setSelectedSession] = useState<MentorSession | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [mentorNotes, setMentorNotes] = useState("");
  const [meetingLink, setMeetingLink] = useState("");

  const queryClient = useQueryClient();

  // Fetch mentor's sessions - always enabled, refetch on mount
  const { data: pendingSessions, isLoading: pendingLoading } = useQuery<MentorSession[]>({
    queryKey: ["mentor-pending-sessions"],
    queryFn: () => mentorApi.getPendingSessions(),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const { data: upcomingSessions, isLoading: upcomingLoading } = useQuery<MentorSession[]>({
    queryKey: ["mentor-upcoming-sessions"],
    queryFn: () => mentorApi.getUpcomingSessions(),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const { data: mySessionsData } = useQuery({
    queryKey: ["mentor-my-sessions-new"],
    queryFn: () => apiClient.get('/mentors/dashboard/my_sessions/').then(r => r.data),
    staleTime: 0,
    refetchInterval: 30000,
  });

  const { data: mentees, isLoading: menteesLoading } = useQuery<Mentee[]>({
    queryKey: ["mentor-mentees"],
    queryFn: () => mentorApi.getMyMentees(),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const { data: notificationsData } = useQuery({
    queryKey: ["mentor-notifications"],
    queryFn: () => notificationsApi.list("unread"),
    enabled: activeTab === "overview",
  });

  const notificationsPayload = notificationsData?.data;
  const notifications: NotificationItem[] = Array.isArray(notificationsPayload)
    ? notificationsPayload
    : (notificationsPayload as unknown as { results?: NotificationItem[] })?.results || [];

  // Mutations
  const confirmSessionMutation = useMutation({
    mutationFn: (data: {
      session_id: number;
      mentor_notes?: string;
      meeting_link?: string;
    }) => mentorApi.confirmSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentor-pending-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["mentor-upcoming-sessions"] });
      setShowConfirmDialog(false);
      setSelectedSession(null);
      setMentorNotes("");
      setMeetingLink("");
    },
  });

  const rejectSessionMutation = useMutation({
    mutationFn: (data: { session_id: number; mentor_notes?: string }) =>
      mentorApi.rejectSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentor-pending-sessions"] });
      setShowRejectDialog(false);
      setSelectedSession(null);
      setMentorNotes("");
    },
  });

  const startSessionMutation = useMutation({
    mutationFn: (sessionId: number) =>
      mentorApi.startSession({ session_id: sessionId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentor-upcoming-sessions"] });
    },
  });

  const endSessionMutation = useMutation({
    mutationFn: (data: { session_id: number; mentor_notes?: string }) =>
      mentorApi.endSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentor-upcoming-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["mentor-all-sessions"] });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "requested":
        return "bg-warning-100 text-warning-800 border-warning-200";
      case "scheduled":
        return "bg-primary-100 text-primary-800 border-primary-200";
      case "in_progress":
        return "bg-success-100 text-success-800 border-success-200";
      case "completed":
        return "bg-success-100 text-success-800 border-success-200";
      case "cancelled":
        return "bg-error-100 text-error-800 border-error-200";
      case "rejected":
        return "bg-error-100 text-error-800 border-error-200";
      default:
        return "bg-neutral-100 text-neutral-800 border-neutral-200";
    }
  };

  const getSessionTypeIcon = (sessionType: string) => {
    switch (sessionType) {
      case "video":
        return <Video className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />;
      case "chat":
        return <MessageCircle className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />;
      default:
        return <Calendar className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />;
    }
  };

  const getMenteeName = (session: MentorSession) => {
    return session.mentee_name || "Mentee";
  };

  const getSessionDateTime = (session: MentorSession) => {
    // Use session_date field (which comes from scheduled_start in backend)
    if (session.session_date) {
      try {
        const date = new Date(session.session_date);
        if (!isNaN(date.getTime())) {
          return date;
        }
      } catch (e) {
        console.error('Failed to parse session_date:', session.session_date, e);
      }
    }
    
    // Fallback to scheduled_start
    if (session.scheduled_start) {
      try {
        const date = new Date(session.scheduled_start);
        if (!isNaN(date.getTime())) {
          return date;
        }
      } catch (e) {
        console.error('Failed to parse scheduled_start:', session.scheduled_start, e);
      }
    }
    
    return null;
  };

  const handleConfirmSession = () => {
    if (!selectedSession) return;

    confirmSessionMutation.mutate({
      session_id: selectedSession.id,
      mentor_notes: mentorNotes,
      meeting_link: meetingLink,
    });
  };

  const handleRejectSession = () => {
    if (!selectedSession) return;

    rejectSessionMutation.mutate({
      session_id: selectedSession.id,
      mentor_notes: mentorNotes,
    });
  };

  const handleStartSession = (session: MentorSession) => {
    startSessionMutation.mutate(session.id);
    // Open the Google Meet meeting link in a new tab
    if (session.meeting_link) {
      window.open(session.meeting_link, '_blank', 'noopener,noreferrer');
    } else {
      alert('Meeting link not yet available. Please wait for the mentor to provide the meeting link.');
    }
  };

  const renderOverviewTab = () => {
    const allSessionsCount = (mySessionsData?.total || 0);
    const completedSessions = (mySessionsData?.past || []).length;
    const totalMentees = mentees?.length || 0;
    const pendingCount = pendingSessions?.length || 0;
    const upcomingCount = upcomingSessions?.length || 0;

    return (
      <div className="space-y-3 xs:space-y-4 sm:space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2 xs:gap-3 sm:gap-4">
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg xs:rounded-xl p-2 xs:p-3 sm:p-4 lg:p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] xs:text-[10px] sm:text-xs lg:text-sm text-primary-100">Total Mentees</p>
                <p className="text-base xs:text-xl sm:text-2xl lg:text-3xl font-bold">{totalMentees}</p>
              </div>
              <Users className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 text-primary-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-lg xs:rounded-xl p-2 xs:p-3 sm:p-4 lg:p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] xs:text-[10px] sm:text-xs lg:text-sm text-secondary-100">Total Sessions</p>
                <p className="text-base xs:text-xl sm:text-2xl lg:text-3xl font-bold">{allSessionsCount}</p>
              </div>
              <Award className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 text-secondary-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-success-500 to-success-600 rounded-lg xs:rounded-xl p-2 xs:p-3 sm:p-4 lg:p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] xs:text-[10px] sm:text-xs lg:text-sm text-success-100">Completed</p>
                <p className="text-base xs:text-xl sm:text-2xl lg:text-3xl font-bold">{completedSessions}</p>
              </div>
              <CheckCircle className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 text-success-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-warning-500 to-warning-600 rounded-lg xs:rounded-xl p-2 xs:p-3 sm:p-4 lg:p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] xs:text-[10px] sm:text-xs lg:text-sm text-warning-100">Pending</p>
                <p className="text-base xs:text-xl sm:text-2xl lg:text-3xl font-bold">{pendingCount}</p>
              </div>
              <Clock className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 text-warning-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg xs:rounded-xl p-2 xs:p-3 sm:p-4 lg:p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] xs:text-[10px] sm:text-xs lg:text-sm text-emerald-100">Upcoming</p>
                <p className="text-base xs:text-xl sm:text-2xl lg:text-3xl font-bold">{upcomingCount}</p>
              </div>
              <TrendingUp className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 text-emerald-200" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 xs:gap-4 sm:gap-6">
          {/* Pending Sessions */}
          <div className="bg-white rounded-lg xs:rounded-xl shadow-sm border border-neutral-200 p-2 xs:p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between mb-2 xs:mb-3 sm:mb-4">
              <h3 className="text-xs xs:text-sm sm:text-base lg:text-lg font-bold text-secondary-900">
                Pending Approvals
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("pending")}
                className="text-primary-600 hover:text-primary-700 text-[8px] xs:text-[10px] sm:text-xs px-1 xs:px-2 sm:px-3 py-0.5 xs:py-1"
              >
                View All
              </Button>
            </div>
            <div className="space-y-1.5 xs:space-y-2 sm:space-y-3">
              {(pendingSessions?.slice(0, 3) || []).map((session: MentorSession) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-1.5 xs:p-2 sm:p-3 bg-warning-50 rounded-md xs:rounded-lg border border-warning-200"
                >
                  <div className="flex items-center space-x-1.5 xs:space-x-2 sm:space-x-3">
                    <div className="w-6 h-6 xs:w-8 xs:h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-warning-500 to-warning-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                      <User className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-secondary-900 text-[9px] xs:text-[11px] sm:text-sm truncate">
                        {getMenteeName(session)}
                      </p>
                      <p className="text-[8px] xs:text-[10px] sm:text-xs text-neutral-600 truncate">
                        {getSessionDateTime(session)?.toLocaleDateString() || "TBD"}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-1 xs:space-x-1.5 sm:space-x-2 flex-shrink-0">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedSession(session);
                        setShowConfirmDialog(true);
                      }}
                      className="bg-success-600 hover:bg-success-700 p-1 xs:p-1.5 sm:p-2"
                    >
                      <CheckCircle className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedSession(session);
                        setShowRejectDialog(true);
                      }}
                      className="border-error-300 text-error-600 hover:bg-error-50 p-1 xs:p-1.5 sm:p-2"
                    >
                      <XCircle className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {pendingCount === 0 && (
                <p className="text-neutral-500 text-center py-2 xs:py-3 sm:py-4 text-[9px] xs:text-xs sm:text-sm">
                  No pending sessions
                </p>
              )}
            </div>
          </div>

          {/* Upcoming Sessions */}
          <div className="bg-white rounded-lg xs:rounded-xl shadow-sm border border-neutral-200 p-2 xs:p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between mb-2 xs:mb-3 sm:mb-4">
              <h3 className="text-xs xs:text-sm sm:text-base lg:text-lg font-bold text-secondary-900">
                Upcoming Sessions
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("upcoming")}
                className="text-primary-600 hover:text-primary-700 text-[8px] xs:text-[10px] sm:text-xs px-1 xs:px-2 sm:px-3 py-0.5 xs:py-1"
              >
                View All
              </Button>
            </div>
            <div className="space-y-1.5 xs:space-y-2 sm:space-y-3">
              {(upcomingSessions?.slice(0, 3) || []).map((session: MentorSession) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-1.5 xs:p-2 sm:p-3 bg-primary-50 rounded-md xs:rounded-lg border border-primary-200"
                >
                  <div className="flex items-center space-x-1.5 xs:space-x-2 sm:space-x-3">
                    <div className="w-6 h-6 xs:w-8 xs:h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                      {getSessionTypeIcon(session.session_type)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-secondary-900 text-[9px] xs:text-[11px] sm:text-sm truncate">
                        {getMenteeName(session)}
                      </p>
                      <p className="text-[8px] xs:text-[10px] sm:text-xs text-neutral-600 truncate">
                        {getSessionDateTime(session)?.toLocaleString() || "TBD"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 xs:space-x-1.5 sm:space-x-2 flex-shrink-0">
                    {session.status === "confirmed" && (
                      <Button
                        size="sm"
                        onClick={() => handleStartSession(session)}
                        disabled={
                          (getSessionDateTime(session)?.getTime() ?? 0) -
                            Date.now() >
                          10 * 60 * 1000
                        }
                        className="bg-success-600 hover:bg-success-700 p-1 xs:p-1.5 sm:p-2 text-[8px] xs:text-[10px] sm:text-xs"
                      >
                        <Play className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4 xs:mr-0.5 sm:mr-1" />
                        <span className="hidden xs:inline">Start</span>
                      </Button>
                    )}
                    {session.status === "in_progress" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          endSessionMutation.mutate({ session_id: session.id })
                        }
                        className="border-error-300 text-error-600 hover:bg-error-50 p-1 xs:p-1.5 sm:p-2 text-[8px] xs:text-[10px] sm:text-xs"
                      >
                        <Square className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4 xs:mr-0.5 sm:mr-1" />
                        <span className="hidden xs:inline">End</span>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {upcomingCount === 0 && (
                <p className="text-neutral-500 text-center py-2 xs:py-3 sm:py-4 text-[9px] xs:text-xs sm:text-sm">
                  No upcoming sessions
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg xs:rounded-xl border border-neutral-200 p-2 xs:p-3 sm:p-4 lg:p-6">
          <div className="flex items-center justify-between mb-2 xs:mb-3 sm:mb-4">
            <h3 className="text-xs xs:text-sm sm:text-base lg:text-lg font-semibold text-neutral-900">Notifications</h3>
            <button
              className="text-[8px] xs:text-[10px] sm:text-xs text-primary-600 hover:text-primary-700"
              onClick={async () => {
                await notificationsApi.markAllRead();
                queryClient.invalidateQueries({ queryKey: ["mentor-notifications"] });
              }}
            >
              Mark all read
            </button>
          </div>
          {notifications.length === 0 ? (
            <p className="text-[9px] xs:text-xs sm:text-sm text-neutral-500">No new notifications.</p>
          ) : (
            <div className="space-y-1.5 xs:space-y-2 sm:space-y-3">
              {notifications.slice(0, 5).map((item) => (
                <button
                  key={item.id}
                  className="w-full text-left border border-neutral-100 rounded-md xs:rounded-lg p-1.5 xs:p-2 sm:p-3 hover:bg-neutral-50"
                  onClick={async () => {
                    if (!item.read_at) {
                      await notificationsApi.markRead(item.id);
                    }
                  }}
                >
                  <p className="text-[9px] xs:text-xs sm:text-sm font-semibold text-neutral-900">
                    {item.title}
                  </p>
                  <p className="text-[8px] xs:text-[10px] sm:text-xs text-neutral-600 mt-0.5 xs:mt-1">{item.body}</p>
                  <p className="text-[8px] xs:text-[10px] sm:text-xs text-neutral-400 mt-1 xs:mt-2">
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPendingTab = () => {
    if (pendingLoading) {
      return (
        <div className="flex items-center justify-center py-4 xs:py-6 sm:py-8">
          <div className="animate-spin rounded-full h-5 w-5 xs:h-6 xs:w-6 sm:h-8 sm:w-8 border-b-2 border-primary-600"></div>
        </div>
      );
    }

    return (
      <div className="space-y-2 xs:space-y-3 sm:space-y-4">
        <h2 className="text-sm xs:text-lg sm:text-xl lg:text-2xl font-bold text-secondary-900 mb-3 xs:mb-4 sm:mb-6">
          Pending Sessions
        </h2>

        {(pendingSessions || []).map((session: MentorSession) => (
          <div
            key={session.id}
            className="bg-white rounded-lg xs:rounded-xl shadow-sm border border-neutral-200 p-2 xs:p-3 sm:p-4 lg:p-6"
          >
            <div className="flex items-start justify-between mb-2 xs:mb-3 sm:mb-4">
              <div className="flex items-center space-x-2 xs:space-x-3 sm:space-x-4">
                <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-warning-500 to-warning-600 rounded-lg xs:rounded-xl flex items-center justify-center text-white flex-shrink-0">
                  <User className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs xs:text-sm sm:text-base lg:text-xl font-bold text-secondary-900 truncate">
                    {getMenteeName(session)}
                  </h3>
                  <div className="flex items-center space-x-2 xs:space-x-3 sm:space-x-4 mt-1 xs:mt-1.5 sm:mt-2 text-[8px] xs:text-[10px] sm:text-xs lg:text-sm text-neutral-500">
                    <span className="flex items-center space-x-0.5 xs:space-x-1">
                      <Calendar className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">
                        {getSessionDateTime(session)?.toLocaleDateString() || "TBD"}
                      </span>
                    </span>
                    <span className="flex items-center space-x-0.5 xs:space-x-1">
                      <Clock className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">
                        {getSessionDateTime(session)?.toLocaleTimeString() || "TBD"}
                      </span>
                    </span>
                    <span className="hidden sm:flex items-center space-x-1">
                      {getSessionTypeIcon(session.session_type)}
                      <span>{session.session_type}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col xs:flex-row space-y-1 xs:space-y-0 xs:space-x-1 sm:space-x-2 flex-shrink-0">
                <Button
                  onClick={() => {
                    setSelectedSession(session);
                    setShowConfirmDialog(true);
                  }}
                  className="bg-success-600 hover:bg-success-700 p-1 xs:p-1.5 sm:p-2 text-[8px] xs:text-[10px] sm:text-xs"
                >
                  <CheckCircle className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4 xs:mr-1 sm:mr-2" />
                  <span className="hidden xs:inline">Accept</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedSession(session);
                    setShowRejectDialog(true);
                  }}
                  className="border-error-300 text-error-600 hover:bg-error-50 p-1 xs:p-1.5 sm:p-2 text-[8px] xs:text-[10px] sm:text-xs"
                >
                  <XCircle className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4 xs:mr-1 sm:mr-2" />
                  <span className="hidden xs:inline">Decline</span>
                </Button>
              </div>
            </div>

            {(session.notes || session.agenda) && (
              <div className="bg-neutral-50 rounded-md xs:rounded-lg p-2 xs:p-3 sm:p-4 mt-2 xs:mt-3 sm:mt-4">
                {session.notes && (
                  <>
                    <p className="text-[8px] xs:text-[10px] sm:text-xs lg:text-sm text-neutral-500 mb-0.5 xs:mb-1">Mentee Notes:</p>
                    <p className="text-[9px] xs:text-xs sm:text-sm lg:text-base text-secondary-700">{session.notes}</p>
                  </>
                )}
                {session.agenda && (
                  <>
                    <p className="text-[8px] xs:text-[10px] sm:text-xs lg:text-sm text-neutral-500 mt-2 mb-0.5 xs:mb-1">Session Agenda:</p>
                    <p className="text-[9px] xs:text-xs sm:text-sm lg:text-base text-secondary-700">{session.agenda}</p>
                  </>
                )}
              </div>
            )}
          </div>
        ))}

        {(pendingSessions || []).length === 0 && (
          <div className="text-center py-6 xs:py-8 sm:py-12">
            <Clock className="w-10 h-10 xs:w-12 xs:h-12 sm:w-16 sm:h-16 mx-auto text-neutral-300 mb-2 xs:mb-3 sm:mb-4" />
            <h3 className="text-xs xs:text-sm sm:text-base lg:text-lg font-semibold text-neutral-900 mb-1 xs:mb-1.5 sm:mb-2">
              No Pending Sessions
            </h3>
            <p className="text-[9px] xs:text-xs sm:text-sm text-neutral-500">
              All caught up! You have no sessions waiting for approval.
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderUpcomingTab = () => {
    if (upcomingLoading) {
      return (
        <div className="flex items-center justify-center py-4 xs:py-6 sm:py-8">
          <div className="animate-spin rounded-full h-5 w-5 xs:h-6 xs:w-6 sm:h-8 sm:w-8 border-b-2 border-primary-600"></div>
        </div>
      );
    }

    return (
      <div className="space-y-2 xs:space-y-3 sm:space-y-4">
        <h2 className="text-sm xs:text-lg sm:text-xl lg:text-2xl font-bold text-secondary-900 mb-3 xs:mb-4 sm:mb-6">
          Upcoming Sessions
        </h2>

        {(upcomingSessions || []).map((session: MentorSession) => (
          <div
            key={session.id}
            className="bg-white rounded-lg xs:rounded-xl shadow-sm border border-neutral-200 p-2 xs:p-3 sm:p-4 lg:p-6"
          >
            <div className="flex items-start justify-between mb-2 xs:mb-3 sm:mb-4">
              <div className="flex items-center space-x-2 xs:space-x-3 sm:space-x-4">
                <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-primary-500 to-secondary-600 rounded-lg xs:rounded-xl flex items-center justify-center text-white shadow-md flex-shrink-0">
                  {getSessionTypeIcon(session.session_type)}
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs xs:text-sm sm:text-base lg:text-xl font-bold text-secondary-900 truncate">
                    {getMenteeName(session)}
                  </h3>
                  <div className="flex items-center space-x-2 xs:space-x-3 sm:space-x-4 mt-1 xs:mt-1.5 sm:mt-2 text-[8px] xs:text-[10px] sm:text-xs lg:text-sm text-neutral-500">
                    <span className="flex items-center space-x-0.5 xs:space-x-1">
                      <Calendar className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">
                        {getSessionDateTime(session)?.toLocaleDateString() || "TBD"}
                      </span>
                    </span>
                    <span className="flex items-center space-x-0.5 xs:space-x-1">
                      <Clock className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">
                        {getSessionDateTime(session)?.toLocaleTimeString() || "TBD"}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1 xs:space-x-1.5 sm:space-x-2 flex-shrink-0">
                <span
                  className={`px-1.5 xs:px-2 sm:px-3 py-0.5 xs:py-1 rounded-full text-[8px] xs:text-[10px] sm:text-xs lg:text-sm font-medium border ${getStatusColor(
                    session.status
                  )}`}
                >
                  {session.status.replace("_", " ").toUpperCase()}
                </span>

                {session.status === "scheduled" && (
                  <Button
                    onClick={() => handleStartSession(session)}
                    disabled={
                      (getSessionDateTime(session)?.getTime() ?? 0) -
                        Date.now() >
                      10 * 60 * 1000
                    }
                    className="bg-success-600 hover:bg-success-700 p-1 xs:p-1.5 sm:p-2 text-[8px] xs:text-[10px] sm:text-xs"
                  >
                    <Play className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4 xs:mr-1 sm:mr-2" />
                    <span className="hidden xs:inline">Start Session</span>
                    <span className="xs:hidden">Start</span>
                  </Button>
                )}

                {session.status === "in_progress" && (
                  <Button
                    variant="outline"
                    onClick={() =>
                      endSessionMutation.mutate({ session_id: session.id })
                    }
                    className="border-error-300 text-error-600 hover:bg-error-50 p-1 xs:p-1.5 sm:p-2 text-[8px] xs:text-[10px] sm:text-xs"
                  >
                    <Square className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4 xs:mr-1 sm:mr-2" />
                    <span className="hidden xs:inline">End Session</span>
                    <span className="xs:hidden">End</span>
                  </Button>
                )}
              </div>
            </div>

            {(session.notes || session.agenda || session.mentor_notes || session.meeting_link) && (
              <div className="space-y-3 mt-4">
                {session.notes && (
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <p className="text-sm text-neutral-500 mb-1">
                      Mentee Notes:
                    </p>
                    <p className="text-secondary-700">{session.notes}</p>
                  </div>
                )}
                {session.agenda && (
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <p className="text-sm text-neutral-500 mb-1">
                      Session Agenda:
                    </p>
                    <p className="text-secondary-700">{session.agenda}</p>
                  </div>
                )}
                {session.mentor_notes && (
                  <div className="bg-primary-50 rounded-lg p-4">
                    <p className="text-sm text-neutral-500 mb-1">Your Notes:</p>
                    <p className="text-secondary-700">{session.mentor_notes}</p>
                  </div>
                )}
                {session.meeting_link && (
                  <div className="bg-success-50 border border-success-200 rounded-lg p-4">
                    <p className="text-sm text-neutral-600 mb-2">Meeting Link:</p>
                    <a
                      href={session.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-success-600 hover:text-success-700 font-medium text-sm break-all"
                    >
                      {session.meeting_link}
                    </a>
                  </div>
                )}
              </div>
            )}


          </div>
        ))}

        {(upcomingSessions || []).length === 0 && (
          <div className="text-center py-6 xs:py-8 sm:py-12">
            <Calendar className="w-10 h-10 xs:w-12 xs:h-12 sm:w-16 sm:h-16 mx-auto text-neutral-300 mb-2 xs:mb-3 sm:mb-4" />
            <h3 className="text-xs xs:text-sm sm:text-base lg:text-lg font-semibold text-neutral-900 mb-1 xs:mb-1.5 sm:mb-2">
              No Upcoming Sessions
            </h3>
            <p className="text-[9px] xs:text-xs sm:text-sm text-neutral-500">
              You have no scheduled sessions at the moment.
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderSessionsTab = () => {
    const upcoming = mySessionsData?.upcoming || [];
    const past = mySessionsData?.past || [];

    return (
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px' }}>
        {/* Upcoming Sessions */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#111827' }}>
              Upcoming Sessions
              {upcoming.length > 0 && (
                <span style={{ marginLeft: '10px', background: '#10b981', color: 'white', fontSize: '12px', padding: '2px 10px', borderRadius: '20px', fontWeight: '600' }}>
                  {upcoming.length}
                </span>
              )}
            </h2>
          </div>

          {!mySessionsData ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>Loading sessions...</div>
          ) : upcoming.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', background: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <p style={{ fontSize: '32px', margin: '0 0 8px' }}>📅</p>
              <p style={{ color: '#6b7280', margin: 0, fontSize: '15px' }}>No upcoming sessions</p>
              <p style={{ color: '#9ca3af', margin: '4px 0 0', fontSize: '13px' }}>Confirmed bookings will appear here</p>
            </div>
          ) : (
            upcoming.map((session: any) => (
              <div key={session.id} style={{
                background: 'white', borderRadius: '12px', padding: '20px',
                border: '1px solid #e5e7eb', marginBottom: '12px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                display: 'flex', alignItems: 'center', gap: '16px',
              }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  background: 'linear-gradient(135deg,#10b981,#059669)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: '700', fontSize: '18px', flexShrink: 0,
                }}>
                  {session.student_avatar}
                </div>

                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 4px', fontWeight: '700', fontSize: '15px', color: '#111827' }}>
                    {session.student_name}
                  </p>
                  <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#6b7280' }}>
                    {new Date(session.session_date).toLocaleDateString('en-GB', {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                    })} at {session.start_time}
                  </p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#374151' }}>
                    Topic: <strong>{session.topic}</strong>
                    {session.duration && ` · ${session.duration} mins`}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <span style={{
                    background: session.status === 'confirmed' ? '#f0fdf4' : '#fffbeb',
                    color: session.status === 'confirmed' ? '#10b981' : '#f59e0b',
                    border: `1px solid ${session.status === 'confirmed' ? '#6ee7b7' : '#fcd34d'}`,
                    padding: '3px 12px', borderRadius: '20px',
                    fontSize: '12px', fontWeight: '600',
                  }}>
                    {session.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                  </span>
                  {session.meeting_link && (
                    <a
                      href={session.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        background: '#3b82f6', color: 'white',
                        padding: '6px 16px', borderRadius: '8px',
                        textDecoration: 'none', fontSize: '13px', fontWeight: '600',
                      }}
                    >
                      Join Session
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Session History */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#111827' }}>
              Session History
              {past.length > 0 && (
                <span style={{ marginLeft: '10px', background: '#6b7280', color: 'white', fontSize: '12px', padding: '2px 10px', borderRadius: '20px', fontWeight: '600' }}>
                  {past.length}
                </span>
              )}
            </h2>
          </div>

          {past.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', background: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <p style={{ fontSize: '32px', margin: '0 0 8px' }}>🕐</p>
              <p style={{ color: '#6b7280', margin: 0, fontSize: '15px' }}>No past sessions yet</p>
            </div>
          ) : (
            past.map((session: any) => (
              <div key={session.id} style={{
                background: '#f9fafb', borderRadius: '12px', padding: '20px',
                border: '1px solid #e5e7eb', marginBottom: '12px',
                display: 'flex', alignItems: 'center', gap: '16px',
                opacity: 0.85,
              }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  background: '#e5e7eb',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#6b7280', fontWeight: '700', fontSize: '18px', flexShrink: 0,
                }}>
                  {session.student_avatar}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 4px', fontWeight: '700', fontSize: '15px', color: '#374151' }}>
                    {session.student_name}
                  </p>
                  <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#9ca3af' }}>
                    {new Date(session.session_date).toLocaleDateString('en-GB', {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                    })} at {session.start_time}
                  </p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                    Topic: <strong>{session.topic}</strong>
                  </p>
                </div>
                <span style={{
                  background: '#f3f4f6', color: '#6b7280',
                  border: '1px solid #e5e7eb',
                  padding: '3px 12px', borderRadius: '20px',
                  fontSize: '12px', fontWeight: '600',
                }}>
                  Completed
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderMenteesTab = () => {
    if (menteesLoading) {
      return (
        <div className="flex items-center justify-center py-4 xs:py-6 sm:py-8">
          <div className="animate-spin rounded-full h-5 w-5 xs:h-6 xs:w-6 sm:h-8 sm:w-8 border-b-2 border-primary-600"></div>
        </div>
      );
    }

    return (
      <div className="space-y-2 xs:space-y-3 sm:space-y-4">
        <h2 className="text-sm xs:text-lg sm:text-xl lg:text-2xl font-bold text-secondary-900 mb-3 xs:mb-4 sm:mb-6">
          My Mentees
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 xs:gap-4 sm:gap-6">
          {(mentees || []).map((mentee: Mentee) => (
            <div
              key={mentee.id}
              className="bg-white rounded-lg xs:rounded-xl shadow-sm border border-neutral-200 p-2 xs:p-3 sm:p-4 lg:p-6"
            >
              <div className="text-center">
                <div className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-primary-500 to-secondary-600 rounded-full flex items-center justify-center text-white mx-auto mb-2 xs:mb-3 sm:mb-4">
                  <User className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
                </div>
                <h3 className="text-xs xs:text-sm sm:text-base lg:text-lg font-bold text-secondary-900">
                  {mentee.first_name} {mentee.last_name}
                </h3>
                <p className="text-[9px] xs:text-xs sm:text-sm text-neutral-600 mb-2 xs:mb-3 sm:mb-4 truncate">{mentee.email}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 xs:gap-3 sm:gap-4 text-center">
                  <div className="bg-primary-50 rounded-md xs:rounded-lg p-1.5 xs:p-2 sm:p-3">
                    <p className="text-sm xs:text-lg sm:text-xl lg:text-2xl font-bold text-primary-600">
                      {mentee.total_sessions}
                    </p>
                    <p className="text-[8px] xs:text-[10px] sm:text-xs text-neutral-600">Total Sessions</p>
                  </div>
                  <div className="bg-success-50 rounded-md xs:rounded-lg p-1.5 xs:p-2 sm:p-3">
                    <p className="text-sm xs:text-lg sm:text-xl lg:text-2xl font-bold text-success-600">
                      {mentee.completed_sessions}
                    </p>
                    <p className="text-[8px] xs:text-[10px] sm:text-xs text-neutral-600">Completed</p>
                  </div>
                </div>

                {mentee.next_session && (
                  <div className="mt-2 xs:mt-3 sm:mt-4 p-1.5 xs:p-2 sm:p-3 bg-warning-50 rounded-md xs:rounded-lg border border-warning-200">
                    <p className="text-[8px] xs:text-[10px] sm:text-xs lg:text-sm text-warning-700 font-medium">
                      Next Session:
                    </p>
                    <p className="text-[8px] xs:text-[10px] sm:text-xs text-neutral-600">
                      {new Date(mentee.next_session).toLocaleString()}
                    </p>
                  </div>
                )}

                {mentee.last_session && !mentee.next_session && (
                  <div className="mt-2 xs:mt-3 sm:mt-4 p-1.5 xs:p-2 sm:p-3 bg-neutral-50 rounded-md xs:rounded-lg">
                    <p className="text-[8px] xs:text-[10px] sm:text-xs text-neutral-500">Last Session:</p>
                    <p className="text-[8px] xs:text-[10px] sm:text-xs text-neutral-600">
                      {new Date(mentee.last_session).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {(mentees || []).length === 0 && (
          <div className="text-center py-6 xs:py-8 sm:py-12">
            <Users className="w-10 h-10 xs:w-12 xs:h-12 sm:w-16 sm:h-16 mx-auto text-neutral-300 mb-2 xs:mb-3 sm:mb-4" />
            <h3 className="text-xs xs:text-sm sm:text-base lg:text-lg font-semibold text-neutral-900 mb-1 xs:mb-1.5 sm:mb-2">
              No Mentees Yet
            </h3>
            <p className="text-[9px] xs:text-xs sm:text-sm text-neutral-500">
              You haven't mentored anyone yet. Start accepting session requests
              to build your mentee network!
            </p>
          </div>
        )}
      </div>
    );
  };

  const totalMentees = mentees?.length || 0;

  return (
    <Layout>
      <MentorHero
        title="Mentor Dashboard"
        subtitle="Manage your mentorship sessions and guide your mentees"
        badge={`${totalMentees} Mentees`}
        variant="default"
      />
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30">
        <div className="max-w-7xl mx-auto px-2 xs:px-3 sm:px-4 lg:px-6 xl:px-8 py-3 xs:py-4 sm:py-6 lg:py-8">
          {/* Navigation Tabs */}
          <div className="bg-white rounded-lg xs:rounded-xl shadow-sm border border-neutral-200 mb-3 xs:mb-4 sm:mb-6 lg:mb-8">
            <nav className="flex space-x-0.5 xs:space-x-1 p-0.5 xs:p-1 overflow-x-auto">
              {[
                { key: "overview", label: "Overview", icon: TrendingUp },
                { key: "sessions", label: "Sessions", icon: Calendar },
                { key: "pending", label: "Pending", icon: Clock },
                { key: "upcoming", label: "Upcoming", icon: Calendar },
                { key: "mentees", label: "Mentees", icon: Users },
                { key: "history", label: "History", icon: FileText },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`flex items-center space-x-1 xs:space-x-1.5 sm:space-x-2 px-1.5 xs:px-2 sm:px-3 lg:px-4 py-1.5 xs:py-2 sm:py-2.5 lg:py-3 rounded-md xs:rounded-lg font-medium transition-all duration-200 text-[9px] xs:text-[10px] sm:text-xs lg:text-sm whitespace-nowrap ${
                    activeTab === key
                      ? "bg-primary-600 text-white shadow-sm"
                      : "text-neutral-600 hover:bg-primary-50 hover:text-primary-600"
                  }`}
                >
                  <Icon className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && renderOverviewTab()}
          {activeTab === "sessions" && renderSessionsTab()}
          {activeTab === "pending" && renderPendingTab()}
          {activeTab === "upcoming" && renderUpcomingTab()}
          {activeTab === "mentees" && renderMenteesTab()}

          {/* Confirmation Dialog */}
          {showConfirmDialog && selectedSession && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 xs:p-3 sm:p-4 z-50">
              <div className="bg-white rounded-lg xs:rounded-xl p-2 xs:p-3 sm:p-4 lg:p-6 max-w-md w-full">
                <h3 className="text-xs xs:text-sm sm:text-base lg:text-lg font-bold text-secondary-900 mb-2 xs:mb-3 sm:mb-4">
                  Confirm Session
                </h3>
                <p className="text-[9px] xs:text-xs sm:text-sm text-neutral-600 mb-2 xs:mb-3 sm:mb-4">
                  Accept session with {getMenteeName(selectedSession)}
                </p>

                <div className="space-y-2 xs:space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-[8px] xs:text-[10px] sm:text-xs lg:text-sm font-medium text-neutral-700 mb-1 xs:mb-1.5 sm:mb-2">
                      Meeting Link (Google Meet, Zoom, etc.)
                    </label>
                    <input
                      type="url"
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                      placeholder="https://meet.google.com/abc-defg-hij or https://zoom.us/j/... or your external link"
                      className="w-full px-1.5 xs:px-2 sm:px-3 py-1 xs:py-1.5 sm:py-2 text-[9px] xs:text-xs sm:text-sm border border-neutral-300 rounded-md xs:rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <p className="text-[7px] xs:text-[8px] sm:text-xs text-neutral-500 mt-1 xs:mt-1.5">
                      Paste your external meeting link (Google Meet, Zoom, Teams, etc.) - This will open in a new tab for both you and the mentee
                    </p>
                  </div>

                  <div>
                    <label className="block text-[8px] xs:text-[10px] sm:text-xs lg:text-sm font-medium text-neutral-700 mb-1 xs:mb-1.5 sm:mb-2">
                      Notes (optional)
                    </label>
                    <textarea
                      value={mentorNotes}
                      onChange={(e) => setMentorNotes(e.target.value)}
                      placeholder="Add any notes or preparation instructions..."
                      rows={3}
                      className="w-full px-1.5 xs:px-2 sm:px-3 py-1 xs:py-1.5 sm:py-2 text-[9px] xs:text-xs sm:text-sm border border-neutral-300 rounded-md xs:rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div className="flex flex-col xs:flex-row space-y-1.5 xs:space-y-0 xs:space-x-2 sm:space-x-3 mt-3 xs:mt-4 sm:mt-6">
                  <Button
                    onClick={handleConfirmSession}
                    disabled={confirmSessionMutation.isPending}
                    className="flex-1 bg-success-600 hover:bg-success-700 text-[9px] xs:text-xs sm:text-sm py-1.5 xs:py-2"
                  >
                    {confirmSessionMutation.isPending
                      ? "Confirming..."
                      : "Confirm Session"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowConfirmDialog(false);
                      setSelectedSession(null);
                      setMentorNotes("");
                      setMeetingLink("");
                    }}
                    className="border-neutral-300 text-neutral-600 text-[9px] xs:text-xs sm:text-sm py-1.5 xs:py-2"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Rejection Dialog */}
          {showRejectDialog && selectedSession && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 xs:p-3 sm:p-4 z-50">
              <div className="bg-white rounded-lg xs:rounded-xl p-2 xs:p-3 sm:p-4 lg:p-6 max-w-md w-full">
                <h3 className="text-xs xs:text-sm sm:text-base lg:text-lg font-bold text-secondary-900 mb-2 xs:mb-3 sm:mb-4">
                  Decline Session
                </h3>
                <p className="text-[9px] xs:text-xs sm:text-sm text-neutral-600 mb-2 xs:mb-3 sm:mb-4">
                  Decline session with {getMenteeName(selectedSession)}?
                </p>

                <div>
                  <label className="block text-[8px] xs:text-[10px] sm:text-xs lg:text-sm font-medium text-neutral-700 mb-1 xs:mb-1.5 sm:mb-2">
                    Reason (optional)
                  </label>
                  <textarea
                    value={mentorNotes}
                    onChange={(e) => setMentorNotes(e.target.value)}
                    placeholder="Let them know why you can't accept this session..."
                    rows={3}
                    className="w-full px-1.5 xs:px-2 sm:px-3 py-1 xs:py-1.5 sm:py-2 text-[9px] xs:text-xs sm:text-sm border border-neutral-300 rounded-md xs:rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="flex flex-col xs:flex-row space-y-1.5 xs:space-y-0 xs:space-x-2 sm:space-x-3 mt-3 xs:mt-4 sm:mt-6">
                  <Button
                    onClick={handleRejectSession}
                    disabled={rejectSessionMutation.isPending}
                    className="flex-1 bg-error-600 hover:bg-error-700 text-[9px] xs:text-xs sm:text-sm py-1.5 xs:py-2"
                  >
                    {rejectSessionMutation.isPending
                      ? "Declining..."
                      : "Decline Session"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRejectDialog(false);
                      setSelectedSession(null);
                      setMentorNotes("");
                    }}
                    className="border-neutral-300 text-neutral-600 text-[9px] xs:text-xs sm:text-sm py-1.5 xs:py-2"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MentorDashboard;
