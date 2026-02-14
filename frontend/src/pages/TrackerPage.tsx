import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  FileText,
  ExternalLink,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Layout } from "../components/layout/Layout";
import { HeroSection } from "../components/HeroSection";
import { applicationsApi, type ApplicationData } from "../api/applications";
import { opportunitiesApi, type Opportunity } from "../api/opportunities";

// Use the ApplicationData interface from the API
type Application = ApplicationData;

const getStatusColor = (status: Application["status"]) => {
  switch (status) {
    case "draft":
      return "secondary";
    case "clicked":
      return "secondary";
    case "under_review":
      return "warning";
    case "interview_scheduled":
      return "primary";
    case "accepted":
      return "success";
    case "rejected":
      return "error";
    case "withdrawn":
      return "secondary";
    default:
      return "secondary";
  }
};

const getStatusIcon = (status: Application["status"]) => {
  switch (status) {
    case "draft":
      return <FileText className="h-4 w-4" />;
    case "clicked":
      return <Clock className="h-4 w-4" />;
    case "under_review":
      return <AlertCircle className="h-4 w-4" />;
    case "interview_scheduled":
      return <Calendar className="h-4 w-4" />;
    case "accepted":
      return <CheckCircle className="h-4 w-4" />;
    case "rejected":
      return <XCircle className="h-4 w-4" />;
    case "withdrawn":
      return <XCircle className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const getStatusLabel = (status: Application["status"]) => {
  switch (status) {
    case "draft":
      return "Draft";
    case "clicked":
      return "Clicked";
    case "under_review":
      return "Under Review";
    case "interview_scheduled":
      return "Interview Scheduled";
    case "accepted":
      return "Accepted";
    case "rejected":
      return "Rejected";
    case "withdrawn":
      return "Withdrawn";
    default:
      return status;
  }
};

const ApplicationCard: React.FC<{
  application: Application;
  onEdit?: (application: Application) => void;
  onDelete?: (id: number) => void;
  onView?: (application: Application) => void;
}> = ({ application, onEdit, onDelete, onView }) => {
  const handleView = () => {
    if (onView) {
      onView(application);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(application);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(application.id);
    }
  };

  const handleViewJob = () => {
    // Try to open the opportunity's external URL if available
    console.log("View job details for:", application.opportunity_title);
    // This would need to be enhanced to get the opportunity details
  };

  const isUpcoming = application.is_upcoming_action;

  return (
    <Card
      className={`p-4 sm:p-6 hover:shadow-lg transition-shadow ${
        isUpcoming ? "border-primary-200 bg-primary-50" : ""
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
            <h3 className="text-base sm:text-xl font-semibold text-gray-900 break-words">
              {application.opportunity_title}
            </h3>
            <Badge
              variant={getStatusColor(application.status)}
              className="text-xs flex items-center gap-1 w-fit"
            >
              {getStatusIcon(application.status)}
              {getStatusLabel(application.status)}
            </Badge>
          </div>
          <p className="text-sm sm:text-lg text-gray-700 mb-1 break-words">
            {application.company_name}
          </p>
          <p className="text-xs sm:text-sm text-gray-600 mb-2 break-words">
            {application.location}
          </p>
          <p className="text-xs sm:text-sm text-gray-600 font-medium break-words">
            {application.salary_range}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="ghost" size="sm" onClick={handleView}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleViewJob}>
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {application.notes && (
        <div className="mb-4">
          <p className="text-gray-600 text-xs sm:text-sm line-clamp-2">
            {application.notes}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">
            Application Date
          </p>
          <p className="text-xs sm:text-sm text-gray-900">
            {application.submitted_at
              ? new Date(application.submitted_at).toLocaleDateString()
              : "Not submitted yet"}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">Next Action</p>
          <p className="text-xs sm:text-sm text-gray-900">
            {application.next_action_date ? "Follow up" : "No action needed"}
          </p>
          {application.next_action_date && (
            <p className="text-xs text-gray-500">
              {new Date(application.next_action_date).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      {application.interview_date && (
        <div className="border-t pt-3">
          <p className="text-xs font-medium text-gray-500 mb-2">
            Interview Date
          </p>
          <Badge variant="primary" className="text-xs">
            <Calendar className="h-3 w-3 mr-1" />
            {new Date(application.interview_date).toLocaleDateString()}
          </Badge>
        </div>
      )}
    </Card>
  );
};

// Add Application Modal Component
const AddApplicationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}> = ({ isOpen, onClose, onSubmit }) => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    opportunity: "",
    status: "clicked",
    submitted_at: new Date().toISOString().split("T")[0],
    notes: "",
    cover_letter: "",
  });

  useEffect(() => {
    if (isOpen) {
      loadOpportunities();
    }
  }, [isOpen]);

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      const response = await opportunitiesApi.getOpportunities();
      setOpportunities(response.results || []);
    } catch (err) {
      console.error("Failed to load opportunities:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      opportunity: parseInt(formData.opportunity),
    });
    setFormData({
      opportunity: "",
      status: "clicked",
      submitted_at: new Date().toISOString().split("T")[0],
      notes: "",
      cover_letter: "",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add Application</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Opportunity *
            </label>
            {loading ? (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              <select
                value={formData.opportunity}
                onChange={(e) =>
                  setFormData({ ...formData, opportunity: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="">Select an opportunity</option>
                {opportunities.map((opp) => (
                  <option key={opp.id} value={opp.id}>
                    {opp.title} - {opp.company}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="draft">Draft</option>
              <option value="clicked">Clicked</option>
              <option value="under_review">Under Review</option>
              <option value="interview_scheduled">Interview Scheduled</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Application Date
            </label>
            <Input
              type="date"
              value={formData.submitted_at}
              onChange={(e) =>
                setFormData({ ...formData, submitted_at: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              placeholder="Any notes about this application..."
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Add Application
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// View Application Modal Component
const ViewApplicationModal: React.FC<{
  isOpen: boolean;
  application: Application;
  onClose: () => void;
  onEdit: () => void;
}> = ({ isOpen, application, onClose, onEdit }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Application Details</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Job Information */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {application.opportunity_title}
            </h3>
            <p className="text-lg text-gray-700 mb-1">
              {application.company_name}
            </p>
            <p className="text-gray-600">{application.location}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge
                variant={getStatusColor(application.status)}
                className="flex items-center gap-1"
              >
                {getStatusIcon(application.status)}
                {getStatusLabel(application.status)}
              </Badge>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                Employment Type
              </p>
              <p className="text-gray-900">
                {application.employment_type || "Not specified"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                Salary Range
              </p>
              <p className="text-gray-900">{application.salary_range}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                Submitted Date
              </p>
              <p className="text-gray-900">
                {application.submitted_at
                  ? new Date(application.submitted_at).toLocaleDateString()
                  : "Not submitted yet"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                Days Since Applied
              </p>
              <p className="text-gray-900">
                {application.days_since_applied} days
              </p>
            </div>
            {application.interview_date && (
              <div className="sm:col-span-2">
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Interview Date
                </p>
                <p className="text-gray-900">
                  {new Date(application.interview_date).toLocaleDateString()} at{" "}
                  {new Date(application.interview_date).toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>

          {/* Notes */}
          {application.notes && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Notes</h4>
              <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                {application.notes}
              </p>
            </div>
          )}

          {/* Cover Letter */}
          {application.cover_letter && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Cover Letter
              </h4>
              <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                {application.cover_letter}
              </p>
            </div>
          )}

          {/* Next Action */}
          {application.next_action_date && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <h4 className="text-sm font-medium text-gray-900">
                  Upcoming Action
                </h4>
              </div>
              <p className="text-sm text-gray-700">
                Follow up required by{" "}
                {new Date(application.next_action_date).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Edit Application Modal Component
const EditApplicationModal: React.FC<{
  isOpen: boolean;
  application: Application;
  onClose: () => void;
  onSubmit: (data: any) => void;
}> = ({ isOpen, application, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    status: application.status,
    submitted_at: application.submitted_at
      ? new Date(application.submitted_at).toISOString().split("T")[0]
      : "",
    interview_date: application.interview_date
      ? new Date(application.interview_date).toISOString().slice(0, 16)
      : "",
    notes: application.notes || "",
    cover_letter: application.cover_letter || "",
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        status: application.status,
        submitted_at: application.submitted_at
          ? new Date(application.submitted_at).toISOString().split("T")[0]
          : "",
        interview_date: application.interview_date
          ? new Date(application.interview_date).toISOString().slice(0, 16)
          : "",
        notes: application.notes || "",
        cover_letter: application.cover_letter || "",
      });
    }
  }, [isOpen, application]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      interview_date: formData.interview_date || null,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Application</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Read-only job info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-semibold text-gray-900">
              {application.opportunity_title}
            </p>
            <p className="text-sm text-gray-600">{application.company_name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status *</label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="draft">Draft</option>
              <option value="clicked">Clicked</option>
              <option value="under_review">Under Review</option>
              <option value="interview_scheduled">Interview Scheduled</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Submitted Date
            </label>
            <Input
              type="date"
              value={formData.submitted_at}
              onChange={(e) =>
                setFormData({ ...formData, submitted_at: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Interview Date & Time
            </label>
            <Input
              type="datetime-local"
              value={formData.interview_date}
              onChange={(e) =>
                setFormData({ ...formData, interview_date: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              placeholder="Add any notes about this application..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Cover Letter
            </label>
            <textarea
              value={formData.cover_letter}
              onChange={(e) =>
                setFormData({ ...formData, cover_letter: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={4}
              placeholder="Your cover letter content..."
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Save Changes
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const TrackerPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const [sortBy, setSortBy] = useState<string>("date");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);

  // Load applications on component mount
  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await applicationsApi.getApplications({
        ordering: "-submitted_at",
      });
      setApplications(response.results || []);
    } catch (err) {
      console.error("Failed to load applications:", err);
      setError("Failed to load applications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteApplication = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this application?")) {
      try {
        await applicationsApi.deleteApplication(id);
        setApplications(applications.filter((app) => app.id !== id));
      } catch (err) {
        console.error("Failed to delete application:", err);
        alert("Failed to delete application. Please try again.");
      }
    }
  };

  const handleAddApplication = async (data: any) => {
    try {
      const newApplication = await applicationsApi.createApplication(data);
      setApplications([newApplication, ...applications]);
      setShowAddModal(false);
    } catch (err) {
      console.error("Failed to create application:", err);
      alert("Failed to create application. Please try again.");
    }
  };

  const handleViewApplication = (application: Application) => {
    setSelectedApplication(application);
    setShowViewModal(true);
  };

  const handleEditApplication = (application: Application) => {
    setSelectedApplication(application);
    setShowEditModal(true);
  };

  const handleUpdateApplication = async (data: any) => {
    if (!selectedApplication) return;

    try {
      const updatedApplication = await applicationsApi.updateApplication(
        selectedApplication.id,
        data
      );
      setApplications(
        applications.map((app) =>
          app.id === selectedApplication.id ? updatedApplication : app
        )
      );
      setShowEditModal(false);
      setSelectedApplication(null);
    } catch (err) {
      console.error("Failed to update application:", err);
      alert("Failed to update application. Please try again.");
    }
  };

  const filteredApplications = applications.filter((application) => {
    const matchesSearch =
      application.opportunity_title
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      application.company_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || application.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const sortedApplications = [...filteredApplications].sort((a, b) => {
    switch (sortBy) {
      case "date":
        const dateA = a.submitted_at ? new Date(a.submitted_at).getTime() : 0;
        const dateB = b.submitted_at ? new Date(b.submitted_at).getTime() : 0;
        return dateB - dateA;
      case "company":
        return a.company_name.localeCompare(b.company_name);
      case "status":
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });

  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const upcomingActions = applications.filter((app) => app.is_upcoming_action);

  if (loading) {
    return (
      <Layout>
        <HeroSection
          title="Application Tracker"
          subtitle="Track every application, milestone, and next step in one place."
          backgroundImage="/tracker.jpeg"
          showZigZag
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-600" />
              <p className="text-gray-600">Loading applications...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <HeroSection
          title="Application Tracker"
          subtitle="Track every application, milestone, and next step in one place."
          backgroundImage="/tracker.jpeg"
          showZigZag
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={loadApplications}>Try Again</Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <HeroSection
        title="Application Tracker"
        subtitle="Track every application, milestone, and next step in one place."
        backgroundImage="/tracker.jpeg"
        showZigZag
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8 text-center sm:text-left">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
              Your Applications
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Review progress, update statuses, and plan next actions.
            </p>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Application
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Total Applications</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {applications.length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">In Progress</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {(statusCounts["clicked"] || 0) +
                    (statusCounts["under_review"] || 0) +
                    (statusCounts["interview_scheduled"] || 0)}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Accepted</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {statusCounts["accepted"] || 0}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Upcoming Actions</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {upcomingActions.length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Upcoming Actions */}
        {upcomingActions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
              Upcoming Actions
            </h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="space-y-3">
                {upcomingActions.map((app) => (
                  <div
                    key={app.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm sm:text-base font-medium text-gray-900">
                          Follow up required for {app.opportunity_title}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {app.company_name} • {app.location}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <div className="text-left sm:text-right">
                        <p className="text-xs sm:text-sm font-medium text-gray-900">
                          {app.next_action_date
                            ? new Date(
                                app.next_action_date
                              ).toLocaleDateString()
                            : "Soon"}
                        </p>
                        <p className="text-[11px] sm:text-xs text-gray-500">
                          {app.days_since_applied} days since applied
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewApplication(app)}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                <Input
                  type="text"
                  placeholder="Search applications by job title or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 sm:pl-10 text-sm sm:text-base"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base w-full"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="clicked">Clicked</option>
                <option value="under_review">Under Review</option>
                <option value="interview_scheduled">Interview Scheduled</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base w-full"
              >
                <option value="date">Latest First</option>
                <option value="company">Company</option>
                <option value="status">Status</option>
              </select>
              <Button variant="outline" className="w-full lg:w-auto text-sm sm:text-base justify-center">
                <Filter className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm sm:text-base text-gray-600">
            Showing {sortedApplications.length} of {applications.length}{" "}
            applications
          </p>
        </div>

        {/* Applications List */}
        <div className="space-y-4 sm:space-y-6">
          {sortedApplications.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              onView={handleViewApplication}
              onEdit={handleEditApplication}
              onDelete={handleDeleteApplication}
            />
          ))}
        </div>

        {sortedApplications.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No applications found
            </h3>
            <p className="text-gray-600 mb-4">
              Start tracking your job applications to stay organized
            </p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Application
            </Button>
          </div>
        )}

        {/* Add Application Modal */}
        <AddApplicationModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddApplication}
        />

        {/* View Application Modal */}
        {selectedApplication && (
          <ViewApplicationModal
            isOpen={showViewModal}
            application={selectedApplication}
            onClose={() => {
              setShowViewModal(false);
              setSelectedApplication(null);
            }}
            onEdit={() => {
              setShowViewModal(false);
              setShowEditModal(true);
            }}
          />
        )}

        {/* Edit Application Modal */}
        {selectedApplication && (
          <EditApplicationModal
            isOpen={showEditModal}
            application={selectedApplication}
            onClose={() => {
              setShowEditModal(false);
              setSelectedApplication(null);
            }}
            onSubmit={handleUpdateApplication}
          />
        )}
      </div>
    </Layout>
  );
};
