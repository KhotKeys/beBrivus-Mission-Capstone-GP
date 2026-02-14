import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mentorsApi, type BookSessionData } from "../../api/mentors";
import { messagingApi } from "../../api/messaging";
import { Calendar, Clock, User, X } from "lucide-react";
import { Button } from "../ui";

interface BookingModalProps {
  mentorId: number;
  mentorName: string;
  mentorExpertise: string[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  mentorId,
  mentorName,
  mentorExpertise,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });

  const [bookingData, setBookingData] = useState<BookSessionData>({
    session_date: selectedDate,
    start_time: "09:00",
    duration: 60,
    session_type: "career_guidance",
    notes: "",
  });

  const queryClient = useQueryClient();

  // Fetch available slots using your existing API
  const { data: availabilityData, isLoading: slotsLoading } = useQuery({
    queryKey: ["mentor-availability", mentorId, selectedDate],
    queryFn: () => mentorsApi.getMentorAvailability(mentorId),
    enabled: false, // Disabled due to backend filtering issues
  });

  // Mock slots until backend availability filtering is fixed
  const mockSlots = [
    {
      id: 1,
      start_time: "09:00:00",
      end_time: "10:00:00",
      day_of_week: new Date(selectedDate).getDay(),
      timezone: "UTC",
    },
    {
      id: 2,
      start_time: "11:00:00",
      end_time: "12:00:00",
      day_of_week: new Date(selectedDate).getDay(),
      timezone: "UTC",
    },
    {
      id: 3,
      start_time: "14:00:00",
      end_time: "15:00:00",
      day_of_week: new Date(selectedDate).getDay(),
      timezone: "UTC",
    },
    {
      id: 4,
      start_time: "16:00:00",
      end_time: "17:00:00",
      day_of_week: new Date(selectedDate).getDay(),
      timezone: "UTC",
    },
  ];

  const slots = availabilityData || mockSlots;

  // Book session using your existing API
  const bookSessionMutation = useMutation({
    mutationFn: async (data: BookSessionData) => {
      const sessionRes = await mentorsApi.bookSession(mentorId, data);
      
      // Send notes as a message to mentor if notes exist
      if (data.notes && data.notes.trim()) {
        try {
          await messagingApi.sendMessageToMentor(mentorId, `Session notes: ${data.notes}`);
        } catch (error) {
          console.warn("Failed to send notes as message:", error);
          // Don't fail the booking if message send fails
        }
      }
      
      return sessionRes;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
      onSuccess();
      onClose();
    },
  });

  // Update booking data when date changes
  React.useEffect(() => {
    setBookingData((prev) => ({ ...prev, session_date: selectedDate }));
  }, [selectedDate]);

  const handleBooking = () => {
    bookSessionMutation.mutate(bookingData);
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Book a Session</h2>
            <p className="text-gray-600">with {mentorName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Mentor Info */}
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{mentorName}</h3>
              <div className="flex flex-wrap gap-2 mt-1">
                {mentorExpertise.map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Time Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Time
            </label>
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-gray-400" />
              <select
                value={bookingData.start_time}
                onChange={(e) =>
                  setBookingData({ ...bookingData, start_time: e.target.value })
                }
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="09:00">9:00 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="12:00">12:00 PM</option>
                <option value="13:00">1:00 PM</option>
                <option value="14:00">2:00 PM</option>
                <option value="15:00">3:00 PM</option>
                <option value="16:00">4:00 PM</option>
                <option value="17:00">5:00 PM</option>
              </select>
            </div>
          </div>

          {/* Duration Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration
            </label>
            <select
              value={bookingData.duration}
              onChange={(e) =>
                setBookingData({
                  ...bookingData,
                  duration: parseInt(e.target.value),
                })
              }
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
            </select>
          </div>

          {/* Session Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Type
            </label>
            <select
              value={bookingData.session_type}
              onChange={(e) =>
                setBookingData({
                  ...bookingData,
                  session_type: e.target
                    .value as BookSessionData["session_type"],
                })
              }
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="career_guidance">Career Guidance</option>
              <option value="interview_prep">Interview Preparation</option>
              <option value="skill_development">Skill Development</option>
              <option value="portfolio_review">Portfolio Review</option>
              <option value="networking">Networking</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Session Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What would you like to discuss?
            </label>
            <textarea
              value={bookingData.notes}
              onChange={(e) =>
                setBookingData({ ...bookingData, notes: e.target.value })
              }
              placeholder="Describe what you'd like to cover in this session..."
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleBooking}
            disabled={bookSessionMutation.isPending}
          >
            {bookSessionMutation.isPending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Book Session"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
