import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Save,
  X,
  MessageCircle,
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Forum Management</h1>
          <p className="text-gray-600">Manage forum categories and settings</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Categories Grid */}
      {categories && categories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <Card className="p-8 text-center text-gray-600">
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
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: category.color }}
          >
            <MessageCircle className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{category.name}</h3>
            <p className="text-sm text-gray-500">Order: {category.order}</p>
          </div>
        </div>
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleActive(category)}
            disabled={isUpdating}
          >
            {category.is_active ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onEdit(category)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(category)}
            disabled={category.discussions_count > 0}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4">{category.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <Badge variant={category.is_active ? "success" : "secondary"}>
            {category.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>
        <div className="text-sm text-gray-500">
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
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
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
              className="w-full border border-gray-300 rounded-md px-3 py-2"
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
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Color</label>
              <input
                type="color"
                className="w-full border border-gray-300 rounded-md px-3 py-2 h-10"
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
                className="w-full border border-gray-300 rounded-md px-3 py-2"
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
              className="w-full border border-gray-300 rounded-md px-3 py-2"
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

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
