import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Eye,
  X,
  Calendar,
  DollarSign,
  MapPin,
  Star,
} from "lucide-react";
import { Card, CardBody, Button } from "../../components/ui";
import { adminApi } from "../../services/adminApi";
import type { OpportunityCategory } from "../../services/adminApi";

interface OpportunityForm {
  title: string;
  type: string;
  organization: string;
  location: string;
  deadline: string;
  amount: string;
  currency: string;
  description: string;
  requirements: string;
  benefits: string;
  applicationProcess: string;
  contactEmail: string;
  externalUrl: string;
  featured: boolean;
  status: "draft" | "active";
  tags: string[];
  eligibility: {
    minAge?: number;
    maxAge?: number;
    citizenship: string[];
    educationLevel: string[];
    fieldOfStudy: string[];
  };
}

export const CreateOpportunity: React.FC = () => {
  const navigate = useNavigate();
  const [currentTag, setCurrentTag] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<OpportunityCategory[]>([]);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const [formData, setFormData] = useState<OpportunityForm>({
    title: "",
    type: "",
    organization: "",
    location: "",
    deadline: "",
    amount: "",
    currency: "USD",
    description: "",
    requirements: "",
    benefits: "",
    applicationProcess: "",
    contactEmail: "",
    externalUrl: "",
    featured: false,
    status: "draft",
    tags: [],
    eligibility: {
      citizenship: [],
      educationLevel: [],
      fieldOfStudy: [],
    },
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await adminApi.getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories:", error);
        setCategoryError("Failed to load categories.");
      }
    };

    loadCategories();
  }, []);


  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()],
      }));
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      const status = formData.status === "active" ? "published" : "draft";
      const amountValue = Number(formData.amount);
      const shortDescription = formData.description.trim().slice(0, 280);

      await adminApi.createOpportunity({
        title: formData.title,
        short_description: shortDescription || formData.title,
        description: formData.description,
        category: formData.type ? Number(formData.type) : undefined,
        organization: formData.organization,
        location: formData.location,
        application_deadline: formData.deadline
          ? new Date(formData.deadline).toISOString()
          : undefined,
        currency: formData.currency,
        salary_min: Number.isFinite(amountValue) ? amountValue : undefined,
        status,
        featured: formData.featured,
        requirements: formData.requirements,
        benefits: formData.benefits,
        application_process: formData.applicationProcess,
        external_url: formData.externalUrl,
        difficulty_level: "intermediate",
      });

      // Navigate back to opportunities list
      navigate("/admin/opportunities");
    } catch (error) {
      console.error("Failed to create opportunity:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAsDraft = async () => {
    const draftData = { ...formData, status: "draft" as const };
    setFormData(draftData);

    try {
      setIsSubmitting(true);
      const amountValue = Number(draftData.amount);
      const shortDescription = draftData.description.trim().slice(0, 280);

      await adminApi.createOpportunity({
        title: draftData.title,
        short_description: shortDescription || draftData.title,
        description: draftData.description,
        category: draftData.type ? Number(draftData.type) : undefined,
        organization: draftData.organization,
        location: draftData.location,
        application_deadline: draftData.deadline
          ? new Date(draftData.deadline).toISOString()
          : undefined,
        currency: draftData.currency,
        salary_min: Number.isFinite(amountValue) ? amountValue : undefined,
        status: "draft",
        featured: draftData.featured,
        requirements: draftData.requirements,
        benefits: draftData.benefits,
        application_process: draftData.applicationProcess,
        external_url: draftData.externalUrl,
        difficulty_level: "intermediate",
      });
      navigate("/admin/opportunities");
    } catch (error) {
      console.error("Failed to save draft:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-start sm:items-center">
          <button
            onClick={() => navigate("/admin/opportunities")}
            className="mr-4 p-2 text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              Create Opportunity
            </h1>
            <p className="text-neutral-600 mt-1">
              Add a new scholarship, internship, fellowship, or job opportunity
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <Button
            variant="secondary"
            onClick={() => setIsPreview(!isPreview)}
            className="w-full sm:w-auto"
          >
            <Eye className="w-4 h-4 mr-2" />
            {isPreview ? "Edit" : "Preview"}
          </Button>
          <Button
            variant="secondary"
            onClick={handleSaveAsDraft}
            className="w-full sm:w-auto"
            disabled={isSubmitting}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? "Saving..." : "Save as Draft"}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardBody className="p-6">
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                  Basic Information
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., Rhodes Scholarship 2025"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Category *
                      </label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      {categoryError && (
                        <p className="text-xs text-red-600 mt-1">
                          {categoryError}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Organization *
                      </label>
                      <input
                        type="text"
                        name="organization"
                        value={formData.organization}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="e.g., Rhodes Trust"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="e.g., Oxford, UK"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Application Deadline *
                      </label>
                      <input
                        type="date"
                        name="deadline"
                        value={formData.deadline}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        <DollarSign className="w-4 h-4 inline mr-1" />
                        Amount/Stipend
                      </label>
                      <input
                        type="text"
                        name="amount"
                        value={formData.amount}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="e.g., $75,000/year or Fully Funded"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Currency
                      </label>
                      <select
                        name="currency"
                        value={formData.currency}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="CAD">CAD</option>
                        <option value="AUD">AUD</option>
                      </select>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Description */}
            <Card>
              <CardBody className="p-6">
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                  Description & Details
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={6}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Provide a comprehensive description of the opportunity..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Requirements
                    </label>
                    <textarea
                      name="requirements"
                      value={formData.requirements}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="List the eligibility requirements and qualifications..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Benefits
                    </label>
                    <textarea
                      name="benefits"
                      value={formData.benefits}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="What benefits does this opportunity provide..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Application Process
                    </label>
                    <textarea
                      name="applicationProcess"
                      value={formData.applicationProcess}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Explain the application process and required documents..."
                    />
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Settings */}
            <Card>
              <CardBody className="p-6">
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                  Settings
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="featured"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                    />
                    <label
                      htmlFor="featured"
                      className="ml-2 text-sm text-neutral-700 flex items-center"
                    >
                      <Star className="w-4 h-4 mr-1 text-warning-500" />
                      Featured Opportunity
                    </label>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardBody className="p-6">
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                  Contact & Links
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="contact@organization.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      External URL
                    </label>
                    <input
                      type="url"
                      name="externalUrl"
                      value={formData.externalUrl}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="https://example.com/application"
                    />
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Tags */}
            <Card>
              <CardBody className="p-6">
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                  Tags
                </h2>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                      placeholder="Add tag..."
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), handleAddTag())
                      }
                    />
                    <Button
                      type="button"
                      onClick={handleAddTag}
                      size="sm"
                      variant="secondary"
                    >
                      Add
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-2 text-primary-600 hover:text-primary-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-6 border-t border-neutral-200">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/admin/opportunities")}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white"
            disabled={isSubmitting}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? "Creating..." : "Create Opportunity"}
          </Button>
        </div>
      </form>
    </div>
  );
};
