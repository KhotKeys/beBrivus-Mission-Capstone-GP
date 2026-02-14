import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  MapPin,
  Star,
  Calendar,
  MessageCircle,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import {
  mentorsApi,
  type Mentor,
  type MentorSearchResponse,
} from "../../api/mentors";

const MentorCard: React.FC<{ mentor: Mentor }> = ({ mentor }) => {
  const handleMessage = () => {
    // TODO: Implement messaging functionality
    console.log("Message mentor:", mentor.id);
  };

  const handleBookSession = () => {
    // TODO: Implement booking functionality
    console.log("Book session with:", mentor.id);
  };

  return (
    <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-4 text-center sm:text-left">
        <img
          src={
            mentor.avatar ||
            mentor.user.profile_picture ||
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80"
          }
          alt={`${mentor.user.first_name} ${mentor.user.last_name}`}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover mx-auto sm:mx-0"
        />
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1">
            <h3 className="text-base sm:text-xl font-semibold text-gray-900">
              {mentor.name ||
                `${mentor.user.first_name} ${mentor.user.last_name}`}
            </h3>
            <Badge variant="primary" className="text-xs w-fit mx-auto sm:mx-0">
              {mentor.match_score}% Match
            </Badge>
          </div>
          <p className="text-sm sm:text-lg text-gray-700 mb-1">{mentor.title}</p>
          <p className="text-xs sm:text-base text-gray-600 mb-2">{mentor.company}</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs sm:text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {mentor.location}
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-400 fill-current" />
              {mentor.rating} ({mentor.total_sessions} sessions)
            </div>
            <div className="flex items-center gap-1">
              <Briefcase className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {mentor.experience_years} years exp.
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center sm:items-end gap-2">
          <Badge
            variant={
              mentor.availability === "Available"
                ? "success"
                : mentor.availability === "Busy"
                ? "warning"
                : "secondary"
            }
            className="text-xs"
          >
            {mentor.availability}
          </Badge>
          <p className="text-xs sm:text-sm text-gray-500">
            Responds in {mentor.response_time_hours}h
          </p>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-gray-600 mb-4 line-clamp-2 text-center sm:text-left">
        {mentor.bio}
      </p>

      <div className="mb-4">
        <h4 className="text-xs sm:text-sm font-medium text-gray-900 mb-2 text-center sm:text-left">
          Expertise:
        </h4>
        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
          {mentor.expertise_list?.map((skill, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <GraduationCap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            {mentor.education}
          </div>
        </div>
        <div className="text-base sm:text-lg font-semibold text-gray-900">
          ${mentor.hourly_rate}/hour
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          onClick={handleMessage}
          variant="outline"
          size="sm"
          className="flex-1 text-xs sm:text-sm justify-center"
        >
          <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
          Message
        </Button>
        <Button onClick={handleBookSession} size="sm" className="flex-1 text-xs sm:text-sm justify-center">
          <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
          Book Session
        </Button>
      </div>
    </Card>
  );
};

interface MentorsGridProps {
  search: string;
  expertise: string;
  availability: string;
  sort: string;
}

export const MentorsGrid: React.FC<MentorsGridProps> = ({
  search,
  expertise,
  availability,
  sort,
}) => {
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const itemsPerPage = 20;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1); // Reset to first page when filters change
  }, [debouncedSearch, expertise, availability, sort]);

  // Fetch all mentors once
  const {
    data: allMentorsData,
    isLoading,
    error,
    refetch,
  } = useQuery<MentorSearchResponse, Error>({
    queryKey: ["mentors", "all"],
    queryFn: () => mentorsApi.getMentors({ page_size: 1000 }), // Get all mentors
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const allMentors = allMentorsData?.results || [];

  // Filter mentors on the frontend
  const filteredMentors = React.useMemo(() => {
    let filtered = [...allMentors];

    // Apply search filter
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (mentor) =>
          mentor.name?.toLowerCase().includes(searchLower) ||
          `${mentor.user.first_name} ${mentor.user.last_name}`
            .toLowerCase()
            .includes(searchLower) ||
          mentor.title?.toLowerCase().includes(searchLower) ||
          mentor.company?.toLowerCase().includes(searchLower) ||
          mentor.bio?.toLowerCase().includes(searchLower) ||
          mentor.expertise_list?.some((skill) =>
            skill.toLowerCase().includes(searchLower)
          )
      );
    }

    // Apply expertise filter
    if (expertise && expertise !== "all") {
      filtered = filtered.filter((mentor) =>
        mentor.expertise_list?.includes(expertise)
      );
    }

    // Apply availability filter
    if (availability && availability !== "all") {
      filtered = filtered.filter(
        (mentor) => mentor.availability === availability
      );
    }

    // Apply sorting
    switch (sort) {
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "experience":
        filtered.sort((a, b) => b.experience_years - a.experience_years);
        break;
      case "price_low":
        filtered.sort((a, b) => a.hourly_rate - b.hourly_rate);
        break;
      case "price_high":
        filtered.sort((a, b) => b.hourly_rate - a.hourly_rate);
        break;
      case "match":
      default:
        filtered.sort((a, b) => b.match_score - a.match_score);
        break;
    }

    return filtered;
  }, [allMentors, debouncedSearch, expertise, availability, sort]);

  // Paginate the filtered results
  const totalItems = filteredMentors.length;
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const mentors = filteredMentors.slice(startIndex, endIndex);
  const hasMore = endIndex < totalItems;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="p-6 animate-pulse">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-4 w-2/3"></div>
            <div className="flex gap-2">
              <div className="h-8 bg-gray-200 rounded flex-1"></div>
              <div className="h-8 bg-gray-200 rounded flex-1"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Error loading mentors
        </h3>
        <p className="text-gray-600 mb-4">Please try again later</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  if (
    !isLoading &&
    filteredMentors.length === 0 &&
    (debouncedSearch || expertise !== "all" || availability !== "all")
  ) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg mb-8">
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No mentors found
          </h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search criteria or filters to find more mentors.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mentors.map((mentor: Mentor) => (
          <MentorCard key={mentor.id} mentor={mentor} />
        ))}
      </div>
      {hasMore && (
        <div className="text-center mt-8">
          <Button variant="outline" onClick={() => setPage((p) => p + 1)}>
            Load More Mentors
          </Button>
        </div>
      )}
    </>
  );
};
