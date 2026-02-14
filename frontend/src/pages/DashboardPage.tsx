import React, { useEffect } from "react";
import {
  Users,
  Target,
  BookOpen,
  BarChart3,
  Plus,
  TrendingUp,
  Clock,
  Star,
  Search,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Layout } from "../components/layout";
import { Button, Card, CardHeader, CardBody, Badge } from "../components/ui";
import { useNavigate } from "react-router-dom";

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.user_type === "mentor") {
      navigate("/mentor-dashboard");
    }
  }, []);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900">
            Welcome back, {user?.first_name}!
          </h1>
          <p className="text-secondary-600 mt-2 text-sm sm:text-base">
            Here's what's happening with your opportunities today.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <Card>
            <CardBody>
              <div className="flex items-center max-[360px]:flex-col max-[360px]:items-start max-[360px]:space-y-2">
                <div className="p-2 max-[360px]:p-1.5 bg-primary-100 rounded-lg">
                  <Search className="w-6 h-6 max-[360px]:w-5 max-[360px]:h-5 text-primary-600" />
                </div>
                <div className="ml-3 sm:ml-4 max-[360px]:ml-0">
                  <p className="text-xs sm:text-sm font-medium text-secondary-600">
                    New Opportunities
                  </p>
                  <p className="text-xl sm:text-2xl max-[360px]:text-lg font-bold text-secondary-900">
                    12
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center max-[360px]:flex-col max-[360px]:items-start max-[360px]:space-y-2">
                <div className="p-2 max-[360px]:p-1.5 bg-warning-100 rounded-lg">
                  <Clock className="w-6 h-6 max-[360px]:w-5 max-[360px]:h-5 text-warning-600" />
                </div>
                <div className="ml-3 sm:ml-4 max-[360px]:ml-0">
                  <p className="text-xs sm:text-sm font-medium text-secondary-600">
                    Pending Applications
                  </p>
                  <p className="text-xl sm:text-2xl max-[360px]:text-lg font-bold text-secondary-900">
                    5
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center max-[360px]:flex-col max-[360px]:items-start max-[360px]:space-y-2">
                <div className="p-2 max-[360px]:p-1.5 bg-success-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 max-[360px]:w-5 max-[360px]:h-5 text-success-600" />
                </div>
                <div className="ml-3 sm:ml-4 max-[360px]:ml-0">
                  <p className="text-xs sm:text-sm font-medium text-secondary-600">
                    Success Rate
                  </p>
                  <p className="text-xl sm:text-2xl max-[360px]:text-lg font-bold text-secondary-900">
                    78%
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center max-[360px]:flex-col max-[360px]:items-start max-[360px]:space-y-2">
                <div className="p-2 max-[360px]:p-1.5 bg-error-100 rounded-lg">
                  <Star className="w-6 h-6 max-[360px]:w-5 max-[360px]:h-5 text-error-600" />
                </div>
                <div className="ml-3 sm:ml-4 max-[360px]:ml-0">
                  <p className="text-xs sm:text-sm font-medium text-secondary-600">
                    Achievements
                  </p>
                  <p className="text-xl sm:text-2xl max-[360px]:text-lg font-bold text-secondary-900">
                    3
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Recent Opportunities */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h2 className="text-base sm:text-lg font-semibold text-secondary-900">
                    Recommended for You
                  </h2>
                  <Button size="sm" variant="secondary" className="w-full sm:w-auto">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="flex flex-col sm:flex-row sm:items-start sm:space-x-4 space-y-4 sm:space-y-0 p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors"
                    >
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base font-semibold text-secondary-900">
                          Google Summer Internship Program
                        </h3>
                        <p className="text-xs sm:text-sm text-secondary-600 mt-1">
                          Software Engineering Internship at Google
                        </p>
                        <div className="flex flex-wrap items-center mt-2 gap-2 text-xs sm:text-sm">
                          <Badge variant="primary">Technology</Badge>
                          <Badge variant="success">Remote</Badge>
                          <span className="text-secondary-500">
                            Due in 5 days
                          </span>
                        </div>
                      </div>
                      <Button size="sm" className="w-full sm:w-auto">Apply</Button>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <h3 className="text-base sm:text-lg font-semibold text-secondary-900">
                  Quick Actions
                </h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  <Button className="w-full justify-start text-sm sm:text-base" variant="secondary">
                    <Search className="w-4 h-4 mr-2" />
                    Find Opportunities
                  </Button>
                  <Button className="w-full justify-start text-sm sm:text-base" variant="secondary">
                    <Users className="w-4 h-4 mr-2" />
                    Find a Mentor
                  </Button>
                  <Button className="w-full justify-start text-sm sm:text-base" variant="secondary">
                    <Target className="w-4 h-4 mr-2" />
                    Track Applications
                  </Button>
                  <Button className="w-full justify-start text-sm sm:text-base" variant="secondary">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Browse Resources
                  </Button>
                </div>
              </CardBody>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <h3 className="text-base sm:text-lg font-semibold text-secondary-900">
                  Recent Activity
                </h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  <div className="text-xs sm:text-sm">
                    <p className="text-secondary-600">
                      Applied to{" "}
                      <span className="font-medium text-secondary-900">
                        Microsoft Internship
                      </span>
                    </p>
                    <p className="text-xs text-secondary-500">2 hours ago</p>
                  </div>
                  <div className="text-xs sm:text-sm">
                    <p className="text-secondary-600">
                      Saved{" "}
                      <span className="font-medium text-secondary-900">
                        Tesla Engineering Role
                      </span>
                    </p>
                    <p className="text-xs text-secondary-500">1 day ago</p>
                  </div>
                  <div className="text-xs sm:text-sm">
                    <p className="text-secondary-600">
                      Completed profile setup
                    </p>
                    <p className="text-xs text-secondary-500">3 days ago</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Profile Completion */}
            <Card>
              <CardHeader>
                <h3 className="text-base sm:text-lg font-semibold text-secondary-900">
                  Profile Completion
                </h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span>Profile Progress</span>
                    <span className="font-medium">75%</span>
                  </div>
                  <div className="w-full bg-secondary-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: "75%" }}
                    ></div>
                  </div>
                  <div className="text-xs sm:text-sm text-secondary-600">
                    <p>Add work experience to improve your profile</p>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => navigate("/profile")}
                  >
                    Complete Profile
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};
