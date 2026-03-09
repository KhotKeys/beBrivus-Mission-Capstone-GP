import React from "react";
import { Calendar, Download, TrendingUp, Users, FileText, Globe } from "lucide-react";
import { Card, CardBody, Button } from "../../components/ui";

const highlights = [
  { label: "Active Users", value: "8,420", icon: Users, tone: "primary" },
  { label: "Applications Submitted", value: "1,932", icon: TrendingUp, tone: "success" },
  { label: "Resources Viewed", value: "6,104", icon: FileText, tone: "secondary" },
];

const topCountries = [
  { country: "Nigeria", users: 2150, signups: 410, applications: 520 },
  { country: "Kenya", users: 1380, signups: 260, applications: 310 },
  { country: "Uganda", users: 1225, signups: 230, applications: 280 },
  { country: "Ghana", users: 980, signups: 180, applications: 210 },
  { country: "Rwanda", users: 740, signups: 120, applications: 160 },
];

export const WeeklyAnalyticsReportPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Weekly Analytics Report</h1>
          <p className="text-neutral-600 mt-1">
            Snapshot of platform performance for the last 7 days.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="secondary" className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Feb 1 - Feb 7
          </Button>
          <Button className="bg-primary-600 hover:bg-primary-700 text-white flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {highlights.map((item) => {
          const Icon = item.icon;
          const toneClass =
            item.tone === "primary"
              ? "bg-primary-100 text-primary-600"
              : item.tone === "success"
              ? "bg-success-100 text-success-600"
              : "bg-secondary-100 text-secondary-600";

          return (
            <Card key={item.label}>
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-500">{item.label}</p>
                    <p className="text-2xl font-bold text-neutral-900 mt-2">{item.value}</p>
                    <p className="text-xs text-neutral-500 mt-1">+8% vs last week</p>
                  </div>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${toneClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardBody className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-neutral-900">Top Countries</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-neutral-500 border-b border-neutral-200">
                  <th className="py-2 pr-4">Country</th>
                  <th className="py-2 pr-4">Active Users</th>
                  <th className="py-2 pr-4">New Signups</th>
                  <th className="py-2 pr-4">Applications</th>
                </tr>
              </thead>
              <tbody>
                {topCountries.map((row) => (
                  <tr key={row.country} className="border-b border-neutral-100">
                    <td className="py-3 pr-4 font-semibold text-neutral-900">{row.country}</td>
                    <td className="py-3 pr-4">{row.users}</td>
                    <td className="py-3 pr-4">{row.signups}</td>
                    <td className="py-3 pr-4">{row.applications}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
