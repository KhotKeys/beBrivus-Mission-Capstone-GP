import React, { useState } from "react";
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  DollarSign,
  Award,
  Star,
  Heart,
  Share2,
  Eye,
  Users,
  Clock,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import { Button, Card, CardBody } from "../components/ui";
import { Layout } from "../components/layout";

interface Opportunity {
  id: number;
  title: string;
  organization: string;
  location: string;
  type: "scholarship" | "internship" | "fellowship" | "job";
  amount?: string;
  description: string;
  requirements: string[];
  deadline: string;
  applicationUrl?: string;
  tags: string[];
  featured: boolean;
  views: number;
  applications: number;
  matchScore?: number;
  isSaved: boolean;
  createdAt: string;
}

export const ScholarshipsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [sortBy, setSortBy] = useState("deadline");

  // Mock data - In real app, this would come from API with admin-created opportunities
  const opportunities: Opportunity[] = [
    {
      id: 1,
      title: "Rhodes Scholarship 2025",
      organization: "Rhodes Trust",
      location: "Oxford, UK",
      type: "scholarship",
      amount: "$75,000/year",
      description:
        "The Rhodes Scholarship is the oldest and most celebrated international fellowship award. It provides full financial support for selected students to pursue a degree at the University of Oxford.",
      requirements: [
        "Outstanding academic achievement",
        "Leadership potential",
        "Commitment to service",
        "Age 18-24 years",
        "Citizens of eligible countries",
      ],
      deadline: "2025-10-15",
      applicationUrl: "https://rhodeshouse.ox.ac.uk/apply/",
      tags: ["prestigious", "fully-funded", "international", "postgraduate"],
      featured: true,
      views: 1567,
      applications: 234,
      matchScore: 92,
      isSaved: false,
      createdAt: "2025-01-15",
    },
    {
      id: 2,
      title: "Google Software Engineering Internship",
      organization: "Google",
      location: "Mountain View, CA",
      type: "internship",
      amount: "$8,000/month",
      description:
        "Join Google's world-class engineering team for a summer internship. Work on real projects that impact billions of users worldwide while learning from industry experts.",
      requirements: [
        "Currently pursuing Computer Science degree",
        "Strong programming skills",
        "Problem-solving abilities",
        "Collaborative mindset",
      ],
      deadline: "2025-11-30",
      applicationUrl: "https://careers.google.com/students/",
      tags: ["tech", "paid", "summer", "engineering"],
      featured: false,
      views: 3421,
      applications: 892,
      matchScore: 88,
      isSaved: true,
      createdAt: "2025-02-01",
    },
    {
      id: 3,
      title: "Fulbright Fellowship Program",
      organization: "Fulbright Commission",
      location: "Various Countries",
      type: "fellowship",
      amount: "Varies by country",
      description:
        "The Fulbright Program offers research, study and teaching opportunities in over 140 countries worldwide. Promote mutual understanding between nations through educational exchange.",
      requirements: [
        "U.S. citizenship",
        "Bachelor's degree",
        "Language proficiency",
        "Clear project proposal",
      ],
      deadline: "2025-10-31",
      applicationUrl: "https://us.fulbrightonline.org/",
      tags: ["research", "teaching", "cultural-exchange", "international"],
      featured: true,
      views: 2134,
      applications: 445,
      matchScore: 85,
      isSaved: false,
      createdAt: "2025-01-20",
    },
    {
      id: 4,
      title: "Gates Cambridge Scholarship",
      organization: "Gates Cambridge Trust",
      location: "Cambridge, UK",
      type: "scholarship",
      amount: "Full funding + stipend",
      description:
        "The Gates Cambridge Scholarship programme was established to build a global network of future leaders committed to improving the lives of others.",
      requirements: [
        "Outstanding academic record",
        "Leadership potential",
        "Commitment to improving others' lives",
        "Non-UK citizenship",
      ],
      deadline: "2025-12-01",
      applicationUrl: "https://gatescambridge.org/apply/",
      tags: ["prestigious", "fully-funded", "leadership", "postgraduate"],
      featured: false,
      views: 1890,
      applications: 567,
      matchScore: 90,
      isSaved: false,
      createdAt: "2025-02-15",
    },
  ];

  const filteredOpportunities = opportunities
    .filter((opp) => {
      const matchesSearch =
        opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.organization.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = !selectedType || opp.type === selectedType;
      const matchesLocation =
        !selectedLocation ||
        opp.location.toLowerCase().includes(selectedLocation.toLowerCase());

      return matchesSearch && matchesType && matchesLocation;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "deadline":
          return (
            new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
          );
        case "match":
          return (b.matchScore || 0) - (a.matchScore || 0);
        case "popular":
          return b.applications - a.applications;
        default:
          return 0;
      }
    });

  const getTypeColor = (type: string) => {
    switch (type) {
      case "scholarship":
        return "bg-primary-100 text-primary-800";
      case "internship":
        return "bg-secondary-100 text-secondary-800";
      case "fellowship":
        return "bg-warning-100 text-warning-800";
      case "job":
        return "bg-success-100 text-success-800";
      default:
        return "bg-neutral-100 text-neutral-800";
    }
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const toggleSave = (opportunityId: number) => {
    // In real app, this would make an API call
    console.log("Toggle save for opportunity:", opportunityId);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-neutral-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Discover Your Next Opportunity
              </h1>
              <p className="text-xl text-primary-100 max-w-3xl mx-auto">
                Explore scholarships, fellowships, and internships from top
                organizations worldwide. Your journey to global excellence
                starts here.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters */}
          <Card className="mb-8">
            <CardBody className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Search opportunities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Type Filter */}
                <select
                  className="px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="scholarship">Scholarships</option>
                  <option value="fellowship">Fellowships</option>
                  <option value="internship">Internships</option>
                  <option value="job">Jobs</option>
                </select>

                {/* Location Filter */}
                <input
                  type="text"
                  className="px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Location..."
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                />

                {/* Sort */}
                <select
                  className="px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="deadline">Deadline</option>
                  <option value="match">Match Score</option>
                  <option value="popular">Most Popular</option>
                </select>

                <Button variant="secondary" className="flex items-center">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Results Summary */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-neutral-900">
              {filteredOpportunities.length} opportunities found
            </h2>
            <div className="text-sm text-neutral-600">
              Showing personalized matches based on your profile
            </div>
          </div>

          {/* Opportunities List */}
          <div className="space-y-6">
            {filteredOpportunities.map((opportunity) => {
              const daysLeft = getDaysUntilDeadline(opportunity.deadline);

              return (
                <Card
                  key={opportunity.id}
                  className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <CardBody className="p-8">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-2xl font-bold text-neutral-900 hover:text-primary-600 transition-colors">
                            {opportunity.title}
                          </h3>
                          {opportunity.featured && (
                            <div className="flex items-center bg-warning-100 text-warning-800 px-3 py-1 rounded-full text-sm font-medium">
                              <Star className="w-4 h-4 mr-1" />
                              Featured
                            </div>
                          )}
                          <div
                            className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(
                              opportunity.type
                            )}`}
                          >
                            {opportunity.type.charAt(0).toUpperCase() +
                              opportunity.type.slice(1)}
                          </div>
                        </div>

                        <div className="flex items-center text-neutral-600 mb-4 gap-6">
                          <div className="flex items-center">
                            <Award className="w-5 h-5 mr-2" />
                            {opportunity.organization}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-5 h-5 mr-2" />
                            {opportunity.location}
                          </div>
                          {opportunity.amount && (
                            <div className="flex items-center">
                              <DollarSign className="w-5 h-5 mr-2" />
                              {opportunity.amount}
                            </div>
                          )}
                        </div>

                        <p className="text-neutral-700 mb-4 leading-relaxed line-clamp-3">
                          {opportunity.description}
                        </p>

                        {/* Requirements Preview */}
                        <div className="mb-4">
                          <h4 className="font-semibold text-neutral-900 mb-2">
                            Key Requirements:
                          </h4>
                          <ul className="list-disc list-inside text-sm text-neutral-600 space-y-1">
                            {opportunity.requirements
                              .slice(0, 3)
                              .map((req, index) => (
                                <li key={index}>{req}</li>
                              ))}
                            {opportunity.requirements.length > 3 && (
                              <li className="text-primary-600">
                                + {opportunity.requirements.length - 3} more
                                requirements
                              </li>
                            )}
                          </ul>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {opportunity.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition-colors cursor-pointer"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-6 text-sm text-neutral-500">
                          <div className="flex items-center">
                            <Eye className="w-4 h-4 mr-1" />
                            {opportunity.views} views
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {opportunity.applications} applied
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {daysLeft > 0
                              ? `${daysLeft} days left`
                              : "Deadline passed"}
                          </div>
                        </div>
                      </div>

                      {/* Match Score & Actions */}
                      <div className="flex flex-col items-end gap-4 ml-8">
                        {opportunity.matchScore && (
                          <div className="text-center">
                            <div
                              className={`text-2xl font-bold ${
                                opportunity.matchScore >= 90
                                  ? "text-success-600"
                                  : opportunity.matchScore >= 70
                                  ? "text-warning-600"
                                  : "text-neutral-600"
                              }`}
                            >
                              {opportunity.matchScore}%
                            </div>
                            <div className="text-xs text-neutral-500">
                              Match
                            </div>
                          </div>
                        )}

                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => toggleSave(opportunity.id)}
                              className={
                                opportunity.isSaved ? "text-error-600" : ""
                              }
                            >
                              <Heart
                                className={`w-4 h-4 ${
                                  opportunity.isSaved ? "fill-current" : ""
                                }`}
                              />
                            </Button>
                            <Button variant="secondary" size="sm">
                              <Share2 className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="flex flex-col gap-2">
                            <Button size="sm" variant="secondary">
                              <BookOpen className="w-4 h-4 mr-2" />
                              Learn More
                            </Button>
                            {opportunity.applicationUrl && (
                              <Button
                                size="sm"
                                className="bg-primary-600 hover:bg-primary-700 text-white"
                                onClick={() =>
                                  window.open(
                                    opportunity.applicationUrl,
                                    "_blank"
                                  )
                                }
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Apply Now
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Deadline Warning */}
                    {daysLeft <= 7 && daysLeft > 0 && (
                      <div className="mt-4 p-3 bg-warning-50 border border-warning-200 rounded-lg flex items-center">
                        <Clock className="w-5 h-5 text-warning-600 mr-2" />
                        <span className="text-warning-800 font-medium">
                          Deadline approaching: Only {daysLeft} days left to
                          apply!
                        </span>
                      </div>
                    )}
                  </CardBody>
                </Card>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredOpportunities.length === 0 && (
            <Card>
              <CardBody className="text-center py-16">
                <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-12 h-12 text-neutral-400" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                  No opportunities found
                </h3>
                <p className="text-neutral-600 mb-6 max-w-md mx-auto">
                  Try adjusting your search criteria or check back later for new
                  opportunities.
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedType("");
                    setSelectedLocation("");
                  }}
                  variant="secondary"
                >
                  Clear Filters
                </Button>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};
