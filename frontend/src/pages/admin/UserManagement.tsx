import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  MoreVertical,
  Ban,
  Eye,
  Mail,
  Phone,
  Calendar,
  MapPin,
  GraduationCap,
  Award,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserPlus,
} from "lucide-react";
import { Card, CardBody, Button } from "../../components/ui";
import { adminApi } from "../../services/adminApi";
import type { AdminUser } from "../../services/adminApi";

export const UserManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [inviteForm, setInviteForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    username: "",
    user_type: "institution",
    password: "",
  });

  useEffect(() => {
    fetchUsers();
  }, [selectedRole, selectedStatus, searchTerm, currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: any = { page: currentPage };

      if (selectedRole) params.user_type = selectedRole;
      if (selectedStatus !== "") params.is_active = selectedStatus === "active";
      if (searchTerm) params.search = searchTerm;

      const response = await adminApi.getUsers(params);
      setUsers(response.results);
      setTotalUsers(response.count);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId: number) => {
    try {
      await adminApi.toggleUserStatus(userId);
      // Refresh the user list
      fetchUsers();
    } catch (err) {
      console.error("Error toggling user status:", err);
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? "bg-success-100 text-success-800"
      : "bg-neutral-100 text-neutral-800";
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? CheckCircle : XCircle;
  };

  const getRoleColor = (userType: string) => {
    switch (userType) {
      case "student":
        return "bg-primary-100 text-primary-800";
      case "mentor":
        return "bg-secondary-100 text-secondary-800";
      case "institution":
        return "bg-info-100 text-info-800";
      case "admin":
        return "bg-warning-100 text-warning-800";
      default:
        return "bg-neutral-100 text-neutral-800";
    }
  };

  const handleViewUser = (user: AdminUser) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setInviteError(null);
    setInviteSuccess(null);
    setInviteForm({
      first_name: "",
      last_name: "",
      email: "",
      username: "",
      user_type: "mentor",
      password: "",
    });
    setShowCreateModal(true);
  };

  const normalizeUsername = (value: string) =>
    value.trim().replace(/\s+/g, "_").toLowerCase();

  const handleInviteSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSaving) return;
    setInviteError(null);
    setInviteSuccess(null);

    try {
      setIsSaving(true);
      
      // Parse multiple emails
      const emailsRaw = inviteForm.email
        .split(/[,\n]+/)
        .map(e => e.trim())
        .filter(e => e.length > 0);
      
      if (emailsRaw.length === 0) {
        setInviteError("Please provide at least one email address.");
        setIsSaving(false);
        return;
      }
      
      const results: { success: number; failed: number; errors: string[] } = {
        success: 0,
        failed: 0,
        errors: []
      };
      
      // Process each email
      for (const email of emailsRaw) {
        try {
          const fallbackUsername = email.split("@")[0] || "";
          const safeUsername = normalizeUsername(
            inviteForm.username || fallbackUsername
          );
          
          await adminApi.createUser({
            first_name: inviteForm.first_name,
            last_name: inviteForm.last_name,
            email: email,
            username: safeUsername,
            user_type: inviteForm.user_type,
            password: inviteForm.password || undefined,
          });
          
          results.success++;
        } catch (err: any) {
          console.error(`Failed to invite ${email}:`, err);
          const errorMsg = err?.response?.data?.error || err?.response?.data?.detail || err?.message || "Unknown error";
          results.errors.push(`${email}: ${errorMsg}`);
          results.failed++;
        }
      }
      
      // Show results
      if (results.success > 0 && results.failed === 0) {
        setInviteSuccess(`Successfully invited ${results.success} user(s)!`);
      } else if (results.success > 0 && results.failed > 0) {
        setInviteSuccess(`Invited ${results.success} user(s). ${results.failed} failed.`);
        setInviteError(`Errors: ${results.errors.join('; ')}`);
      } else {
        setInviteError(`Failed to invite all ${results.failed} user(s). ${results.errors.join('; ')}`);
      }
      
      fetchUsers();
    } catch (err: any) {
      console.error("Error inviting user:", err);
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        "Failed to invite user.";
      setInviteError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await adminApi.deleteUser(userId);
        fetchUsers();
      } catch (err) {
        console.error("Error deleting user:", err);
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-neutral-600">Loading users...</p>
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
            <Button onClick={fetchUsers} className="mt-4">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            User Management
          </h1>
          <p className="text-neutral-600 mt-1">
            Manage and moderate user accounts, profiles, and permissions
          </p>
        </div>
        <Button
          className="bg-primary-600 hover:bg-primary-700 text-white w-full sm:w-auto"
          onClick={handleCreateUser}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Invite User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Total Users</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {totalUsers.toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-primary-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Active Users</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {users.filter((u) => u.is_active).length}
                </p>
              </div>
              <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-success-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Inactive Users</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {users.filter((u) => !u.is_active).length}
                </p>
              </div>
              <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-warning-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Mentors</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {users.filter((u) => u.user_type === "mentor").length}
                </p>
              </div>
              <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-secondary-600" />
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
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Role Filter */}
            <select
              className="w-full md:w-auto px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="student">Students</option>
              <option value="mentor">Mentors</option>
              <option value="institution">Institutions</option>
              <option value="admin">Admins</option>
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

      {/* Users List */}
      <div className="space-y-4">
        {users.map((user) => {
          const StatusIcon = getStatusIcon(user.is_active);

          return (
            <Card key={user.id} className="hover:shadow-lg transition-shadow">
              <CardBody className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-lg">
                        {user.first_name?.[0] || user.username[0]}
                        {user.last_name?.[0] || user.username[1] || ""}
                      </span>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-neutral-900">
                          {user.first_name && user.last_name
                            ? `${user.first_name} ${user.last_name}`
                            : user.username}
                        </h3>
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(
                            user.user_type
                          )}`}
                        >
                          {user.user_type.charAt(0).toUpperCase() +
                            user.user_type.slice(1)}
                        </div>
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(
                            user.is_active
                          )}`}
                        >
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {user.is_active ? "Active" : "Inactive"}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600 mb-3">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {user.email}
                        </div>
                        <div>@{user.username}</div>
                        {user.country && (
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {user.country}
                          </div>
                        )}
                        {user.location && (
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {user.location}
                          </div>
                        )}
                        {user.phone_number && (
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            {user.phone_number}
                          </div>
                        )}
                      </div>

                      {user.university && (
                        <div className="flex items-center gap-2 text-sm text-neutral-600 mb-3">
                          <GraduationCap className="w-4 h-4" />
                          <span>
                            {user.field_of_study || "Student"} at{" "}
                            {user.university}
                            {user.graduation_year &&
                              ` (Class of ${user.graduation_year})`}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-6 text-sm text-neutral-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Joined{" "}
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                        {user.last_active && (
                          <div>
                            Last active{" "}
                            {new Date(user.last_active).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full sm:w-auto"
                      onClick={() => handleViewUser(user)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full sm:w-auto"
                      onClick={() => handleToggleUserStatus(user.id)}
                    >
                      {user.is_active ? (
                        <>
                          <Ban className="w-4 h-4 mr-2" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Activate
                        </>
                      )}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full sm:w-auto text-error-600 hover:text-error-700"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                    <div className="relative">
                      <Button variant="secondary" size="sm" className="w-full sm:w-auto">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {users.length === 0 && (
        <Card>
          <CardBody className="text-center py-12">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              No users found
            </h3>
            <p className="text-neutral-600 mb-6">
              Try adjusting your search criteria or invite new users.
            </p>
            <Button
              className="bg-primary-600 hover:bg-primary-700 text-white"
              onClick={handleCreateUser}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Users
            </Button>
          </CardBody>
        </Card>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-neutral-900">Invite User(s)</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="p-6 space-y-4">
              {inviteError && (
                <div className="bg-error-50 text-error-700 text-sm rounded-lg px-3 py-2">
                  {inviteError}
                </div>
              )}
              {inviteSuccess && (
                <div className="bg-success-50 text-success-700 text-sm rounded-lg px-3 py-2">
                  {inviteSuccess}
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                    value={inviteForm.first_name}
                    onChange={(e) =>
                      setInviteForm((prev) => ({ ...prev, first_name: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                    value={inviteForm.last_name}
                    onChange={(e) =>
                      setInviteForm((prev) => ({ ...prev, last_name: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Email(s)
                  <span className="text-xs text-neutral-500 ml-2">
                    (separate multiple emails with commas or new lines)
                  </span>
                </label>
                <textarea
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-mono text-sm"
                  value={inviteForm.email}
                  onChange={(e) =>
                    setInviteForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="user1@example.com, user2@example.com
user3@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Username
                  <span className="text-xs text-neutral-500 ml-2">
                    (optional, auto-generated from email if blank)
                  </span>
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  value={inviteForm.username}
                  onChange={(e) =>
                    setInviteForm((prev) => ({ ...prev, username: e.target.value }))
                  }
                  placeholder="Leave blank for auto-generation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Role
                </label>
                <select
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  value={inviteForm.user_type}
                  onChange={(e) =>
                    setInviteForm((prev) => ({ ...prev, user_type: e.target.value }))
                  }
                >
                  <option value="mentor">Mentor</option>
                  <option value="institution">Institution</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Password
                  <span className="text-xs text-neutral-500 ml-2">
                    (optional, same for all users if provided)
                  </span>
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  value={inviteForm.password}
                  onChange={(e) =>
                    setInviteForm((prev) => ({ ...prev, password: e.target.value }))
                  }
                  placeholder="Leave blank to auto-generate unique passwords"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Inviting..." : "Invite User(s)"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-neutral-900">
                  User Profile
                </h2>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">
                    {(selectedUser.first_name || selectedUser.username)[0]}
                    {(selectedUser.last_name || selectedUser.username[1] || "")[0]}
                  </span>
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-neutral-900">
                      {selectedUser.first_name && selectedUser.last_name
                        ? `${selectedUser.first_name} ${selectedUser.last_name}`
                        : selectedUser.username}
                    </h3>
                  </div>
                  <p className="text-neutral-600 mb-2">@{selectedUser.username}</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(
                        selectedUser.user_type
                      )}`}
                    >
                      {selectedUser.user_type.charAt(0).toUpperCase() +
                        selectedUser.user_type.slice(1)}
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getStatusColor(
                        selectedUser.is_active
                      )}`}
                    >
                      {React.createElement(getStatusIcon(selectedUser.is_active), {
                        className: "w-4 h-4 mr-1",
                      })}
                      {selectedUser.is_active ? "Active" : "Inactive"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold text-neutral-900 mb-3">
                    Contact Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-neutral-400" />
                      {selectedUser.email}
                    </div>
                    {selectedUser.phone_number && (
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-neutral-400" />
                        {selectedUser.phone_number}
                      </div>
                    )}
                    {selectedUser.location && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-neutral-400" />
                        {selectedUser.location}
                      </div>
                    )}
                    {selectedUser.country && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-neutral-400" />
                        {selectedUser.country}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-neutral-900 mb-3">
                    Account Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-neutral-400" />
                      Joined{" "}
                      {new Date(selectedUser.created_at).toLocaleDateString()}
                    </div>
                    {selectedUser.last_active && (
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-neutral-400" />
                        Last active{" "}
                        {new Date(selectedUser.last_active).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="secondary"
                  onClick={() => handleToggleUserStatus(selectedUser.id)}
                  className={
                    selectedUser.is_active
                      ? "text-error-600 hover:text-error-700"
                      : "text-success-600 hover:text-success-700"
                  }
                >
                  {selectedUser.is_active ? (
                    <>
                      <Ban className="w-4 h-4 mr-2" />
                      Deactivate User
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Activate User
                    </>
                  )}
                </Button>
                <Button
                  variant="secondary"
                  className="text-error-600 hover:text-error-700"
                  onClick={() => handleDeleteUser(selectedUser.id)}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Delete User
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
