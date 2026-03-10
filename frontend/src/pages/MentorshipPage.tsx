import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { mentorsApi, type Mentor } from "../api/mentors";
import { bookingApi } from "../api/messaging";
import { BookingModal } from "../components/messaging/BookingModal";
import { VideoCall } from "../components/messaging/VideoCall";
import BookingsTab from "../components/mentors/BookingsTab";
import { Layout } from "../components/layout";
import { HeroSection } from "../components/HeroSection";
import { Button } from "../components/ui";
import {
  Calendar,
  User,
  Star,
  Search,
  Filter,
} from "lucide-react";

const MentorshipPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<
    "mentors" | "bookings"
  >("mentors");
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExpertise, setSelectedExpertise] = useState("");
  // Fetch mentors using your existing API
  const { data: mentorsData, isLoading: mentorsLoading } = useQuery({
    queryKey: ["mentors", { search: searchTerm, expertise: selectedExpertise }],
    queryFn: () =>
      mentorsApi.getMentors({
        search: searchTerm || undefined,
        expertise: selectedExpertise || undefined,
      }),
  });

  // Fetch bookings - always enabled, refetch on mount
  const { data: bookingsData } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: () => bookingApi.getMyBookings(),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const mentors = mentorsData?.results || [];
  const bookings = bookingsData?.data?.results || [];

  const allExpertise = [
    ...new Set(mentors.flatMap((mentor: Mentor) => mentor.expertise_list)),
  ];

  const handleBookSession = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setShowBooking(true);
  };

  const handleJoinSession = (sessionId: number) => {
    setSelectedSessionId(sessionId);
    setShowVideoCall(true);
  };

  const renderMentorsTab = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('Search mentors placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <select
              value={selectedExpertise}
              onChange={(e) => setSelectedExpertise(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full sm:w-auto"
            >
              <option value="">{t('All Expertise')}</option>
              {allExpertise.map((skill) => (
                <option key={skill} value={skill}>
                  {skill}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Mentors Grid */}
      {mentorsLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentors.map((mentor: Mentor) => (
            <div
              key={mentor.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 text-center sm:text-left"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden mx-auto sm:mx-0">
                  {mentor.avatar || mentor.user.profile_picture ? (
                    <img
                      src={mentor.avatar || mentor.user.profile_picture}
                      alt={mentor.name}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                    {mentor.name ||
                      `${mentor.user.first_name} ${mentor.user.last_name}`}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">{mentor.title}</p>
                  <p className="text-xs text-gray-500">{mentor.company}</p>
                  <div className="flex items-center justify-center sm:justify-start space-x-1 text-xs sm:text-sm text-gray-500 mt-1">
                    <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current text-yellow-400" />
                    <span>{mentor.rating}</span>
                    <span className="text-gray-300">•</span>
                    <span>{mentor.total_sessions} sessions</span>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    ${mentor.hourly_rate}/hour
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex flex-wrap gap-1 justify-center sm:justify-start">
                  {mentor.expertise_list.slice(0, 3).map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                  {mentor.expertise_list.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{mentor.expertise_list.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 text-center sm:text-left">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    mentor.availability === "Available"
                      ? "bg-[#e6f2f3] text-[#09373f]"
                      : mentor.availability === "Busy"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {mentor.availability === "Available" ? t('Available') : mentor.availability}
                </span>
                <span className="text-xs text-gray-500">
                  Responds in {mentor.response_time_hours}h
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  size="sm"
                  onClick={() => handleBookSession(mentor)}
                  className="flex-1 text-xs sm:text-sm justify-center"
                  disabled={mentor.availability !== "Available"}
                >
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                  {t('Book Session')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );


  return (
    <Layout>
      <HeroSection
        title={t('Your Mentorship Workspace')}
        subtitle={t('Mentors hero description')}
        backgroundImage="/mentor.png"
        showZigZag
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8 text-center sm:text-left">
          <h2 className="text-xl sm:text-3xl font-semibold text-gray-900 mb-2">
            {t('Your Mentorship Workspace')}
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            {t('Mentors page description')}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6 sm:mb-8">
          <nav className="-mb-px flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-8">
            {[
              { key: "mentors", label: t('Find Mentors'), icon: User },
              { key: "bookings", label: t('My Bookings'), icon: Calendar },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center space-x-2 py-3 sm:py-4 px-1 border-b-2 font-medium text-[11px] sm:text-sm ${
                  activeTab === key
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "mentors" && renderMentorsTab()}
        {activeTab === "bookings" && (
          <BookingsTab
            bookings={bookings}
            handleJoinSession={handleJoinSession}
          />
        )}

        {/* Modals */}
        {showBooking && selectedMentor && (
          <BookingModal
            mentorId={selectedMentor.id}
            mentorName={
              selectedMentor.name ||
              `${selectedMentor.user?.first_name || ""} ${
                selectedMentor.user?.last_name || ""
              }`.trim() ||
              "Mentor"
            }
            mentorExpertise={selectedMentor.expertise_list || []}
            isOpen={showBooking}
            onClose={() => setShowBooking(false)}
            onSuccess={() => {
              setShowBooking(false);
              setActiveTab("bookings");
            }}
          />
        )}

        {showVideoCall && selectedSessionId && (
          <VideoCall
            sessionId={selectedSessionId}
            isOpen={showVideoCall}
            onClose={() => setShowVideoCall(false)}
          />
        )}
      </div>
    </Layout>
  );
};

export default MentorshipPage;
