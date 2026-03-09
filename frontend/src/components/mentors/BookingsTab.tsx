import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Video, MessageCircle, User, Clock, ExternalLink } from "lucide-react";
import { Button } from "../ui/Button";
import { bookingApi } from "../../api/messaging";
import type { BookingSession } from "../../api/messaging";

interface BookingsTabProps {
  bookings: BookingSession[];
  handleJoinSession: (sessionId: number) => void;
}

export default function BookingsTab({
  bookings,
  handleJoinSession,
}: BookingsTabProps) {
  const queryClient = useQueryClient();
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const cancelBookingMutation = useMutation({
    mutationFn: (bookingId: number) => bookingApi.cancelBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
    },
    onError: () => {
      alert("Failed to cancel the session. Please try again.");
    },
    onSettled: () => {
      setCancellingId(null);
    },
  });
  // Check if link is external (starts with http/https)
  const isExternalLink = (link?: string) => {
    if (!link) return false;
    return link.startsWith('http://') || link.startsWith('https://');
  };

  // Handle join session - external link vs internal
  const handleJoinClick = (booking: any) => {
    if (booking.meeting_link && isExternalLink(booking.meeting_link)) {
      // Open external link in new tab
      window.open(booking.meeting_link, '_blank', 'noopener,noreferrer');
    } else if (booking.meeting_id) {
      // Use internal video call with meeting ID
      handleJoinSession(booking.id);
    } else {
      // No link available yet, ask mentor for link
      alert('Meeting link will be provided by the mentor. Please wait.');
    }
  };

  const handleCancelClick = (booking: BookingSession) => {
    if (cancellingId || cancelBookingMutation.isPending) {
      return;
    }

    const confirmed = window.confirm(
      "Cancel this scheduled session? This action cannot be undone."
    );
    if (!confirmed) {
      return;
    }

    setCancellingId(booking.id);
    cancelBookingMutation.mutate(booking.id);
  };
  return (
    <div className="space-y-6">
      {bookings.length === 0 ? (
        <div className="relative overflow-hidden bg-gradient-to-br from-primary-50 to-secondary-100 rounded-2xl border border-primary-200 p-6 sm:p-12 text-center">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="relative">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-r from-primary-500 to-secondary-600 rounded-full flex items-center justify-center shadow-lg">
              <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-secondary-800 mb-2">
              No bookings yet
            </h3>
            <p className="text-sm sm:text-base text-secondary-600 max-w-md mx-auto">
              Schedule your first mentorship session to start your learning
              journey!
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking: any) => {
            const getStatusColor = (status: string) => {
              switch (status) {
                case "confirmed":
                  return "bg-success-100 text-success-800 border-success-200";
                case "scheduled":
                case "pending":
                  return "bg-warning-100 text-warning-800 border-warning-200";
                case "in_progress":
                  return "bg-secondary-100 text-secondary-800 border-secondary-200";
                case "completed":
                  return "bg-neutral-100 text-neutral-700 border-neutral-200";
                case "cancelled":
                  return "bg-error-100 text-error-800 border-error-200";
                default:
                  return "bg-neutral-100 text-neutral-700 border-neutral-200";
              }
            };

            const getSessionTypeIcon = (type: string) => {
              switch (type) {
                case "video":
                  return <Video className="w-5 h-5" />;
                case "chat":
                  return <MessageCircle className="w-5 h-5" />;
                default:
                  return <Calendar className="w-5 h-5" />;
              }
            };

            return (
              <div
                key={booking.id}
                className="group relative bg-white rounded-2xl shadow-sm border border-neutral-200 hover:shadow-lg hover:border-neutral-300 transition-all duration-200 overflow-hidden"
              >
                {/* Status indicator bar */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 ${
                    booking.status === "confirmed"
                      ? "bg-success-500"
                      : booking.status === "pending"
                      ? "bg-warning-500"
                      : booking.status === "in_progress"
                      ? "bg-secondary-500"
                      : "bg-neutral-500"
                  }`}
                ></div>

                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start space-x-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-primary-500 to-secondary-600 rounded-xl flex items-center justify-center text-white shadow-md">
                        {getSessionTypeIcon(booking.session_type)}
                      </div>
                      <div>
                        <h3 className="font-bold text-secondary-900 text-base sm:text-lg">
                          {booking.session_type.replace("_", " ").toUpperCase()}{" "}
                          Session with {booking.mentor_name}
                        </h3>
                        <p className="text-xs sm:text-sm text-neutral-500">
                          Session #{booking.id}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold border ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status.replace("_", " ").toUpperCase()}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 text-secondary-700">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-secondary-50 rounded-lg flex items-center justify-center">
                          <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-neutral-500">Mentor</p>
                          <p className="text-sm sm:text-base font-semibold">{booking.mentor_name}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 text-secondary-700">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-secondary-50 rounded-lg flex items-center justify-center">
                          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-neutral-500">
                            Date & Time
                          </p>
                          <p className="text-sm sm:text-base font-semibold">
                            {new Date(booking.session_date).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}{" "}
                            at {booking.start_time}{" "}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 text-secondary-700">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-secondary-50 rounded-lg flex items-center justify-center">
                          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-neutral-500">Duration</p>
                          <p className="text-sm sm:text-base font-semibold">
                            {booking.duration_minutes} minutes
                          </p>
                        </div>
                      </div>

                      {booking.description && (
                        <div className="bg-neutral-50 rounded-lg p-3 sm:p-4">
                          <p className="text-xs sm:text-sm text-neutral-500 mb-1">
                            Notes
                          </p>
                          <p className="text-sm text-secondary-700">
                            {booking.notes || booking.agenda || "No notes provided."}
                          </p>
                        </div>
                      )}

                      {booking.meeting_link && (
                        <div className="bg-success-50 border border-success-200 rounded-lg p-3 sm:p-4">
                          <p className="text-xs sm:text-sm text-neutral-600 mb-2 font-medium">
                            Meeting Link
                          </p>
                          {isExternalLink(booking.meeting_link) ? (
                            <a
                              href={booking.meeting_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-success-600 hover:text-success-700 text-sm break-all flex items-start gap-2"
                            >
                              <ExternalLink className="w-4 h-4 flex-shrink-0 mt-0.5" />
                              <span>{booking.meeting_link}</span>
                            </a>
                          ) : (
                            <p className="text-sm text-secondary-700">{booking.meeting_link}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-neutral-100 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start space-x-2 text-xs sm:text-sm text-neutral-500">
                      <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>
                        Created{" "}
                        {new Date(booking.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      {(booking.status === "pending" || booking.status === "scheduled") && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-error-600 border-error-200 hover:bg-error-50 text-xs sm:text-sm"
                          isLoading={cancellingId === booking.id}
                          onClick={() => handleCancelClick(booking)}
                        >
                          {cancellingId === booking.id ? "Cancelling..." : "Cancel"}
                        </Button>
                      )}

                      {(booking.status === "confirmed" ||
                        booking.status === "in_progress") && (
                        <Button
                          size="sm"
                          onClick={() => handleJoinClick(booking)}
                          className="bg-gradient-to-r from-primary-500 to-secondary-600 hover:from-primary-600 hover:to-secondary-700 text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 text-xs sm:text-sm"
                        >
                          <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span>
                            {booking.meeting_link && isExternalLink(booking.meeting_link)
                              ? 'Join Meeting'
                              : 'Join Session'}
                          </span>
                          {booking.meeting_link && isExternalLink(booking.meeting_link) && (
                            <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          )}
                        </Button>
                      )}

                      {booking.status === "completed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-primary-600 border-primary-200 hover:bg-primary-50 text-xs sm:text-sm"
                        >
                          Leave Review
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
