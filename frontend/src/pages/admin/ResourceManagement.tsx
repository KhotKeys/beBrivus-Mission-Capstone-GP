import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Download,
  FileText,
  Video,
  File,
  Calendar,
  User,
} from "lucide-react";
import { Card, CardBody, Button } from "../../components/ui";
import { adminApi } from "../../services/adminApi";
import { AdminHero } from "../../components/admin/AdminHero";

interface Resource {
  id: number;
  title: string;
  slug: string;
  resource_type: string;
  category: {
    id: number;
    name: string;
  };
  description: string;
  file?: string;
  external_url?: string;
  download_count: number;
  view_count: number;
  is_published: boolean;
  author: {
    first_name: string;
    last_name: string;
    username: string;
  };
  created_at: string;
  updated_at: string;
  tags: string[];
}

export const ResourceManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "template":
      case "guide":
      case "tutorial":
      case "article":
      case "checklist":
        return FileText;
      case "video":
      case "webinar":
        return Video;
      case "tool":
        return File;
      default:
        return File;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "template":
        return "bg-primary-100 text-primary-800";
      case "guide":
        return "bg-secondary-100 text-secondary-800";
      case "tutorial":
        return "bg-warning-100 text-warning-800";
      case "video":
        return "bg-error-100 text-error-800";
      case "article":
      case "checklist":
      case "tool":
      case "webinar":
        return "bg-success-100 text-success-800";
      default:
        return "bg-neutral-100 text-neutral-800";
    }
  };

  const getStatusLabel = (resource: Resource) =>
    resource.is_published ? "published" : "draft";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-success-100 text-success-800";
      case "draft":
        return "bg-warning-100 text-warning-800";
      default:
        return "bg-neutral-100 text-neutral-800";
    }
  };

  const authorName = (resource: Resource) => {
    const fullName = `${resource.author?.first_name || ""} ${
      resource.author?.last_name || ""
    }`.trim();
    return fullName || resource.author?.username || "Unknown";
  };

  const loadResources = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedType) params.resource_type = selectedType;
      if (selectedCategory) params.category = selectedCategory;
      const response = await adminApi.getResources(params);
      setResources(response.results || []);
    } catch (err) {
      console.error("Failed to load resources:", err);
      setError("Unable to load resources.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await adminApi.getResourceCategories();
        setCategories(data || []);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    loadResources();
  }, [searchTerm, selectedType, selectedCategory]);

  const filteredResources = useMemo(() => {
    if (!selectedStatus) return resources;
    return resources.filter((resource) =>
      selectedStatus === "published"
        ? resource.is_published
        : !resource.is_published
    );
  }, [resources, selectedStatus]);

  const handleDelete = async (resource: Resource) => {
    const confirmed = window.confirm(
      `Delete "${resource.title}"? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await adminApi.deleteResource(resource.id);
      setResources((prev) => prev.filter((item) => item.id !== resource.id));
    } catch (err) {
      console.error("Failed to delete resource:", err);
      setError("Unable to delete resource.");
    }
  };

  return (
    <div>
      <AdminHero 
        title="Resource Management" 
        subtitle="Manage templates, guides, tutorials, and other educational resources"
        variant="mixed"
      />

      <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div style={{ visibility: 'hidden', height: 0 }}>
          <h1 className="text-2xl font-bold text-neutral-900">
            Resource Management
          </h1>
          <p className="text-neutral-600 mt-1">
            Manage templates, guides, tutorials, and other educational resources
          </p>
        </div>
        <Link to="/admin/resources/upload" className="w-full sm:w-auto">
          <Button className="bg-primary-600 hover:bg-primary-700 text-white w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Resource
          </Button>
        </Link>
      </div>

      {error && (
        <Card>
          <CardBody className="p-4 text-sm text-error-700 bg-error-50">
            {error}
          </CardBody>
        </Card>
      )}

      {loading && (
        <Card>
          <CardBody className="p-4 text-sm text-neutral-600">
            Loading resources...
          </CardBody>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Total Resources</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {resources.length}
                </p>
              </div>
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Total Downloads</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {resources
                    .reduce((sum, r) => sum + r.download_count, 0)
                    .toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
                <Download className="w-5 h-5 text-success-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Total Views</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {resources
                    .reduce((sum, r) => sum + r.view_count, 0)
                    .toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-warning-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Published</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {resources.filter((r) => r.is_published).length}
                </p>
              </div>
              <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-secondary-600" />
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
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Type Filter */}
            <select
              className="w-full md:w-auto px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="template">Templates</option>
              <option value="guide">Guides</option>
              <option value="tutorial">Tutorials</option>
              <option value="video">Videos</option>
              <option value="article">Articles</option>
              <option value="tool">Tools</option>
              <option value="checklist">Checklists</option>
              <option value="webinar">Webinars</option>
            </select>

            {/* Category Filter */}
            <select
              className="w-full md:w-auto px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={String(category.id)}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              className="w-full md:w-auto px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>

            <Button variant="secondary" className="flex items-center w-full md:w-auto">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Resources List */}
      <div className="space-y-4">
        {filteredResources.map((resource) => {
          const TypeIcon = getTypeIcon(resource.resource_type);
          const statusLabel = getStatusLabel(resource);

          return (
            <Card
              key={resource.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardBody className="p-6">
                <div className="flex flex-col items-center text-center gap-4">
                  {/* File Icon */}
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${getTypeColor(
                      resource.type
                    )}`}
                  >
                    <TypeIcon className="w-6 h-6" />
                  </div>

                  {/* Content */}
                  <div className="w-full">
                    <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-neutral-900">
                        {resource.title}
                      </h3>
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                          resource.resource_type
                        )}`}
                      >
                        {resource.resource_type.charAt(0).toUpperCase() +
                          resource.resource_type.slice(1)}
                      </div>
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          statusLabel
                        )}`}
                      >
                        {statusLabel.charAt(0).toUpperCase() +
                          statusLabel.slice(1)}
                      </div>
                    </div>

                    <p className="text-neutral-600 mb-3 mx-auto max-w-2xl">
                      {resource.description}
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-neutral-500 mb-3">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {authorName(resource)}
                      </div>
                      <div>Category: {resource.category?.name}</div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-neutral-500">
                      <div className="flex items-center">
                        <Download className="w-4 h-4 mr-1" />
                        {resource.download_count.toLocaleString()} downloads
                      </div>
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {resource.view_count.toLocaleString()} views
                      </div>
                      <div>
                        Updated:{" "}
                        {new Date(resource.updated_at || resource.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Tags */}
                    {resource.tags.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-2 mt-3">
                        {resource.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap justify-center gap-2 w-full">
                    {(resource.file || resource.external_url) && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={() =>
                          window.open(
                            resource.file || resource.external_url,
                            "_blank"
                          )
                        }
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    )}
                    <Link to={`/admin/resources/${resource.id}/edit`}>
                      <Button variant="secondary" size="sm" className="w-full sm:w-auto">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full sm:w-auto"
                      onClick={() => handleDelete(resource)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredResources.length === 0 && (
        <Card>
          <CardBody className="text-center py-12">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              No resources found
            </h3>
            <p className="text-neutral-600 mb-6">
              Try adjusting your search criteria or create a new resource.
            </p>
            <Link to="/admin/resources/upload">
              <Button className="bg-primary-600 hover:bg-primary-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add First Resource
              </Button>
            </Link>
          </CardBody>
        </Card>
      )}
      </div>
    </div>
  );
};
