import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Filter,
  MapPin,
  Star,
  Calendar,
  Video,
  MessageCircle,
  Award,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Layout } from "../components/layout/Layout";
import {
  mentorsApi,
  type Mentor,
  type MentorSearchParams,
} from "../api/mentors";

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
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4 mb-4">
        <img
          src={
            mentor.avatar ||
            mentor.user.profile_picture ||
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80"
          }
          alt={`${mentor.user.first_name} ${mentor.user.last_name}`}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xl font-semibold text-gray-900">
              {mentor.name ||
                `${mentor.user.first_name} ${mentor.user.last_name}`}
            </h3>
            <Badge variant="primary" className="text-xs">
              {mentor.match_score}% Match
            </Badge>
          </div>
          <p className="text-lg text-gray-700 mb-1">{mentor.title}</p>
          <p className="text-gray-600 mb-2">{mentor.company}</p>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {mentor.location}
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              {mentor.rating} ({mentor.total_sessions} sessions)
            </div>
            <div className="flex items-center gap-1">
              <Briefcase className="h-4 w-4" />
              {mentor.experience_years} years exp.
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
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
          <p className="text-sm text-gray-500">
            Responds in {mentor.response_time_hours}h
          </p>
        </div>
      </div>

      <p className="text-gray-600 mb-4 line-clamp-2">{mentor.bio}</p>

      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Expertise:</h4>
        <div className="flex flex-wrap gap-2">
          {mentor.expertise_list?.map((skill, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <GraduationCap className="h-4 w-4" />
            {mentor.education}
          </div>
        </div>
        <div className="text-lg font-semibold text-gray-900">
          ${mentor.hourly_rate}/hour
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleMessage}
          variant="outline"
          size="sm"
          className="flex-1"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Message
        </Button>
        <Button onClick={handleBookSession} size="sm" className="flex-1">
          <Calendar className="h-4 w-4 mr-2" />
          Book Session
        </Button>
      </div>
    </Card>
  );
};

export const MentorsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useState<MentorSearchParams>({
    page: 1,
    page_size: 20,
    sort: "match",
  });

  const {
    data: mentorData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["mentors", searchParams],
    queryFn: () => mentorsApi.searchMentors(searchParams),
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterExpertise, setFilterExpertise] = useState<string>("all");
  const [filterAvailability, setFilterAvailability] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("match");

  // Update search params when filters change
  useEffect(() => {
    setSearchParams((prev) => ({
      ...prev,
      search: searchTerm || undefined,
      expertise: filterExpertise === "all" ? undefined : filterExpertise,
      availability:
        filterAvailability === "all" ? undefined : filterAvailability,
      sort: sortBy as any,
      page: 1, // Reset to first page when filters change
    }));
  }, [searchTerm, filterExpertise, filterAvailability, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error loading mentors
            </h3>
            <p className="text-gray-600 mb-4">Please try again later</p>
            <Button onClick={() => refetch()}>Retry</Button>
          </div>
        </div>
      </Layout>
    );
  }

  const mentors = mentorData?.results || [];
  const total = mentorData?.total || 0;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Find Your Mentor
          </h1>
          <p className="text-gray-600">
            Connect with experienced professionals who can guide your career
            journey
          </p>
        </div>

        {/* Search and Filters */}
        <form
          onSubmit={handleSearch}
          className="bg-white p-6 rounded-lg shadow-sm mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search mentors by name, expertise, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={filterExpertise}
                onChange={(e) => setFilterExpertise(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Expertise</option>
                <option value="Product Management">Product Management</option>
                <option value="Software Engineering">
                  Software Engineering
                </option>
                <option value="Design">Design</option>
                <option value="Data Science">Data Science</option>
                <option value="Marketing">Marketing</option>
              </select>
              <select
                value={filterAvailability}
                onChange={(e) => setFilterAvailability(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Availability</option>
                <option value="Available">Available</option>
                <option value="Busy">Busy</option>
                <option value="Offline">Offline</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="match">Best Match</option>
                <option value="rating">Highest Rated</option>
                <option value="experience">Most Experience</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
              <Button type="submit" variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </form>

        {/* Featured Mentors Section */}
        <div className="bg-gradient-to-r from-primary-50 to-purple-50 p-6 rounded-lg mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary-100 p-2 rounded-lg">
              <Award className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Top Rated Mentors
              </h3>
              <p className="text-gray-600">
                Highly recommended by our community
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mentors.slice(0, 3).map((mentor, index) => (
              <div key={mentor.id} className="bg-white p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  {mentor.user.first_name} {mentor.user.last_name}
                </h4>
                <p className="text-sm text-gray-600">
                  {mentor.rating}★ rating • {mentor.total_sessions} sessions
                </p>
                <p className="text-sm text-primary-600">{mentor.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            Showing {mentors.length} of {total} mentors
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Save Search
            </Button>
            <Button variant="outline" size="sm">
              <Video className="h-4 w-4 mr-2" />
              Group Sessions
            </Button>
          </div>
        </div>

        {/* Mentors Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {mentors.map((mentor) => (
            <MentorCard key={mentor.id} mentor={mentor} />
          ))}
        </div>

        {/* Load More / Pagination */}
        <div className="text-center mt-8">
          {mentorData?.has_next && (
            <Button
              variant="outline"
              onClick={() =>
                setSearchParams((prev) => ({
                  ...prev,
                  page: (prev.page || 1) + 1,
                }))
              }
            >
              Load More Mentors
            </Button>
          )}
        </div>
      </div>
    </Layout>
  );
};
