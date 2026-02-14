import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  Download,
  Eye,
  BookOpen,
  FileText,
  Video,
  Image,
  File,
  ExternalLink,
  Heart,
  Share2,
  Clock,
  User,
  Calendar,
  Tag,
  Grid,
  List,
  SortAsc,
  SortDesc,
  Star,
} from "lucide-react";
import { Button, Card, CardBody } from "../components/ui";
import { Layout } from "../components/layout";
import { HeroSection } from "../components/HeroSection";
import {
  resourcesApi,
  type Resource,
  type ResourceCategory,
} from "../api/resources";

export const ResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Load resources and categories on component mount
  useEffect(() => {
    loadData();
  }, []);

  const extractResults = <T,>(payload: any): T[] => {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload as T[];
    if (Array.isArray(payload.results)) return payload.results as T[];
    return [];
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [resourcesResponse, categoriesResponse] = await Promise.all([
        resourcesApi.getResources(),
        resourcesApi.getCategories(),
      ]);
      const resourcesPayload = (resourcesResponse as any).data ?? resourcesResponse;
      const categoriesPayload = (categoriesResponse as any).data ?? categoriesResponse;
      setResources(extractResults<Resource>(resourcesPayload));
      setCategories(extractResults<ResourceCategory>(categoriesPayload));
    } catch (err) {
      console.error("Failed to load resources:", err);
      setError("Failed to load resources. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle bookmark toggle
  const handleBookmark = async (resourceId: number) => {
    try {
      const resource = resources.find((r) => r.id === resourceId);
      if (!resource) return;

      if (resource.is_bookmarked) {
        await resourcesApi.removeBookmark(resourceId);
      } else {
        await resourcesApi.bookmarkResource(resourceId);
      }

      // Update local state
      setResources(
        resources.map((r) =>
          r.id === resourceId ? { ...r, is_bookmarked: !r.is_bookmarked } : r
        )
      );
    } catch (err) {
      console.error("Failed to bookmark resource:", err);
    }
  };

  // Filter and sort resources
  const filteredResources = resources
    .filter((resource) => {
      const matchesSearch =
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.tags.some((tag: string) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        );
      const matchesCategory =
        !selectedCategory ||
        selectedCategory === "All Categories" ||
        resource.category.slug === selectedCategory;
      const matchesType =
        !selectedType || resource.resource_type === selectedType;

      return matchesSearch && matchesCategory && matchesType;
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "newest":
          comparison =
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          break;
        case "oldest":
          comparison =
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case "popular":
          comparison = b.view_count - a.view_count;
          break;
        case "downloads":
          comparison = b.download_count - a.download_count;
          break;
        case "rating":
          comparison = b.average_rating - a.average_rating;
          break;
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        default:
          comparison = 0;
      }

      return sortOrder === "desc" ? comparison : -comparison;
    });

  const getFileIcon = (resourceType: string) => {
    switch (resourceType.toLowerCase()) {
      case "pdf":
        return <FileText className="w-6 h-6 text-error-500" />;
      case "video":
        return <Video className="w-6 h-6 text-primary-500" />;
      case "image":
        return <Image className="w-6 h-6 text-secondary-500" />;
      case "document":
        return <File className="w-6 h-6 text-blue-500" />;
      case "link":
        return <ExternalLink className="w-6 h-6 text-success-500" />;
      case "course":
        return <BookOpen className="w-6 h-6 text-warning-500" />;
      default:
        return <File className="w-6 h-6 text-neutral-500" />;
    }
  };

  const getTypeColor = (resourceType: string) => {
    switch (resourceType.toLowerCase()) {
      case "pdf":
        return "bg-error-100 text-error-800";
      case "video":
        return "bg-primary-100 text-primary-800";
      case "image":
        return "bg-secondary-100 text-secondary-800";
      case "document":
        return "bg-blue-100 text-blue-800";
      case "link":
        return "bg-success-100 text-success-800";
      case "course":
        return "bg-warning-100 text-warning-800";
      default:
        return "bg-neutral-100 text-neutral-800";
    }
  };

  const normalizeUrl = (url?: string) => {
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;
    if (url.startsWith("/")) {
      const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
      const origin = apiBase.replace(/\/api\/?$/, "");
      return `${origin}${url}`;
    }
    return `https://${url}`;
  };

  const handleDownload = (resource: Resource) => {
    if (resource.file) {
      const resolved = normalizeUrl(resource.file);
      window.open(resolved, "_blank", "noopener,noreferrer");
    }
  };

  const handleOpenLink = (resource: Resource) => {
    if (resource.external_url) {
      const resolved = normalizeUrl(resource.external_url);
      window.open(resolved, "_blank", "noopener,noreferrer");
    }
  };

  const getAuthorName = (resource: Resource) => {
    const firstName = resource.author?.first_name?.trim();
    const lastName = resource.author?.last_name?.trim();
    const fullName = [firstName, lastName].filter(Boolean).join(" ");
    return fullName || resource.author?.username || "Unknown";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const ResourceCard: React.FC<{ resource: Resource }> = ({ resource }) => (
    <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
      <CardBody className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {getFileIcon(resource.resource_type)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-neutral-900 truncate group-hover:text-primary-600 transition-colors">
                {resource.title}
              </h3>
              {resource.is_featured && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 mb-3 text-sm text-neutral-600">
              <div
                className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                  resource.resource_type
                )}`}
              >
                {resource.resource_type.toUpperCase()}
              </div>
              <span>{resource.category?.name}</span>
              <div className="flex items-center">
                <User className="w-4 h-4 mr-1" />
                {getAuthorName(resource)}
              </div>
            </div>

            <p className="text-sm text-neutral-700 mb-4 line-clamp-2">
              {resource.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-neutral-500">
                <div className="flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  {resource.view_count}
                </div>
                {resource.download_count > 0 && (
                  <div className="flex items-center">
                    <Download className="w-4 h-4 mr-1" />
                    {resource.download_count}
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(resource.published_at || resource.created_at)}
                </div>
                {resource.estimated_duration_minutes && (
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {resource.estimated_duration_minutes} min
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleBookmark(resource.id)}
                  className={resource.is_bookmarked ? "text-error-600" : ""}
                >
                  <Heart
                    className={`w-4 h-4 ${
                      resource.is_bookmarked ? "fill-current" : ""
                    }`}
                  />
                </Button>
                <Button variant="secondary" size="sm">
                  <Share2 className="w-4 h-4" />
                </Button>
                {resource.file ? (
                  <Button size="sm" onClick={() => handleDownload(resource)}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => handleOpenLink(resource)}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );

  const ResourceListItem: React.FC<{ resource: Resource }> = ({ resource }) => (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardBody className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex-shrink-0">
              {getFileIcon(resource.resource_type)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-neutral-900 hover:text-primary-600 transition-colors">
                  {resource.title}
                </h3>
                {resource.is_featured && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </span>
                )}
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                    resource.resource_type
                  )}`}
                >
                  {resource.resource_type.toUpperCase()}
                </div>
              </div>

              <p className="text-sm text-neutral-700 mt-1 line-clamp-1">
                {resource.description}
              </p>

              <div className="flex items-center gap-4 mt-2 text-xs text-neutral-500">
                <span>{resource.category?.name}</span>
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {getAuthorName(resource)}
                </div>
                <div className="flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  {resource.view_count}
                </div>
                {resource.download_count > 0 && (
                  <div className="flex items-center">
                    <Download className="w-4 h-4 mr-1" />
                    {resource.download_count}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleBookmark(resource.id)}
              className={resource.is_bookmarked ? "text-error-600" : ""}
            >
              <Heart
                className={`w-4 h-4 ${
                  resource.is_bookmarked ? "fill-current" : ""
                }`}
              />
            </Button>
            <Button variant="secondary" size="sm">
              <Share2 className="w-4 h-4" />
            </Button>
            {resource.file ? (
              <Button size="sm" onClick={() => handleDownload(resource)}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            ) : (
              <Button size="sm" onClick={() => handleOpenLink(resource)}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Open
              </Button>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );

  return (
    <Layout>
      <HeroSection
        title="Resource Library"
        subtitle="Access comprehensive guides, tools, and materials to support your academic and career journey. Everything you need to succeed, all in one place."
      />

      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-primary-600">New uploads</p>
              <h2 className="text-xl font-bold text-neutral-900">
                Explore the latest resources uploaded by our team
              </h2>
              <p className="text-sm text-neutral-600 mt-1">
                Find new guides, videos, and templates curated for students.
              </p>
            </div>
            <Link to="/resources/uploads" className="w-full md:w-auto">
              <Button className="w-full md:w-auto">View Uploaded Resources</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="mb-8">
            <CardBody className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 mb-4">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Search resources..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <select
                  className="px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>

                <select
                  className="px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="pdf">PDF</option>
                  <option value="video">Video</option>
                  <option value="document">Document</option>
                  <option value="link">Link</option>
                  <option value="course">Course</option>
                  <option value="image">Image</option>
                </select>

                <select
                  className="px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="popular">Most Popular</option>
                  <option value="downloads">Most Downloaded</option>
                  <option value="rating">Highest Rated</option>
                  <option value="title">Alphabetical</option>
                </select>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <Button
                    variant="secondary"
                    className="flex items-center w-full sm:w-auto justify-center"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    More Filters
                  </Button>
                </div>

                <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
                  <Button
                    variant={sortOrder === "asc" ? "primary" : "secondary"}
                    size="sm"
                    onClick={() =>
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    }
                  >
                    {sortOrder === "asc" ? (
                      <SortAsc className="w-4 h-4" />
                    ) : (
                      <SortDesc className="w-4 h-4" />
                    )}
                  </Button>

                  <div className="flex border border-neutral-300 rounded-lg overflow-hidden">
                    <Button
                      variant={viewMode === "grid" ? "primary" : "secondary"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="rounded-none border-0"
                    >
                      <Grid className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "primary" : "secondary"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className="rounded-none border-0 border-l border-neutral-300"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-6 text-center sm:text-left">
            <h2 className="text-lg sm:text-xl font-semibold text-neutral-900">
              {filteredResources.length} resources found
            </h2>
            <div className="text-xs sm:text-sm text-neutral-600">
              Showing {viewMode} view • Sorted by {sortBy}
            </div>
          </div>

          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredResources.map((resource) => (
                <ResourceListItem key={resource.id} resource={resource} />
              ))}
            </div>
          )}

          {filteredResources.length === 0 && (
            <Card>
              <CardBody className="text-center py-16">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Search className="w-9 h-9 sm:w-12 sm:h-12 text-neutral-400" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                  No resources found
                </h3>
                <p className="text-neutral-600 mb-6 max-w-md mx-auto">
                  Try adjusting your search criteria or browse different
                  categories.
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("");
                    setSelectedType("");
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
