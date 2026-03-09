import React, { useState, useEffect } from "react";
import { Users, FileText, Target, Calendar } from "lucide-react";
import { Card, CardBody } from "../../components/ui";
import { adminApi } from "../../services/adminApi";
import type { RecentActivity } from "../../services/adminApi";

export const AdminActivityPage: React.FC = () => {
  const [recentActivity, setRecentActivity] = useState<RecentActivity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const data = await adminApi.getRecentActivity();
        setRecentActivity(data);
      } catch (err) {
        console.error("Error fetching activity:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, []);

  if (loading) {
    return <div className="p-6">Loading activity...</div>;
  }

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "user-plus":
        return Users;
      case "file-text":
        return FileText;
      case "briefcase":
        return Target;
      default:
        return Calendar;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">All Activity</h1>
        <p className="text-neutral-600 mt-1">Complete activity log for the platform</p>
      </div>

      <Card>
        <CardBody className="p-0">
          <div className="divide-y divide-neutral-100">
            {recentActivity?.activities?.map((activity, index) => {
              const Icon = getIcon(activity.icon);
              return (
                <div
                  key={index}
                  className="flex items-start p-4 hover:bg-neutral-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 mb-1">
                      {activity.message}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
