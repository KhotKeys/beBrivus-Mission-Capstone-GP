import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Save,
  X,
  MessageCircle,
  Shield,
  AlertTriangle,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { adminApi } from "../../services/adminApi";

interface ForumCategory {
  id: number;
  name: string;
  description: string;
  color: string;
  icon: string;
  is_active: boolean;
  order: number;
  discussions_count: number;
}

export const ForumManagement: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ForumCategory | null>(
    null
  );
  const queryClient = useQueryClient();

  // Fetch forum categories
  const {
    data: categories,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<ForumCategory[]>({
    queryKey: ["admin-forum-categories"],
    queryFn: () =>
      adminApi
        .get("/forum/categories/")
        .then((res) => res.data.results || res.data),
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
  });

  // Fetch flagged discussions count
  const { data: flaggedCount } = useQuery({
    queryKey: ["admin-forum-flagged-count"],
    queryFn: async () => {
      const response = await adminApi.get("/forum/discussions/flagged/");
      return response.data.length || 0;
    },
  });

  // Create category mutation
  const createMutation = useMutation({
    mutationFn: (data: Partial<ForumCategory>) =>
      adminApi.post("/forum/categories/", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-forum-categories"] });
      setShowCreateModal(false);
    },
  });

  // Update category mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: Partial<ForumCategory> & { id: number }) =>
      adminApi.patch(`/forum/categories/${id}/`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-forum-categories"] });
      setEditingCategory(null);
    },
  });

  // Delete category mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.delete(`/forum/categories/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-forum-categories"] });
    },
  });

  const handleDelete = (category: ForumCategory) => {
    if (category.discussions_count > 0) {
      alert(
        `Cannot delete category "${category.name}" because it has ${category.discussions_count} discussions.`
      );
      return;
    }

    if (window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
      deleteMutation.mutate(category.id);
    }
  };

  const toggleActive = (category: ForumCategory) => {
    updateMutation.mutate({
      id: category.id,
      is_active: !category.is_active,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <div className="text-center text-red-600">
          {error instanceof Error
            ? error.message
            : "Failed to load forum categories."}
        </div>
        <div className="flex justify-center">
          <Button onClick={() => refetch()} variant="outline">
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Hero Section */}
      <div className="absolute left-0 right-0 w-screen" style={{ marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)' }}>
        <div className="relative w-full h-[150px] md:h-[180px] lg:h-[220px]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'url(/moderation-forum.jpeg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              backdropFilter: 'blur(2px)',
              backgroundColor: 'rgba(0, 0, 0, 0.45)',
            }}
          >
            <div className="text-center text-white px-4">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">Forum Management</h1>
              <p className="text-sm md:text-base lg:text-lg">Monitor, moderate and manage all community discussions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-[150px] md:pt-[180px] lg:pt-[220px]">
      <div className="space-y-6 px-2 sm:px-4 md:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Forum Management</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage forum categories and settings</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Link to="/admin/forum/moderation" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto">
              <Shield className="h-4 w-4 mr-2" />
              Moderation
              {flaggedCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {flaggedCount}
                </span>
              )}
            </Button>
          </Link>
          <Button onClick={() => setShowCreateModal(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Categories Grid */}
      {categories && categories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={setEditingCategory}
              onDelete={handleDelete}
              onToggleActive={toggleActive}
              isUpdating={updateMutation.status === "pending"}
            />
          ))}
        </div>
      ) : (
        <Card className="p-6 sm:p-8 text-center text-gray-600">
          <p className="text-sm">No categories yet. Create your first forum category.</p>
        </Card>
      )}

      {/* Create Category Modal */}
      {showCreateModal && (
        <CategoryModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={(data) => createMutation.mutate(data)}
          isLoading={createMutation.status === "pending"}
        />
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <CategoryModal
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
          onSubmit={(data) =>
            updateMutation.mutate({ id: editingCategory.id, ...data })
          }
          isLoading={updateMutation.status === "pending"}
        />
      )}
      </div>
      </div>
    </div>
  );
};

interface CategoryCardProps {
  category: ForumCategory;
  onEdit: (category: ForumCategory) => void;
  onDelete: (category: ForumCategory) => void;
  onToggleActive: (category: ForumCategory) => void;
  isUpdating: boolean;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onEdit,
  onDelete,
  onToggleActive,
  isUpdating,
}) => {
  return (
    <Card className="p-4 sm:p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
          <div
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: category.color }}
          >
            <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate">{category.name}</h3>
            <p className="text-xs sm:text-sm text-gray-500">Order: {category.order}</p>
          </div>
        </div>
        <div className="flex space-x-1 flex-shrink-0 ml-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleActive(category)}
            disabled={isUpdating}
          >
            {category.is_active ? (
              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
            ) : (
              <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" />
            )}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onEdit(category)}>
            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(category)}
            disabled={category.discussions_count > 0}
          >
            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
          </Button>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-gray-600 mb-4">{category.description}</p>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex space-x-2">
          <Badge variant={category.is_active ? "success" : "secondary"}>
            {category.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>
        <div className="text-xs sm:text-sm text-gray-500">
          {category.discussions_count} discussions
        </div>
      </div>
    </Card>
  );
};

interface CategoryModalProps {
  category?: ForumCategory;
  onClose: () => void;
  onSubmit: (data: Partial<ForumCategory>) => void;
  isLoading: boolean;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  category,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    name: category?.name || "",
    description: category?.description || "",
    color: category?.color || "#6366f1",
    icon: category?.icon || "message-circle",
    is_active: category?.is_active ?? true,
    order: category?.order || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-semibold">
            {category ? "Edit Category" : "Create Category"}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Color</label>
              <input
                type="color"
                className="w-full border border-gray-300 rounded-md px-2 py-2 h-10"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Order</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                value={formData.order}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    order: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Icon</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              value={formData.icon}
              onChange={(e) =>
                setFormData({ ...formData, icon: e.target.value })
              }
              placeholder="message-circle"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) =>
                setFormData({ ...formData, is_active: e.target.checked })
              }
            />
            <label htmlFor="is_active" className="text-sm font-medium">
              Active
            </label>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
