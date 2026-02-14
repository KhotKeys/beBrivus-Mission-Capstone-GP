import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  MapPin,
  Clock,
  DollarSign,
  Star,
  Heart,
  Share2,
  Award,
  Calendar,
  ExternalLink,
  BookOpen,
  GraduationCap,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button, Card, CardBody } from "../components/ui";
import { Layout } from "../components/layout";
import { HeroSection } from "../components/HeroSection";
import { opportunitiesApi, type Opportunity } from "../api/opportunities";

const OpportunityCard: React.FC<{
  opportunity: Opportunity;
  onSave?: (id: number) => void;
}> = ({ opportunity, onSave }) => {
  const handleSave = () => {
    if (onSave) {
      onSave(opportunity.id);
    }
  };

  const handleApply = async () => {
    try {
      if (opportunity.external_url) {
        window.open(opportunity.external_url, "_blank");
      }
      // Mark as applied in the backend
      await opportunitiesApi.applyToOpportunity(opportunity.id, {});
    } catch (err) {
      console.error("Failed to apply to opportunity:", err);
    }
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log("Share:", opportunity.id);
  };

  const getTypeColor = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case "scholarship":
      case "scholarships":
        return "bg-success-100 text-success-800";
      case "internship":
      case "internships":
        return "bg-primary-100 text-primary-800";
      case "fellowship":
      case "fellowships":
        return "bg-warning-100 text-warning-800";
      case "job":
      case "jobs":
        return "bg-secondary-100 text-secondary-800";
      default:
        return "bg-neutral-100 text-neutral-800";
    }
  };

  const getDaysUntilDeadline = (deadline?: string) => {
    if (!deadline) return null;
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft =
    opportunity.days_remaining ||
    getDaysUntilDeadline(opportunity.application_deadline);

  return (
      <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <CardBody className="p-4 sm:p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 sm:gap-6 md:gap-4 mb-4">
          <div className="flex-1 w-full min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
              <h3 className="text-lg sm:text-2xl font-semibold sm:font-bold text-neutral-900 hover:text-primary-600 transition-colors break-words">
                {opportunity.title}
              </h3>
              <div className="flex flex-wrap gap-2">
                <div
                  className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getTypeColor(
                    opportunity.category_name || "General"
                  )}`}
                >
                  {opportunity.category_name}
                </div>
                {opportunity.remote_allowed && (
                  <div className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    Remote
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 text-neutral-600 mb-4">
              <div className="flex items-center flex-wrap gap-3 sm:gap-6">
                <div className="flex items-center">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                  <span className="text-xs sm:text-base break-words">
                    Published by {opportunity.organization}
                  </span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                  <span className="text-xs sm:text-base break-words">
                    {opportunity.location}
                  </span>
                </div>
              </div>
              {(opportunity.salary_min || opportunity.salary_max) && (
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                  <span className="text-sm sm:text-base">
                    {opportunity.salary_min && opportunity.salary_max
                      ? `${opportunity.salary_min.toLocaleString()} - ${opportunity.salary_max.toLocaleString()} ${
                          opportunity.currency
                        }`
                      : opportunity.salary_min
                      ? `${opportunity.salary_min.toLocaleString()}+ ${
                          opportunity.currency
                        }`
                      : opportunity.salary_max
                      ? `Up to ${opportunity.salary_max.toLocaleString()} ${
                          opportunity.currency
                        }`
                      : ""}
                  </span>
                </div>
              )}
            </div>

            <p className="text-neutral-700 mb-4 leading-relaxed line-clamp-3 text-sm sm:text-base">
              {opportunity.description}
            </p>

            {/* Requirements Preview */}
            {opportunity.requirements && (
              <div className="mb-4">
                <h4 className="font-semibold text-neutral-900 mb-2 text-sm sm:text-base">
                  Requirements:
                </h4>
                <div className="text-xs sm:text-sm text-neutral-600 line-clamp-3">
                  {opportunity.requirements}
                </div>
              </div>
            )}

            {/* Category and Difficulty */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-600">
                {opportunity.category_name}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-600">
                {opportunity.difficulty_level}
              </span>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-2 sm:gap-6 text-xs sm:text-sm text-neutral-500">
              <div className="flex items-center">
                <GraduationCap className="w-4 h-4 mr-1 flex-shrink-0" />
                {opportunity.difficulty_level}
              </div>
              {daysLeft !== null && (
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
                  {daysLeft > 0 ? `${daysLeft} days left` : "Deadline passed"}
                </div>
              )}
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1 flex-shrink-0" />
                {new Date(opportunity.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Match Score & Actions */}
          <div className="flex flex-col sm:flex-row md:flex-col items-center sm:items-center md:items-end gap-3 sm:gap-4 w-full md:w-auto">
            {opportunity.match_score > 0 && (
              <div className="text-center md:text-right">
                <div
                  className={`text-lg sm:text-xl md:text-2xl font-bold ${
                    opportunity.match_score >= 90
                      ? "text-success-600"
                      : opportunity.match_score >= 70
                      ? "text-warning-600"
                      : "text-neutral-600"
                  }`}
                >
                  {opportunity.match_score}%
                </div>
                <div className="text-[11px] sm:text-xs text-neutral-500">Match</div>
              </div>
            )}

            <div className="flex flex-col gap-2 w-full md:w-auto items-center md:items-start">
              <div className="flex gap-2 justify-center">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleSave}
                  className={`h-8 w-8 p-0 text-xs sm:text-sm ${
                    opportunity.is_saved ? "text-error-600" : ""
                  }`}
                >
                  <Heart
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                      opportunity.is_saved ? "fill-current" : ""
                    }`}
                  />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleShare}
                  className="h-8 w-8 p-0"
                >
                  <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>
              </div>

              <div className="flex flex-col gap-2 w-full md:w-auto">
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full md:w-auto text-[11px] sm:text-sm px-3 py-2 justify-center"
                >
                  <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                  Learn More
                </Button>
                {opportunity.external_url && (
                  <Button
                    size="sm"
                    className="w-full md:w-auto text-[11px] sm:text-sm px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white justify-center"
                    onClick={handleApply}
                  >
                    <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                    Apply Now
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Deadline Warning */}
        {daysLeft !== null && daysLeft <= 7 && daysLeft > 0 && (
          <div className="mt-4 p-3 bg-warning-50 border border-warning-200 rounded-lg flex items-center gap-2 text-sm sm:text-base">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-warning-600 flex-shrink-0" />
            <span className="text-warning-800 font-medium">
              Deadline approaching: Only {daysLeft} days left to apply!
            </span>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export const OpportunitiesPage: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("match");

  // Load opportunities on component mount
  useEffect(() => {
    loadOpportunities();
  }, []);

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await opportunitiesApi.getOpportunities();
      setOpportunities(response.results || []);
    } catch (err) {
      console.error("Failed to load opportunities:", err);
      setError("Failed to load opportunities. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Save/unsave opportunity
  const handleSaveOpportunity = async (opportunityId: number) => {
    try {
      const opportunity = opportunities.find((o) => o.id === opportunityId);
      if (!opportunity) return;

      if (opportunity.is_saved) {
        await opportunitiesApi.unsaveOpportunity(opportunityId);
      } else {
        await opportunitiesApi.saveOpportunity(opportunityId);
      }

      // Update local state
      setOpportunities(
        opportunities.map((opp) =>
          opp.id === opportunityId ? { ...opp, is_saved: !opp.is_saved } : opp
        )
      );
    } catch (err) {
      console.error("Failed to save/unsave opportunity:", err);
    }
  };

  const filteredOpportunities = opportunities.filter((opportunity) => {
    const matchesSearch =
      opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opportunity.organization
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      opportunity.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterType === "all" ||
      opportunity.category_name.toLowerCase() === filterType;

    return matchesSearch && matchesFilter;
  });

  const sortedOpportunities = [...filteredOpportunities].sort((a, b) => {
    switch (sortBy) {
      case "match":
        return b.match_score - a.match_score;
      case "date":
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case "deadline":
        if (!a.application_deadline && !b.application_deadline) return 0;
        if (!a.application_deadline) return 1;
        if (!b.application_deadline) return -1;
        return (
          new Date(a.application_deadline).getTime() -
          new Date(b.application_deadline).getTime()
        );
      default:
        return 0;
    }
  });

  return (
    <Layout>
      <HeroSection
        title="Discover Your Next Opportunity"
        subtitle="Explore scholarships, fellowships, and internships from top organizations worldwide. Your journey to global excellence starts here."
      />
      
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
          {/* Filters */}
          <Card className="mb-6 sm:mb-8">
            <CardBody className="p-3 sm:p-4 md:p-6">
              <div className="flex flex-col gap-3 sm:gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2 sm:py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Search opportunities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Controls Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:flex gap-2 sm:gap-3">
                  {/* Category Filter */}
                  <select
                    className="px-3 sm:px-4 py-2 sm:py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-xs sm:text-sm"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    <option value="scholarships">Scholarships</option>
                    <option value="fellowships">Fellowships</option>
                    <option value="internships">Internships</option>
                    <option value="jobs">Jobs</option>
                  </select>

                  {/* Sort */}
                  <select
                    className="px-3 sm:px-4 py-2 sm:py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-xs sm:text-sm"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="match">Best Match</option>
                    <option value="deadline">Deadline</option>
                    <option value="date">Most Recent</option>
                  </select>

                  <Button variant="secondary" className="flex items-center justify-center col-span-1 sm:col-span-2 md:col-span-1 text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-3">
                    <Filter className="w-4 h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">More Filters</span>
                    <span className="sm:hidden">Filters</span>
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Results Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
            <h2 className="text-lg sm:text-xl font-semibold text-neutral-900">
              {sortedOpportunities.length} opportunities found
            </h2>
            <div className="text-xs sm:text-sm text-neutral-600">
              Showing personalized matches based on your profile
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <Card>
              <CardBody className="text-center py-16">
                <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Loader2 className="w-12 h-12 text-neutral-400 animate-spin" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  Loading Opportunities
                </h3>
                <p className="text-neutral-600 mb-8">
                  Please wait while we fetch the latest opportunities for you...
                </p>
              </CardBody>
            </Card>
          )}

          {/* Error State */}
          {error && (
            <Card>
              <CardBody className="text-center py-16">
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-12 h-12 text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  Failed to Load Opportunities
                </h3>
                <p className="text-neutral-600 mb-8">{error}</p>
                <Button
                  onClick={loadOpportunities}
                  className="bg-primary-600 text-white hover:bg-primary-700"
                >
                  Try Again
                </Button>
              </CardBody>
            </Card>
          )}

          {/* Opportunities List */}
          {!loading && !error && (
            <div className="space-y-4 sm:space-y-6">
              {sortedOpportunities.map((opportunity) => (
                <OpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  onSave={handleSaveOpportunity}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && sortedOpportunities.length === 0 && (
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
                    setFilterType("all");
                  }}
                  variant="secondary"
                >
                  Clear Filters
                </Button>
              </CardBody>
            </Card>
          )}

          {/* Load More */}
          {sortedOpportunities.length > 0 && (
            <div className="text-center mt-8">
              <Button variant="secondary">Load More Opportunities</Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
