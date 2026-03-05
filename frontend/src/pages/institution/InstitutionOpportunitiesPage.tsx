import React, { useEffect, useState } from "react";
import { Layout } from "../../components/layout";
import { Button, Card, CardBody, Input } from "../../components/ui";
import { X } from "lucide-react";
import { Link } from "react-router-dom";
import {
  institutionApi,
  type InstitutionOpportunity,
  type OpportunityCategory,
} from "../../api/institution";

interface OpportunityFormState {
  title: string;
  category: string;
  organization: string;
  location: string;
  application_deadline: string;
  description: string;
  requirements: string;
  benefits: string;
  application_process: string;
  application_type: 'internal' | 'external';
  external_url: string;
  remote_allowed: boolean;
  status: "draft" | "published";
}

export const InstitutionOpportunitiesPage: React.FC = () => {
  const [opportunities, setOpportunities] = useState<InstitutionOpportunity[]>(
    []
  );
  const [categories, setCategories] = useState<OpportunityCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [form, setForm] = useState<OpportunityFormState>({
    title: "",
    category: "",
    organization: "",
    location: "",
    application_deadline: "",
    description: "",
    requirements: "",
    benefits: "",
    application_process: "",
    application_type: 'internal',
    external_url: "",
    remote_allowed: false,
    status: "draft",
  });

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [opportunitiesData, categoriesData] = await Promise.all([
        institutionApi.listOpportunities(),
        institutionApi.getCategories(),
      ]);
      setOpportunities(opportunitiesData);
      setCategories(categoriesData);
    } catch (err) {
      console.error("Failed to load institution data:", err);
      setError("Failed to load institution opportunities.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({ ...prev, [name]: checked }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setIsSubmitting(true);
      const shortDescription = form.description.trim().slice(0, 280) || form.title;
      
      if (editingId) {
        // Edit existing opportunity
        await institutionApi.updateOpportunity(editingId, {
          title: form.title,
          short_description: shortDescription,
          description: form.description,
          category: form.category ? Number(form.category) : undefined,
          organization: form.organization,
          location: form.location || undefined,
          application_deadline: form.application_deadline
            ? new Date(form.application_deadline).toISOString()
            : undefined,
          requirements: form.requirements || undefined,
          benefits: form.benefits || undefined,
          application_process: form.application_process || undefined,
          application_type: form.application_type,
          external_url: form.external_url || undefined,
          remote_allowed: form.remote_allowed,
          status: form.status,
        });
        setShowEditModal(false);
        setEditingId(null);
      } else {
        // Create new opportunity
        await institutionApi.createOpportunity({
          title: form.title,
          short_description: shortDescription,
          description: form.description,
          category: form.category ? Number(form.category) : undefined,
          organization: form.organization,
          location: form.location || undefined,
          application_deadline: form.application_deadline
            ? new Date(form.application_deadline).toISOString()
            : undefined,
          requirements: form.requirements || undefined,
          benefits: form.benefits || undefined,
          application_process: form.application_process || undefined,
          application_type: form.application_type,
          external_url: form.external_url || undefined,
          remote_allowed: form.remote_allowed,
          status: form.status,
          currency: "USD",
          difficulty_level: "intermediate",
        });
      }

      setForm({
        title: "",
        category: "",
        organization: "",
        location: "",
        application_deadline: "",
        description: "",
        requirements: "",
        benefits: "",
        application_process: "",
        application_type: 'internal',
        external_url: "",
        remote_allowed: false,
        status: "draft",
      });
      await loadData();
    } catch (err) {
      console.error("Failed to save opportunity:", err);
      setError("Failed to save opportunity. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async (opportunityId: number) => {
    try {
      await institutionApi.updateOpportunity(opportunityId, {
        status: "published",
      });
      await loadData();
    } catch (err) {
      console.error("Failed to publish opportunity:", err);
      setError("Failed to publish opportunity. Please try again.");
    }
  };

  const handleEdit = (opportunity: InstitutionOpportunity) => {
    const deadline = opportunity.application_deadline
      ? new Date(opportunity.application_deadline).toISOString().split("T")[0]
      : "";
    
    setForm({
      title: opportunity.title,
      category: opportunity.category?.toString() || "",
      organization: opportunity.organization,
      location: opportunity.location || "",
      application_deadline: deadline,
      description: opportunity.description,
      requirements: opportunity.requirements || "",
      benefits: opportunity.benefits || "",
      application_process: opportunity.application_process || "",
      external_url: opportunity.external_url || "",
      remote_allowed: opportunity.remote_allowed || false,
      status: opportunity.status as "draft" | "published",
    });
    setEditingId(opportunity.id);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingId(null);
    setForm({
      title: "",
      category: "",
      organization: "",
      location: "",
      application_deadline: "",
      description: "",
      requirements: "",
      benefits: "",
      application_process: "",
      external_url: "",
      remote_allowed: false,
      status: "draft",
    });
  };

  const handleDelete = async (opportunityId: number) => {
    if (!window.confirm("Delete this opportunity?")) {
      return;
    }
    try {
      await institutionApi.deleteOpportunity(opportunityId);
      await loadData();
    } catch (err) {
      console.error("Failed to delete opportunity:", err);
      setError("Failed to delete opportunity. Please try again.");
    }
  };

  return (
    <Layout>
      <div className="bg-white">
        <section
          className="relative overflow-hidden"
          style={{
            backgroundImage:
              "linear-gradient(120deg, rgba(2,6,23,0.85) 0%, rgba(2,6,23,0.65) 40%, rgba(2,6,23,0.8) 100%), url('/education.jpeg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.3em] text-primary-200">
                Institution Portal
              </p>
              <h1 className="text-3xl sm:text-5xl font-bold text-white mt-4">
                Publish opportunities that change lives.
              </h1>
              <h3 className="text-lg sm:text-xl text-primary-100 mt-4">
                Share scholarships, internships, and programs with learners
                across Africa and beyond.
              </h3>
              <div className="flex flex-wrap gap-4 mt-8">
                <div className="bg-white/10 border border-white/20 rounded-2xl px-5 py-4">
                  <p className="text-white text-lg font-semibold">
                    {opportunities.length}
                  </p>
                  <p className="text-primary-100 text-xs uppercase tracking-wide">
                    Listings
                  </p>
                </div>
                <div className="bg-white/10 border border-white/20 rounded-2xl px-5 py-4">
                  <p className="text-white text-lg font-semibold">
                    {opportunities.filter((item) => item.status === "published").length}
                  </p>
                  <p className="text-primary-100 text-xs uppercase tracking-wide">
                    Published
                  </p>
                </div>
                <div className="bg-white/10 border border-white/20 rounded-2xl px-5 py-4">
                  <p className="text-white text-lg font-semibold">24/7</p>
                  <p className="text-primary-100 text-xs uppercase tracking-wide">
                    Visibility
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-4 sm:space-y-6">
          {/* Navigation Tabs */}
          <div className="flex gap-2 border-b border-neutral-200">
            <Link
              to="/institution/opportunities"
              className="px-4 py-2 text-sm font-medium border-b-2 border-primary-600 text-primary-600"
            >
              Opportunities
            </Link>
            <Link
              to="/institution/applications"
              className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300"
            >
              Applications
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1 sm:space-y-2">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-secondary-900">
                Institution Opportunities
              </h2>
              <p className="text-sm sm:text-base text-secondary-600">
                Publish new opportunities and keep track of your listings.
              </p>
            </div>
            <div className="bg-secondary-50 border border-secondary-100 rounded-2xl px-4 py-3 self-start sm:self-auto">
              <p className="text-xs uppercase tracking-wide text-secondary-500">
                Total listings
              </p>
              <p className="text-base sm:text-lg font-semibold text-secondary-900">
                {opportunities.length}
              </p>
            </div>
          </div>

        {error && (
          <div className="bg-error-50 border border-error-200 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-error-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="lg:col-span-1 lg:sticky lg:top-6 h-fit">
            <CardBody className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <h2 className="text-base sm:text-lg font-semibold text-secondary-900">
                Create Opportunity
              </h2>
              <form className="space-y-3 sm:space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-1">
                  <label className="label text-xs sm:text-sm">Application Type *</label>
                  <select
                    name="application_type"
                    className="input text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2.5"
                    value={form.application_type}
                    onChange={handleChange}
                    required
                  >
                    <option value="internal">Internal (Platform)</option>
                    <option value="external">External (Link)</option>
                  </select>
                  <p className="text-xs text-secondary-500">
                    {form.application_type === 'internal' 
                      ? 'Applications submitted through platform' 
                      : 'Requires external URL below'}
                  </p>
                </div>
                <Input
                  label="Title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Opportunity title"
                  required
                />
                <div className="space-y-1">
                  <label className="label text-xs sm:text-sm">Category</label>
                  <select
                    name="category"
                    className="input text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2.5"
                    value={form.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Organization"
                  name="organization"
                  value={form.organization}
                  onChange={handleChange}
                  placeholder="Institution name"
                  required
                />
                <Input
                  label="Location"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="City or Remote"
                />
                <div className="space-y-1">
                  <label className="label text-xs sm:text-sm">Application deadline</label>
                  <input
                    type="date"
                    name="application_deadline"
                    className="input text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2.5"
                    value={form.application_deadline}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="label text-xs sm:text-sm">Description</label>
                  <textarea
                    name="description"
                    className="input min-h-[100px] sm:min-h-[120px] text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2.5"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Describe the opportunity"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="label text-xs sm:text-sm">Requirements</label>
                  <textarea
                    name="requirements"
                    className="input min-h-[80px] sm:min-h-[90px] text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2.5"
                    value={form.requirements}
                    onChange={handleChange}
                    placeholder="Eligibility or requirements"
                  />
                </div>
                <div className="space-y-1">
                  <label className="label text-xs sm:text-sm">Benefits</label>
                  <textarea
                    name="benefits"
                    className="input min-h-[80px] sm:min-h-[90px] text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2.5"
                    value={form.benefits}
                    onChange={handleChange}
                    placeholder="Highlight key benefits"
                  />
                </div>
                <div className="space-y-1">
                  <label className="label text-xs sm:text-sm">Application process</label>
                  <textarea
                    name="application_process"
                    className="input min-h-[80px] sm:min-h-[90px] text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2.5"
                    value={form.application_process}
                    onChange={handleChange}
                    placeholder="How applicants should apply"
                  />
                </div>
                {form.application_type === 'external' && (
                  <Input
                    label="External URL *"
                    name="external_url"
                    value={form.external_url}
                    onChange={handleChange}
                    placeholder="https://"
                    required
                  />
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="remote_allowed"
                    name="remote_allowed"
                    checked={form.remote_allowed}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                  />
                  <label htmlFor="remote_allowed" className="text-xs sm:text-sm text-secondary-700">
                    Remote allowed
                  </label>
                </div>
                <div className="space-y-1">
                  <label className="label text-xs sm:text-sm">Status</label>
                  <select
                    name="status"
                    className="input text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2.5"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Publish</option>
                  </select>
                </div>
                <Button type="submit" className="w-full" isLoading={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Opportunity"}
                </Button>
              </form>
            </CardBody>
          </Card>

          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h2 className="text-base sm:text-lg font-semibold text-secondary-900">
                Your Listings
              </h2>
              <span className="text-xs sm:text-sm text-secondary-500">
                {opportunities.length} total
              </span>
            </div>

            {isLoading ? (
              <div className="text-center text-sm sm:text-base text-secondary-600">Loading...</div>
            ) : opportunities.length === 0 ? (
              <Card>
                <CardBody className="p-4 sm:p-6 text-center text-sm sm:text-base text-secondary-600">
                  No opportunities yet. Create your first listing.
                </CardBody>
              </Card>
            ) : (
              opportunities.map((opportunity) => (
                <Card key={opportunity.id} className="hover:shadow-md transition-shadow">
                  <CardBody className="p-4 sm:p-6 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="text-base sm:text-lg font-semibold text-secondary-900">
                          {opportunity.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-secondary-600">
                          {opportunity.organization}
                        </p>
                      </div>
                      <span
                        className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-medium self-start sm:self-auto whitespace-nowrap ${
                          opportunity.status === "published"
                            ? "bg-success-100 text-success-800"
                            : "bg-neutral-100 text-neutral-700"
                        }`}
                      >
                        {opportunity.status}
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm text-secondary-600">
                      Deadline:{" "}
                      {opportunity.application_deadline
                        ? new Date(opportunity.application_deadline).toLocaleDateString()
                        : "Not set"}
                    </div>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      {opportunity.status !== "published" && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handlePublish(opportunity.id)}
                        >
                          Publish
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEdit(opportunity)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDelete(opportunity.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardBody className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between sticky top-0 bg-white pb-3 sm:pb-4 border-b border-secondary-100 -mt-4 sm:-mt-6 -mx-4 sm:-mx-6 px-4 sm:px-6 pt-4 sm:pt-6">
                <h2 className="text-base sm:text-lg font-semibold text-secondary-900">
                  Edit Opportunity
                </h2>
                <button
                  onClick={closeEditModal}
                  className="text-secondary-500 hover:text-secondary-700 flex-shrink-0"
                >
                  <X size={20} className="sm:w-6 sm:h-6" />
                </button>
              </div>
              <form className="space-y-3 sm:space-y-4" onSubmit={handleSubmit}>
                <Input
                  label="Title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Opportunity title"
                  required
                />
                <div className="space-y-1">
                  <label className="label text-xs sm:text-sm">Category</label>
                  <select
                    name="category"
                    className="input text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2.5"
                    value={form.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Organization"
                  name="organization"
                  value={form.organization}
                  onChange={handleChange}
                  placeholder="Institution name"
                  required
                />
                <Input
                  label="Location"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="City or Remote"
                />
                <div className="space-y-1">
                  <label className="label text-xs sm:text-sm">Application deadline</label>
                  <input
                    type="date"
                    name="application_deadline"
                    className="input text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2.5"
                    value={form.application_deadline}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="label text-xs sm:text-sm">Description</label>
                  <textarea
                    name="description"
                    className="input min-h-[100px] sm:min-h-[120px] text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2.5"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Describe the opportunity"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="label text-xs sm:text-sm">Requirements</label>
                  <textarea
                    name="requirements"
                    className="input min-h-[80px] sm:min-h-[90px] text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2.5"
                    value={form.requirements}
                    onChange={handleChange}
                    placeholder="Eligibility or requirements"
                  />
                </div>
                <div className="space-y-1">
                  <label className="label text-xs sm:text-sm">Benefits</label>
                  <textarea
                    name="benefits"
                    className="input min-h-[80px] sm:min-h-[90px] text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2.5"
                    value={form.benefits}
                    onChange={handleChange}
                    placeholder="Highlight key benefits"
                  />
                </div>
                <div className="space-y-1">
                  <label className="label text-xs sm:text-sm">Application process</label>
                  <textarea
                    name="application_process"
                    className="input min-h-[80px] sm:min-h-[90px] text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2.5"
                    value={form.application_process}
                    onChange={handleChange}
                    placeholder="How applicants should apply"
                  />
                </div>
                <Input
                  label="External URL"
                  name="external_url"
                  value={form.external_url}
                  onChange={handleChange}
                  placeholder="https://"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit_remote_allowed"
                    name="remote_allowed"
                    checked={form.remote_allowed}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                  />
                  <label htmlFor="edit_remote_allowed" className="text-xs sm:text-sm text-secondary-700">
                    Remote allowed
                  </label>
                </div>
                <div className="space-y-1">
                  <label className="label text-xs sm:text-sm">Status</label>
                  <select
                    name="status"
                    className="input text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2.5"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Publish</option>
                  </select>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
                  <Button
                    type="submit"
                    className="flex-1 w-full text-sm sm:text-base"
                    isLoading={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1 w-full text-sm sm:text-base"
                    onClick={closeEditModal}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      )}
    </Layout>
  );
};

export default InstitutionOpportunitiesPage;
