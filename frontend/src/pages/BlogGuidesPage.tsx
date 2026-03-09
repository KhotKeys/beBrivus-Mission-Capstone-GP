import React from "react";
import { Layout } from "../components/layout";
import { BookOpen, FileText, Video } from "lucide-react";

export const BlogGuidesPage: React.FC = () => {
  const guides = [
    {
      title: "The Ultimate Scholarship Application Guide",
      category: "Guide",
      description: "A comprehensive step-by-step guide to crafting winning scholarship applications.",
      readTime: "15 min read"
    },
    {
      title: "Top 10 Scholarships for International Students 2026",
      category: "Blog",
      description: "Discover the most prestigious and well-funded scholarships available this year.",
      readTime: "8 min read"
    },
    {
      title: "How to Write a Compelling Personal Statement",
      category: "Guide",
      description: "Expert tips and examples for creating personal statements that stand out.",
      readTime: "12 min read"
    },
    {
      title: "Interview Preparation Masterclass",
      category: "Video Guide",
      description: "Video series covering common interview questions and best practices.",
      readTime: "45 min watch"
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
                <BookOpen className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
              </div>
            </div>
            <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-secondary-900 mb-2 xs:mb-3 sm:mb-4">
              Blog & Guides
            </h1>
            <p className="text-[10px] xs:text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-secondary-600 px-2">
              Expert insights and resources to guide your scholarship journey
            </p>
          </div>

          {/* Content Grid */}
          <div className="grid md:grid-cols-2 gap-4 xs:gap-5 sm:gap-6 lg:gap-8 mb-6 xs:mb-8 sm:mb-10 lg:mb-12">
            {guides.map((guide, index) => (
              <div key={index} className="bg-white rounded-lg xs:rounded-xl sm:rounded-2xl shadow-lg p-4 xs:p-5 sm:p-6 lg:p-8 hover:shadow-xl transition-shadow">
                <div className="flex items-center mb-2 xs:mb-3 sm:mb-4">
                  {guide.category === "Video Guide" ? (
                    <Video className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-error-600 mr-1 xs:mr-1.5 sm:mr-2" />
                  ) : guide.category === "Guide" ? (
                    <FileText className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-primary-600 mr-1 xs:mr-1.5 sm:mr-2" />
                  ) : (
                    <BookOpen className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-success-600 mr-1 xs:mr-1.5 sm:mr-2" />
                  )}
                  <span className="text-[10px] xs:text-xs sm:text-sm font-semibold text-secondary-600">{guide.category}</span>
                  <span className="ml-auto text-[10px] xs:text-xs sm:text-sm text-secondary-500">{guide.readTime}</span>
                </div>
                <h3 className="text-sm xs:text-base sm:text-lg md:text-xl font-bold text-secondary-900 mb-2 xs:mb-2.5 sm:mb-3">{guide.title}</h3>
                <p className="text-[10px] xs:text-xs sm:text-sm md:text-base text-secondary-700 mb-2 xs:mb-3 sm:mb-4">{guide.description}</p>
                <button className="text-primary-600 font-semibold hover:text-primary-700 text-[10px] xs:text-xs sm:text-sm md:text-base">
                  Read More →
                </button>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg xs:rounded-xl sm:rounded-2xl p-6 xs:p-8 sm:p-10 lg:p-12 text-center text-white">
            <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-2 xs:mb-3 sm:mb-4">
              Want More Resources?
            </h2>
            <p className="text-[10px] xs:text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-primary-100 mb-3 xs:mb-4 sm:mb-5 lg:mb-6">
              Premium members get access to our complete library of guides, templates, and video tutorials
            </p>
            <a
              href="/register"
              className="inline-block px-4 xs:px-5 sm:px-6 lg:px-8 py-2 xs:py-2.5 sm:py-3 lg:py-4 bg-white text-primary-600 font-semibold rounded-lg xs:rounded-xl hover:bg-primary-50 transition-colors text-[10px] xs:text-xs sm:text-sm md:text-base"
            >
              Unlock Premium Content
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
};
