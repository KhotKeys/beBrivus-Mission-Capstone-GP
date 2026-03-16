import React from "react";
import { Layout } from "../components/layout";
import { useTranslation } from 'react-i18next';
import { LifeBuoy, Search, BookOpen, MessageCircle, Mail } from "lucide-react";

export const HelpCenterPage: React.FC = () => {
  const { t } = useTranslation();
  const categories = [
    {
      icon: Search,
      title: "Getting Started",
      description: "Learn the basics of using beBrivus",
      articles: 12
    },
    {
      icon: BookOpen,
      title: "Finding Opportunities",
      description: "How to search and filter opportunities",
      articles: 8
    },
    {
      icon: MessageCircle,
      title: "Mentorship",
      description: "Connect with and learn from mentors",
      articles: 6
    },
    {
      icon: Mail,
      title: "Account & Billing",
      description: "Manage your account and subscription",
      articles: 10
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white py-6 xs:py-8 sm:py-12 lg:py-16 xl:py-20 relative overflow-x-hidden">
        {/* Animated dotted background */}
        <div className="absolute inset-0 opacity-35 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, rgba(59, 130, 246, 0.5) 1.5px, transparent 1.5px)',
          backgroundSize: '20px 20px',
          animation: 'moveDots 20s linear infinite'
        }}></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className="text-center mb-6 xs:mb-8 sm:mb-10 lg:mb-12 xl:mb-16">
            <div className="flex justify-center mb-3 xs:mb-4 sm:mb-5 lg:mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-lg xs:rounded-xl sm:rounded-2xl">
                <LifeBuoy className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
              </div>
            </div>
            <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-secondary-900 mb-2 xs:mb-3 sm:mb-4">
              Help Center
            </h1>
            <p className="text-[10px] xs:text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-secondary-600 mb-4 xs:mb-5 sm:mb-6 lg:mb-8 px-2">
              Find answers and get support whenever you need it
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto px-2">
              <div className="relative">
                <Search className="absolute left-2 xs:left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-secondary-400 w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder="Search for help articles..."
                  className="w-full pl-7 xs:pl-9 sm:pl-12 pr-2 xs:pr-3 sm:pr-4 py-2 xs:py-3 sm:py-3.5 lg:py-4 border-2 border-neutral-200 rounded-lg xs:rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-[10px] xs:text-xs sm:text-sm md:text-base lg:text-lg"
                />
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4 sm:gap-5 lg:gap-6 mb-6 xs:mb-8 sm:mb-10 lg:mb-12">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <div key={index} className="bg-white rounded-lg xs:rounded-xl sm:rounded-2xl shadow-lg p-3 xs:p-4 sm:p-5 lg:p-6 hover:shadow-xl transition-shadow cursor-pointer">
                  <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-lg xs:rounded-xl flex items-center justify-center mb-2 xs:mb-3 sm:mb-4">
                    <Icon className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-primary-600" />
                  </div>
                  <h3 className="text-xs xs:text-sm sm:text-base md:text-lg font-bold text-secondary-900 mb-1 xs:mb-1.5 sm:mb-2">{category.title}</h3>
                  <p className="text-secondary-600 text-[10px] xs:text-xs sm:text-sm mb-1.5 xs:mb-2 sm:mb-3">{category.description}</p>
                  <p className="text-primary-600 text-[10px] xs:text-xs sm:text-sm font-semibold">{category.articles} articles</p>
                </div>
              );
            })}
          </div>

          {/* Popular Articles */}
          <div className="bg-white rounded-lg xs:rounded-xl sm:rounded-2xl shadow-lg p-4 xs:p-5 sm:p-6 lg:p-8 mb-4 xs:mb-5 sm:mb-6 lg:mb-8">
            <h2 className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-secondary-900 mb-3 xs:mb-4 sm:mb-5 lg:mb-6 text-center">{t('Popular Articles')}</h2>
            <div className="space-y-2 xs:space-y-3 sm:space-y-4">
              <a href="#" className="block p-2 xs:p-3 sm:p-4 hover:bg-neutral-50 rounded-md xs:rounded-lg transition-colors">
                <h3 className="font-semibold text-secondary-900 mb-0.5 xs:mb-1 text-xs xs:text-sm sm:text-base">{t('How do I create an account?')}</h3>
                <p className="text-secondary-600 text-[10px] xs:text-xs sm:text-sm">{t('Step-by-step guide to getting started with beBrivus')}</p>
              </a>
              <a href="#" className="block p-2 xs:p-3 sm:p-4 hover:bg-neutral-50 rounded-md xs:rounded-lg transition-colors">
                <h3 className="font-semibold text-secondary-900 mb-0.5 xs:mb-1 text-xs xs:text-sm sm:text-base">{t('How does the AI recommendation system work?')}</h3>
                <p className="text-secondary-600 text-[10px] xs:text-xs sm:text-sm">{t('Learn about our personalized opportunity matching')}</p>
              </a>
              <a href="#" className="block p-2 xs:p-3 sm:p-4 hover:bg-neutral-50 rounded-md xs:rounded-lg transition-colors">
                <h3 className="font-semibold text-secondary-900 mb-0.5 xs:mb-1 text-xs xs:text-sm sm:text-base">{t('How do I connect with a mentor?')}</h3>
                <p className="text-secondary-600 text-[10px] xs:text-xs sm:text-sm">{t('Find and book sessions with expert mentors')}</p>
              </a>
            </div>
          </div>

          {/* Contact Support */}
          <div className="grid md:grid-cols-2 gap-3 xs:gap-4 sm:gap-5 lg:gap-6">
            <div className="bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg xs:rounded-xl sm:rounded-2xl p-4 xs:p-5 sm:p-6 lg:p-8 text-white text-center md:text-left">
              <h3 className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-bold mb-2 xs:mb-3">{t('Still Need Help?')}</h3>
              <p className="text-primary-100 mb-3 xs:mb-4 sm:mb-5 lg:mb-6 text-[10px] xs:text-xs sm:text-sm md:text-base">
                Our support team is ready to assist you with any questions
              </p>
              <a
                href="/contact"
                className="inline-block px-3 xs:px-4 sm:px-5 lg:px-6 py-1.5 xs:py-2 sm:py-2.5 lg:py-3 bg-white text-primary-600 font-semibold rounded-md xs:rounded-lg hover:bg-primary-50 transition-colors text-[10px] xs:text-xs sm:text-sm md:text-base"
              >
                Contact Support
              </a>
            </div>
            <div className="bg-white rounded-lg xs:rounded-xl sm:rounded-2xl shadow-lg p-4 xs:p-5 sm:p-6 lg:p-8 text-center md:text-left">
              <h3 className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-secondary-900 mb-2 xs:mb-3">{t('Browse All Topics')}</h3>
              <p className="text-secondary-700 mb-3 xs:mb-4 sm:mb-5 lg:mb-6 text-[10px] xs:text-xs sm:text-sm md:text-base">
                Explore our complete knowledge base for detailed guides and tutorials
              </p>
              <a
                href="/faq"
                className="inline-block px-3 xs:px-4 sm:px-5 lg:px-6 py-1.5 xs:py-2 sm:py-2.5 lg:py-3 bg-primary-600 text-white font-semibold rounded-md xs:rounded-lg hover:bg-primary-700 transition-colors text-[10px] xs:text-xs sm:text-sm md:text-base"
              >
                View FAQ
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
