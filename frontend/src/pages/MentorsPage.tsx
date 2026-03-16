import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { Input } from "../components/ui/Input";
import { Layout } from "../components/layout";
import { HeroSection } from "../components/HeroSection";
import { MentorsGrid } from "../components/mentors";

export const MentorsPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterExpertise, setFilterExpertise] = useState<string>("all");
  const [filterAvailability, setFilterAvailability] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("match");

  return (
    <Layout>
      <HeroSection
        title="Find Your Mentor"
        subtitle="Connect with experienced professionals who can guide your career journey and help you achieve your goals"
        backgroundImage="/mentor.png"
        showZigZag
      />
      
      <div className="w-full min-w-0 overflow-x-hidden px-2 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">

        {/* Search and Filters */}
        <div className="bg-white p-3 sm:p-6 rounded-lg shadow-sm mb-6 sm:mb-8">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder={t("Search mentors by name, expertise, or company")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-sm w-full"
              />
            </div>
            <div className="flex flex-col gap-2">
              <select
                value={filterExpertise}
                onChange={(e) => setFilterExpertise(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
              >
                <option value="all">{t("All Expertise")}</option>
                <option value="Product Management">{t("Product Management")}</option>
                <option value="Software Engineering">{t("Software Engineering")}</option>
                <option value="Design">{t("Design")}</option>
                <option value="Data Science">{t("Data Science")}</option>
                <option value="Marketing">{t("Marketing")}</option>
              </select>
              <select
                value={filterAvailability}
                onChange={(e) => setFilterAvailability(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
              >
                <option value="all">{t("All Availability")}</option>
                <option value="Available">{t("Available")}</option>
                <option value="Busy">{t("Busy")}</option>
                <option value="Offline">{t("Offline")}</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
              >
                <option value="match">{t("Best Match")}</option>
                <option value="rating">{t("Highest Rated")}</option>
                <option value="experience">{t("Most Experience")}</option>
                <option value="price_low">{t("Price: Low to High")}</option>
                <option value="price_high">{t("Price: High to Low")}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mentors Grid */}
        <MentorsGrid
          search={searchTerm}
          expertise={filterExpertise}
          availability={filterAvailability}
          sort={sortBy}
        />
      </div>
    </Layout>
  );
};
