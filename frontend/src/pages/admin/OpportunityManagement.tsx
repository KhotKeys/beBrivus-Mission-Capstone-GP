import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Star,
  AlertCircle,
} from "lucide-react";
import { Card, CardBody, Button } from "../../components/ui";
import { adminApi } from "../../services/adminApi";
import { AdminHero } from "../../components/admin/AdminHero";
import type { AdminOpportunity } from "../../services/adminApi";

export const OpportunityManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [opportunities, setOpportunities] = useState<AdminOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalOpportunities, setTotalOpportunities] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] =
    useState<AdminOpportunity | null>(null);
  const [visibleCount, setVisibleCount] = useState(5);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    fetchOpportunities();
  }, [selectedType, selectedStatus, searchTerm, currentPage]);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const params: any = { page: currentPage };

      if (selectedType) params.category = selectedType;
      if (selectedStatus !== "") params.is_active = selectedStatus === "active";
      if (searchTerm) params.search = searchTerm;

      const response = await adminApi.getOpportunities(params);
      setOpportunities(response.results);
      setTotalOpportunities(response.count);
    } catch (err) {
      console.error("Error fetching opportunities:", err);
      setError("Failed to load opportunities");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOpportunityStatus = async (opportunityId: number) => {
    try {
      await adminApi.toggleOpportunityStatus(opportunityId);
      // Refresh the opportunities list
      fetchOpportunities();
    } catch (err) {
      console.error("Error toggling opportunity status:", err);
    }
  };

  const handleDeleteOpportunity = async (opportunityId: number) => {
    if (window.confirm("Are you sure you want to delete this opportunity?")) {
      try {
        await adminApi.deleteOpportunity(opportunityId);
        // Refresh the opportunities list
        fetchOpportunities();
      } catch (err) {
        console.error("Error deleting opportunity:", err);
      }
    }
  };

  const handleCreateOpportunity = () => {
    setSelectedOpportunity(null);
    setShowCreateModal(true);
  };

  const handleEditOpportunity = (opportunity: AdminOpportunity) => {
    setSelectedOpportunity(opportunity);
    setShowEditModal(true);
  };

  const handleViewOpportunity = (opportunity: AdminOpportunity) => {
    setSelectedOpportunity(opportunity);
    setShowViewModal(true);
  };

  const handleSaveOpportunity = async (
    opportunityData: Partial<AdminOpportunity>
  ) => {
    try {
      if (selectedOpportunity) {
        await adminApi.updateOpportunity(
          selectedOpportunity.id,
          opportunityData
        );
      } else {
        await adminApi.createOpportunity(opportunityData);
      }
      fetchOpportunities();
      setShowCreateModal(false);
      setShowEditModal(false);
    } catch (err) {
      console.error("Error saving opportunity:", err);
    }
  };

  const handleShowMore = () => {
    setVisibleCount(prev => prev + 5);
    setIsExpanded(true);
  };

  const handleShowLess = () => {
    setVisibleCount(5);
    setIsExpanded(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-neutral-600">Loading opportunities...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchOpportunities} className="mt-4">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? "bg-success-100 text-success-800"
      : "bg-neutral-100 text-neutral-800";
  };

  const getCategoryColor = (categoryName: string) => {
    switch (categoryName?.toLowerCase()) {
      case "scholarships":
        return "bg-primary-100 text-primary-800";
      case "internships":
        return "bg-secondary-100 text-secondary-800";
      case "jobs":
        return "bg-warning-100 text-warning-800";
      case "fellowships":
        return "bg-info-100 text-info-800";
      default:
        return "bg-neutral-100 text-neutral-800";
    }
  };

  return (
    <div>
      <AdminHero 
        title="Opportunity Management" 
        subtitle="Manage scholarships, internships, fellowships, and job opportunities"
        badge={totalOpportunities}
        variant="default"
        backgroundImage="/opportunitry-management.png"
      />

      <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div style={{ visibility: 'hidden', height: 0 }}>
          <h1 className="text-2xl font-bold text-neutral-900">
            Opportunity Management
          </h1>
          <p className="text-neutral-600 mt-1">
            Manage scholarships, internships, fellowships, and job opportunities
          </p>
        </div>
        <Button
          className="bg-primary-600 hover:bg-primary-700 text-white w-full sm:w-auto"
          onClick={handleCreateOpportunity}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Opportunity
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Total Opportunities</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {totalOpportunities.toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Plus className="w-5 h-5 text-primary-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Active Opportunities</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {opportunities.filter((o) => o.is_active).length}
                </p>
              </div>
              <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
                <Plus className="w-5 h-5 text-success-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Remote Opportunities</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {opportunities.filter((o) => o.remote_allowed).length}
                </p>
              </div>
              <div className="w-10 h-10 bg-info-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-info-600" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardBody className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-neutral-400" />
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Search opportunities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <select
              className="w-full md:w-auto px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="scholarships">Scholarships</option>
              <option value="internships">Internships</option>
              <option value="jobs">Jobs</option>
              <option value="fellowships">Fellowships</option>
            </select>

            {/* Status Filter */}
            <select
              className="w-full md:w-auto px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <Button variant="secondary" className="flex items-center w-full md:w-auto">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Opportunities List */}
      <div style={{ maxHeight: '500px', overflowY: 'auto', scrollBehavior: 'smooth' }}>
        <div className="space-y-4">
          {opportunities.slice(0, visibleCount).map((opportunity) => (
          <Card
            key={opportunity.id}
            className="hover:shadow-lg transition-shadow"
          >
            <CardBody className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-neutral-900">
                      {opportunity.title}
                    </h3>
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                        opportunity.category_name
                      )}`}
                    >
                      {opportunity.category_name}
                    </div>
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        opportunity.is_active
                      )}`}
                    >
                      {opportunity.is_active ? "Active" : "Inactive"}
                    </div>
                  </div>

                  <p className="text-neutral-600 mb-3">
                    Published by {opportunity.organization}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {opportunity.location}
                      {opportunity.remote_allowed && " (Remote)"}
                    </div>
                    {opportunity.application_deadline && (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Deadline:{" "}
                        {new Date(
                          opportunity.application_deadline
                        ).toLocaleDateString()}
                      </div>
                    )}
                    {(opportunity.salary_min || opportunity.salary_max) && (
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {opportunity.salary_min && opportunity.salary_max
                          ? `${opportunity.salary_min.toLocaleString()}-${opportunity.salary_max.toLocaleString()}`
                          : opportunity.salary_min?.toLocaleString() ||
                            opportunity.salary_max?.toLocaleString()}{" "}
                        {opportunity.currency}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-6 mt-4 text-sm text-neutral-500">
                    <div>
                      Posted:{" "}
                      {new Date(opportunity.created_at).toLocaleDateString()}
                    </div>
                    <div>Level: {opportunity.difficulty_level}</div>
                    <div>Views: {opportunity.views_count}</div>
                    <div>Applications: {opportunity.applications_count}</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={() => handleViewOpportunity(opportunity)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  {opportunity.posted_by_type === 'admin' && (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={() => handleEditOpportunity(opportunity)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={() =>
                          handleToggleOpportunityStatus(opportunity.id)
                        }
                      >
                        {opportunity.is_active ? "Deactivate" : "Activate"}
                      </Button>
                    </>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={() => handleDeleteOpportunity(opportunity.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
        </div>
      </div>

      {/* Show More / Show Less */}
      {opportunities.length > 5 && (
        <div style={{ textAlign: 'center', marginTop: '12px' }}>
          {visibleCount < opportunities.length ? (
            <button onClick={handleShowMore}
              style={{
                color: '#125B66',
                background: 'none',
                border: '1px solid #125B66',
                borderRadius: '8px',
                padding: '8px 20px',
                cursor: 'pointer',
                fontSize: '14px',
              }}>
              Show More ({opportunities.length - visibleCount} remaining)
            </button>
          ) : (
            <button onClick={handleShowLess}
              style={{
                color: '#6b7280',
                background: 'none',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px 20px',
                cursor: 'pointer',
                fontSize: '14px',
              }}>
              Show Less
            </button>
          )}
        </div>
      )}

      {/* Empty State */}
      {opportunities.length === 0 && (
        <Card>
          <CardBody className="text-center py-12">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              No opportunities found
            </h3>
            <p className="text-neutral-600 mb-6">
              Try adjusting your search criteria or create a new opportunity.
            </p>
            <Button
              className="bg-primary-600 hover:bg-primary-700 text-white"
              onClick={handleCreateOpportunity}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Opportunity
            </Button>
          </CardBody>
        </Card>
      )}

      {/* Modals */}
      {showCreateModal && (
        <OpportunityModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSave={handleSaveOpportunity}
          opportunity={null}
          title="Create New Opportunity"
        />
      )}

      {showEditModal && selectedOpportunity && (
        <OpportunityModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveOpportunity}
          opportunity={selectedOpportunity}
          title="Edit Opportunity"
        />
      )}

      {showViewModal && selectedOpportunity && (
        <OpportunityViewModal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          opportunity={selectedOpportunity}
        />
      )}
      </div>
    </div>
  );
};

// Modal components
interface OpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<AdminOpportunity>) => void;
  opportunity: AdminOpportunity | null;
  title: string;
}

const OpportunityModal: React.FC<OpportunityModalProps> = ({
  isOpen,
  onClose,
  onSave,
  opportunity,
  title,
}) => {
  const [formData, setFormData] = useState<Partial<AdminOpportunity>>({
    title: opportunity?.title || "",
    organization: opportunity?.organization || "",
    location: opportunity?.location || "",
    description: opportunity?.description || "",
    requirements: opportunity?.requirements || "",
    benefits: opportunity?.benefits || "",
    salary_min: opportunity?.salary_min || undefined,
    salary_max: opportunity?.salary_max || undefined,
    currency: opportunity?.currency || "USD",
    remote_allowed: opportunity?.remote_allowed || false,
    category: opportunity?.category || 1,
    difficulty_level: opportunity?.difficulty_level || "intermediate",
    status: opportunity?.status || "published",
    featured: opportunity?.featured || false,
    external_url: opportunity?.external_url || "",
    application_deadline: opportunity?.application_deadline || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
          ? value
            ? Number(value)
            : undefined
          : value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Organization *
                </label>
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Difficulty Level
                </label>
                <select
                  name="difficulty_level"
                  value={formData.difficulty_level}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Salary Min
                </label>
                <input
                  type="number"
                  name="salary_min"
                  value={formData.salary_min || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Salary Max
                </label>
                <input
                  type="number"
                  name="salary_max"
                  value={formData.salary_max || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Application Deadline
                </label>
                <input
                  type="datetime-local"
                  name="application_deadline"
                  value={
                    formData.application_deadline
                      ? new Date(formData.application_deadline)
                          .toISOString()
                          .slice(0, 16)
                      : ""
                  }
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  External URL
                </label>
                <input
                  type="url"
                  name="external_url"
                  value={formData.external_url}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="remote_allowed"
                  checked={formData.remote_allowed}
                  onChange={handleChange}
                  className="mr-2"
                />
                Remote Allowed
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="mr-2"
                />
                Featured
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary-600 hover:bg-primary-700 text-white"
              >
                {opportunity ? "Update" : "Create"} Opportunity
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

interface OpportunityViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: AdminOpportunity;
}

const OpportunityViewModal: React.FC<OpportunityViewModalProps> = ({
  isOpen,
  onClose,
  opportunity,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">View Opportunity</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <p className="text-gray-900">{opportunity.title}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization
                </label>
                <p className="text-gray-900">Published by {opportunity.organization}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <p className="text-gray-900">{opportunity.category_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <p className="text-gray-900">
                  {opportunity.location}{" "}
                  {opportunity.remote_allowed && "(Remote)"}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <p className="text-gray-900 whitespace-pre-wrap">
                {opportunity.description}
              </p>
            </div>

            {opportunity.requirements && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Requirements
                </label>
                <p className="text-gray-900 whitespace-pre-wrap">
                  {opportunity.requirements}
                </p>
              </div>
            )}

            {opportunity.benefits && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Benefits
                </label>
                <p className="text-gray-900 whitespace-pre-wrap">
                  {opportunity.benefits}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Salary Range
                </label>
                <p className="text-gray-900">
                  {opportunity.salary_min && opportunity.salary_max
                    ? `${opportunity.salary_min.toLocaleString()} - ${opportunity.salary_max.toLocaleString()} ${
                        opportunity.currency
                      }`
                    : "Not specified"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty Level
                </label>
                <p className="text-gray-900 capitalize">
                  {opportunity.difficulty_level}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Application Deadline
                </label>
                <p className="text-gray-900">
                  {new Date(
                    opportunity.application_deadline
                  ).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    opportunity.is_active
                      ? "bg-[#e6f2f3] text-[#09373f]"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {opportunity.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Views
                </label>
                <p className="text-gray-900">
                  {opportunity.views_count.toLocaleString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Applications
                </label>
                <p className="text-gray-900">
                  {opportunity.applications_count.toLocaleString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Featured
                </label>
                <p className="text-gray-900">
                  {opportunity.featured ? "Yes" : "No"}
                </p>
              </div>
            </div>

            {opportunity.external_url && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  External URL
                </label>
                <a
                  href={opportunity.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-800"
                >
                  {opportunity.external_url}
                </a>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button onClick={onClose}>Close</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
