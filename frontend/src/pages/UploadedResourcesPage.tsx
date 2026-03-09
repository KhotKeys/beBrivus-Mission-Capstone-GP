import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Video, Image, File, Search, Tag, BookOpen } from "lucide-react";
import { Layout } from "../components/layout";
import { HeroSection } from "../components/HeroSection";
import { Button, Card, CardBody } from "../components/ui";
import { resourcesApi, type Resource } from "../api/resources";

const typeLabels: Record<string, string> = {
  pdf: "PDF",
  video: "Video",
  document: "Document",
  image: "Image",
  article: "Article",
  template: "Template",
  guide: "Guide",
  tutorial: "Tutorial",
  other: "Other",
};

const typeIcons: Record<string, React.ReactNode> = {
  pdf: <FileText className="w-5 h-5 text-error-500" />,
  video: <Video className="w-5 h-5 text-primary-500" />,
  document: <File className="w-5 h-5 text-blue-500" />,
  image: <Image className="w-5 h-5 text-secondary-500" />,
  article: <BookOpen className="w-5 h-5 text-primary-500" />,
  template: <FileText className="w-5 h-5 text-success-500" />,
  guide: <BookOpen className="w-5 h-5 text-info-500" />,
  tutorial: <Video className="w-5 h-5 text-warning-500" />,
  other: <File className="w-5 h-5 text-neutral-500" />,
};

export const UploadedResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await resourcesApi.getResources({ ordering: '-created_at' });
      const payload = (response as any).data ?? response;
      const resourcesList = Array.isArray(payload) ? payload : (payload.results || []);
      setResources(resourcesList);
    } catch (err) {
      console.error("Failed to load resources:", err);
      setError("Failed to load resources. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesSearch =
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (resource.tags && resource.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        ));
      const matchesType = !selectedType || resource.resource_type === selectedType;

      return matchesSearch && matchesType;
    });
  }, [resources, searchTerm, selectedType]);

  return (
    <Layout>
      <HeroSection
        title="Uploaded Resources"
        subtitle="Fresh uploads from the admin team. Browse the newest guides, templates, and media added to the platform."
      />

      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <Card>
            <CardBody className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Search uploaded resources..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </div>
                <select
                  className="px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={selectedType}
                  onChange={(event) => setSelectedType(event.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="pdf">PDF</option>
                  <option value="video">Video</option>
                  <option value="document">Document</option>
                  <option value="image">Image</option>
                  <option value="article">Article</option>
                  <option value="template">Template</option>
                  <option value="guide">Guide</option>
                  <option value="tutorial">Tutorial</option>
                  <option value="other">Other</option>
                </select>
                <Link to="/resources">
                  <Button variant="secondary" className="w-full lg:w-auto">
                    Back to Library
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>

          {loading ? (
            <Card>
              <CardBody className="p-8 text-center space-y-3">
                <p className="text-lg font-semibold text-neutral-900">
                  Loading resources...
                </p>
              </CardBody>
            </Card>
          ) : error ? (
            <Card>
              <CardBody className="p-8 text-center space-y-3">
                <p className="text-lg font-semibold text-error-600">
                  {error}
                </p>
                <Button onClick={loadResources}>Retry</Button>
              </CardBody>
            </Card>
          ) : filteredResources.length === 0 ? (
            <Card>
              <CardBody className="p-8 text-center space-y-3">
                <p className="text-lg font-semibold text-neutral-900">
                  {resources.length === 0 ? "No uploads yet" : "No matching resources"}
                </p>
                <p className="text-sm text-neutral-600">
                  {resources.length === 0 
                    ? "Check back soon for new guides and resources from the admin team."
                    : "Try adjusting your search or filter criteria."}
                </p>
              </CardBody>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredResources.map((resource) => (
                <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                  <CardBody className="p-6 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {typeIcons[resource.resource_type] || typeIcons["other"]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <Link to={`/resources/${resource.slug}`}>
                              <h3 className="text-lg font-semibold text-neutral-900 hover:text-primary-600">
                                {resource.title}
                              </h3>
                            </Link>
                            <p className="text-sm text-neutral-600 mt-1">
                              {resource.description}
                            </p>
                          </div>
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 whitespace-nowrap">
                            {typeLabels[resource.resource_type] || "Other"}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 mt-3">
                          {resource.author && (
                            <span className="flex items-center gap-1">
                              By {resource.author.first_name} {resource.author.last_name}
                            </span>
                          )}
                          <span>{new Date(resource.created_at).toLocaleDateString()}</span>
                          {resource.view_count > 0 && (
                            <span>{resource.view_count} views</span>
                          )}
                        </div>

                        {resource.tags && resource.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {resource.tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-neutral-100 text-neutral-600"
                              >
                                <Tag className="w-3 h-3 mr-1" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <span className="text-xs text-neutral-500">
                        Category: <span className="font-medium text-neutral-700">{resource.category?.name || "Uncategorized"}</span>
                      </span>
                      <Link to={`/resources/${resource.slug}`}>
                        <Button variant="primary" className="w-full sm:w-auto">
                          View Resource
                        </Button>
                      </Link>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
