import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showDetail, setShowDetail] = useState(false);

  const handleSave = () => { if (onSave) onSave(opportunity.id); };

  const handleApply = async () => {
    // If external application, open external link
    if (opportunity.application_type === 'external' && opportunity.external_url) {
      window.open(opportunity.external_url, "_blank");
      // Track that user clicked
      try {
        await opportunitiesApi.applyToOpportunity(opportunity.id, { status: 'clicked' });
      } catch (err) {
        console.error("Failed to track click:", err);
      }
    } else {
      // Internal application - navigate to application form
      navigate(`/opportunities/${opportunity.id}/apply`);
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
                    {t("Remote")}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 text-neutral-600 mb-4">
              <div className="flex items-center flex-wrap gap-3 sm:gap-6">
                <div className="flex items-center">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                  <span className="text-xs sm:text-base break-words">
                    {t("Published by")} {opportunity.organization}
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
                  {t("Requirements")}:
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
                  {daysLeft > 0 ? `${daysLeft} ${t("days left")}` : t("Deadline passed")}
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
                  onClick={() => setShowDetail(true)}
                >
                  <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                  {t("Learn More")}
                </Button>
                <Button
                  size="sm"
                  className="w-full md:w-auto text-[11px] sm:text-sm px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white justify-center"
                  onClick={handleApply}
                >
                  {opportunity.application_type === 'external' ? (
                    <>
                      <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                      {t("Apply Externally")}
                    </>
                  ) : (
                    <>
                      <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                      {t("Apply Now")}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Deadline Warning */}
        {daysLeft !== null && daysLeft <= 7 && daysLeft > 0 && (
          <div className="mt-4 p-3 bg-warning-50 border border-warning-200 rounded-lg flex items-center gap-2 text-sm sm:text-base">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-warning-600 flex-shrink-0" />
            <span className="text-warning-800 font-medium">
              {t("Deadline approaching: Only")} {daysLeft} {t("days left to apply!")}
            </span>
          </div>
        )}
      </CardBody>

      {showDetail && createPortal(
        <div
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px', boxSizing: 'border-box',
          }}
          onClick={() => setShowDetail(false)}
        >
          {/* Background image */}
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            backgroundImage: 'url(/opportunitry-management.png)',
            backgroundSize: 'cover', backgroundPosition: 'center',
            filter: 'blur(4px)', transform: 'scale(1.05)',
          }} />
          {/* Dim overlay */}
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.5)',
          }} />
          {/* Modal card */}
          <div
            style={{
              position: 'relative', zIndex: 1,
              background: '#fff', borderRadius: '12px',
              width: '100%', maxWidth: '680px',
              maxHeight: '90vh', overflowY: 'auto',
              padding: '24px', boxSizing: 'border-box',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button onClick={() => setShowDetail(false)}
              style={{ position: 'absolute', top: '14px', right: '14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', lineHeight: 1, color: '#6b7280' }}
              aria-label="Close">✕</button>

            {/* ── BASIC INFORMATION ── */}
            <div style={{ marginBottom: '18px', paddingRight: '28px' }}>
              <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca3af', margin: '0 0 8px' }}>Basic Information</p>
              <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#111827', margin: '0 0 8px', lineHeight: 1.3 }}>{opportunity.title}</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '10px' }}>
                <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, background: '#e0f2fe', color: '#0369a1' }}>{opportunity.category_name}</span>
                <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, background: '#f3f4f6', color: '#374151' }}>{opportunity.difficulty_level}</span>
                <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, background: opportunity.application_type === 'external' ? '#fef3c7' : '#d1fae5', color: opportunity.application_type === 'external' ? '#92400e' : '#065f46' }}>
                  {opportunity.application_type === 'external' ? 'External Application' : 'Internal (Platform)'}
                </span>
                {opportunity.remote_allowed && <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, background: '#dbeafe', color: '#1d4ed8' }}>Remote</span>}
                {opportunity.featured && <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, background: '#fef9c3', color: '#854d0e' }}>⭐ Featured</span>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: '8px', fontSize: '12px', color: '#4b5563' }}>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <Award style={{ width: 13, height: 13, marginTop: 2, flexShrink: 0, color: '#6b7280' }} />
                  <div><div style={{ fontSize: '9px', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', marginBottom: 1 }}>Organization</div>{String(opportunity.organization)}</div>
                </div>
                {opportunity.location && (
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <MapPin style={{ width: 13, height: 13, marginTop: 2, flexShrink: 0, color: '#6b7280' }} />
                    <div><div style={{ fontSize: '9px', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', marginBottom: 1 }}>Location</div>{opportunity.location}</div>
                  </div>
                )}
                {opportunity.application_deadline && (
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <Calendar style={{ width: 13, height: 13, marginTop: 2, flexShrink: 0, color: '#6b7280' }} />
                    <div>
                      <div style={{ fontSize: '9px', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', marginBottom: 1 }}>Application Deadline</div>
                      {new Date(opportunity.application_deadline).toLocaleDateString()}
                      {daysLeft !== null && (
                        <span style={{ marginLeft: 4, fontSize: '10px', color: daysLeft <= 7 ? '#dc2626' : '#6b7280' }}>
                          ({daysLeft > 0 ? `${daysLeft} days left` : 'Passed'})
                        </span>
                      )}
                    </div>
                  </div>
                )}
                {(opportunity.salary_min || opportunity.salary_max) && (
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <DollarSign style={{ width: 13, height: 13, marginTop: 2, flexShrink: 0, color: '#6b7280' }} />
                    <div>
                      <div style={{ fontSize: '9px', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', marginBottom: 1 }}>Amount / Stipend</div>
                      {opportunity.salary_min && opportunity.salary_max
                        ? `${opportunity.salary_min.toLocaleString()} – ${opportunity.salary_max.toLocaleString()} ${opportunity.currency}`
                        : opportunity.salary_min
                        ? `${opportunity.salary_min.toLocaleString()}+ ${opportunity.currency}`
                        : `Up to ${opportunity.salary_max?.toLocaleString()} ${opportunity.currency}`}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <hr style={{ margin: '0 0 14px', borderColor: '#e5e7eb' }} />

            {/* ── DESCRIPTION & DETAILS ── */}
            <div style={{ marginBottom: '14px' }}>
              <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca3af', margin: '0 0 10px' }}>Description &amp; Details</p>

              <div style={{ marginBottom: '12px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 600, color: '#111827', margin: '0 0 4px' }}>Description</h4>
                <p style={{ fontSize: '13px', color: '#374151', lineHeight: 1.65, whiteSpace: 'pre-wrap', margin: 0 }}>{opportunity.description}</p>
              </div>

              {opportunity.requirements && (
                <div style={{ marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '12px', fontWeight: 600, color: '#111827', margin: '0 0 4px' }}>Requirements</h4>
                  <p style={{ fontSize: '13px', color: '#374151', lineHeight: 1.65, whiteSpace: 'pre-wrap', margin: 0 }}>{opportunity.requirements}</p>
                </div>
              )}

              {opportunity.benefits && (
                <div style={{ marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '12px', fontWeight: 600, color: '#111827', margin: '0 0 4px' }}>Benefits</h4>
                  <p style={{ fontSize: '13px', color: '#374151', lineHeight: 1.65, whiteSpace: 'pre-wrap', margin: 0 }}>{opportunity.benefits}</p>
                </div>
              )}

              {opportunity.application_process && (
                <div style={{ marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '12px', fontWeight: 600, color: '#111827', margin: '0 0 4px' }}>Application Process</h4>
                  <p style={{ fontSize: '13px', color: '#374151', lineHeight: 1.65, whiteSpace: 'pre-wrap', margin: 0 }}>{opportunity.application_process}</p>
                </div>
              )}
            </div>

            {/* ── CONTACT & LINKS ── */}
            {opportunity.external_url && (
              <>
                <hr style={{ margin: '0 0 14px', borderColor: '#e5e7eb' }} />
                <div style={{ marginBottom: '14px' }}>
                  <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca3af', margin: '0 0 8px' }}>Contact &amp; Links</p>
                  <div style={{ fontSize: '12px' }}>
                    <span style={{ color: '#6b7280', marginRight: 6 }}>External URL:</span>
                    <a href={opportunity.external_url} target="_blank" rel="noopener noreferrer"
                      style={{ color: '#4f46e5', wordBreak: 'break-all' }}>{opportunity.external_url}</a>
                  </div>
                </div>
              </>
            )}

            {/* ── ACTIONS ── */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
              <button onClick={() => { setShowDetail(false); handleApply(); }}
                style={{ flex: '1 1 120px', padding: '10px 16px', borderRadius: '8px', background: '#4f46e5', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>
                {opportunity.application_type === 'external' ? 'Apply Externally' : 'Apply Now'}
              </button>
              <button onClick={() => setShowDetail(false)}
                style={{ flex: '1 1 80px', padding: '10px 16px', borderRadius: '8px', background: '#f3f4f6', color: '#374151', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </Card>
  );
};

export const OpportunitiesPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("match");
  const [visibleCount, setVisibleCount] = useState(5);

  // Reset visible count when filters/search change
  useEffect(() => { setVisibleCount(5); }, [searchTerm, filterType, sortBy]);

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
        key={i18n.language}
        title={t('Discover Your Next Opportunity')}
        subtitle={t('Opportunities hero description')}
      />
      
      <div className="min-h-screen bg-neutral-50">
        <div className="w-full min-w-0 overflow-x-hidden px-2 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
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
                    placeholder={t("Search opportunities")}
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
                    <option value="all">{t("All Categories")}</option>
                    <option value="scholarships">{t("Scholarships")}</option>
                    <option value="fellowships">{t("Fellowships")}</option>
                    <option value="internships">{t("Internships")}</option>
                    <option value="jobs">{t("Jobs")}</option>
                  </select>

                  {/* Sort */}
                  <select
                    className="px-3 sm:px-4 py-2 sm:py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-xs sm:text-sm"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="match">{t("Best Match")}</option>
                    <option value="deadline">{t("Deadline")}</option>
                    <option value="date">{t("Most Recent")}</option>
                  </select>

                  <Button variant="secondary" className="flex items-center justify-center col-span-1 sm:col-span-2 md:col-span-1 text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-3">
                    <Filter className="w-4 h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">{t("More Filters")}</span>
                    <span className="sm:hidden">{t("Filters")}</span>
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Results Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
            <h2 className="text-lg sm:text-xl font-semibold text-neutral-900">
              {sortedOpportunities.length} {t("opportunities found")}
            </h2>
            <div className="text-xs sm:text-sm text-neutral-600">
              {t("Showing personalized matches based on your profile")}
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
                  {t("Loading Opportunities")}
                </h3>
                <p className="text-neutral-600 mb-8">
                  {t("Please wait while we fetch the latest opportunities for you...")}
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
                  {t("Failed to Load Opportunities")}
                </h3>
                <p className="text-neutral-600 mb-8">{error}</p>
                <Button
                  onClick={loadOpportunities}
                  className="bg-primary-600 text-white hover:bg-primary-700"
                >
                  {t("Try Again")}
                </Button>
              </CardBody>
            </Card>
          )}

          {/* Opportunities List */}
          {!loading && !error && (
            <div className="space-y-4 sm:space-y-6">
              {sortedOpportunities.slice(0, visibleCount).map((opportunity) => (
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
                  {t("No opportunities found")}
                </h3>
                <p className="text-neutral-600 mb-6 max-w-md mx-auto">
                  {t("Try adjusting your search criteria or check back later for new opportunities.")}
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterType("all");
                  }}
                  variant="secondary"
                >
                  {t("Clear Filters")}
                </Button>
              </CardBody>
            </Card>
          )}

          {/* Load More */}
          {sortedOpportunities.length > visibleCount && (
            <div className="text-center mt-8">
              <Button
                variant="secondary"
                onClick={() => setVisibleCount((c) => c + 5)}
              >
                {t("Load More Opportunities")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

