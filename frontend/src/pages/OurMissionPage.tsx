import React from "react";
import { Layout } from "../components/layout";
import { Target, Heart, TrendingUp, Users } from "lucide-react";

export const OurMissionPage: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white py-6 xs:py-8 sm:py-12 lg:py-16 xl:py-20 relative overflow-x-hidden">
        {/* Animated dotted background */}
        <div className="absolute inset-0 opacity-35 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, rgba(59, 130, 246, 0.5) 1.5px, transparent 1.5px)',
          backgroundSize: '20px 20px',
          animation: 'moveDots 20s linear infinite'
        }}></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className="text-center mb-6 xs:mb-8 sm:mb-10 lg:mb-12 xl:mb-16">
            <div className="flex justify-center mb-3 xs:mb-4 sm:mb-5 lg:mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-lg xs:rounded-xl sm:rounded-2xl">
                <Target className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
              </div>
            </div>
            <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-secondary-900 mb-2 xs:mb-3 sm:mb-4">
              Our Mission
            </h1>
            <p className="text-[10px] xs:text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-secondary-600 px-2">
              Democratizing access to global opportunities
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg xs:rounded-xl sm:rounded-2xl shadow-lg p-4 xs:p-5 sm:p-6 md:p-8 lg:p-10 xl:p-12 space-y-4 xs:space-y-5 sm:space-y-6 lg:space-y-8">
            <section>
              <p className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl text-secondary-700 leading-relaxed font-semibold mb-3 xs:mb-4 sm:mb-5 lg:mb-6">
                At beBrivus, we believe that talent is universal, but opportunity is not. Our mission is to change that.
              </p>
              <p className="text-[10px] xs:text-xs sm:text-sm md:text-base text-secondary-700 leading-relaxed">
                Every year, billions of dollars in scholarships, internships, and fellowships go unclaimed—not because there aren't deserving candidates, but because talented students simply don't know these opportunities exist or lack the guidance to apply successfully.
              </p>
            </section>

            <section>
              <div className="flex items-center mb-2 xs:mb-3 sm:mb-4">
                <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-lg xs:rounded-xl flex items-center justify-center mr-2 xs:mr-3 sm:mr-4">
                  <Heart className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-primary-600" />
                </div>
                <h2 className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-secondary-900">
                  What We Stand For
                </h2>
              </div>
              <div className="space-y-2 xs:space-y-3 sm:space-y-4 ml-0 sm:ml-10 md:ml-12 lg:ml-16">
                <div>
                  <h3 className="text-xs xs:text-sm sm:text-base md:text-lg font-semibold text-secondary-900 mb-1 xs:mb-1.5 sm:mb-2">Equal Access</h3>
                  <p className="text-[10px] xs:text-xs sm:text-sm md:text-base text-secondary-700">
                    We're committed to making global opportunities discoverable and accessible to students from all backgrounds, regardless of their resources or connections.
                  </p>
                </div>
                <div>
                  <h3 className="text-xs xs:text-sm sm:text-base md:text-lg font-semibold text-secondary-900 mb-1 xs:mb-1.5 sm:mb-2">Empowerment Through Technology</h3>
                  <p className="text-[10px] xs:text-xs sm:text-sm md:text-base text-secondary-700">
                    By combining AI-powered recommendations with human expertise, we empower students to find and pursue opportunities that align with their goals.
                  </p>
                </div>
                <div>
                  <h3 className="text-xs xs:text-sm sm:text-base md:text-lg font-semibold text-secondary-900 mb-1 xs:mb-1.5 sm:mb-2">Community & Support</h3>
                  <p className="text-[10px] xs:text-xs sm:text-sm md:text-base text-secondary-700">
                    We believe in the power of community. Through mentorship and peer support, we help students navigate complex application processes with confidence.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center mb-2 xs:mb-3 sm:mb-4">
                <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 bg-success-100 rounded-lg xs:rounded-xl flex items-center justify-center mr-2 xs:mr-3 sm:mr-4">
                  <TrendingUp className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-success-600" />
                </div>
                <h2 className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-secondary-900">
                  Our Goals
                </h2>
              </div>
              <ul className="list-disc list-inside space-y-1.5 xs:space-y-2 sm:space-y-3 text-[10px] xs:text-xs sm:text-sm md:text-base text-secondary-700 ml-0 sm:ml-10 md:ml-12 lg:ml-16">
                <li>Help 100,000 students secure life-changing opportunities by 2030</li>
                <li>Build the world's most comprehensive database of global opportunities</li>
                <li>Create a thriving community of successful fellows who support each other</li>
                <li>Partner with institutions to make opportunities more accessible</li>
                <li>Continuously innovate to reduce barriers to global education</li>
              </ul>
            </section>

            <section>
              <div className="flex items-center mb-2 xs:mb-3 sm:mb-4">
                <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 bg-warning-100 rounded-lg xs:rounded-xl flex items-center justify-center mr-2 xs:mr-3 sm:mr-4">
                  <Users className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-warning-600" />
                </div>
                <h2 className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-secondary-900">
                  How We Make It Happen
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-2 xs:gap-3 sm:gap-4 ml-0 sm:ml-10 md:ml-12 lg:ml-16">
                <div className="bg-neutral-50 p-3 xs:p-4 sm:p-5 lg:p-6 rounded-lg xs:rounded-xl">
                  <h3 className="font-bold text-secondary-900 mb-1 xs:mb-1.5 sm:mb-2 text-xs xs:text-sm sm:text-base">Technology</h3>
                  <p className="text-secondary-700 text-[10px] xs:text-xs sm:text-sm">
                    Advanced AI algorithms match students with opportunities tailored to their profiles and goals.
                  </p>
                </div>
                <div className="bg-neutral-50 p-3 xs:p-4 sm:p-5 lg:p-6 rounded-lg xs:rounded-xl">
                  <h3 className="font-bold text-secondary-900 mb-1 xs:mb-1.5 sm:mb-2 text-xs xs:text-sm sm:text-base">Mentorship</h3>
                  <p className="text-secondary-700 text-[10px] xs:text-xs sm:text-sm">
                    Connect with successful scholarship recipients who provide personalized guidance.
                  </p>
                </div>
                <div className="bg-neutral-50 p-3 xs:p-4 sm:p-5 lg:p-6 rounded-lg xs:rounded-xl">
                  <h3 className="font-bold text-secondary-900 mb-1 xs:mb-1.5 sm:mb-2 text-xs xs:text-sm sm:text-base">Resources</h3>
                  <p className="text-secondary-700 text-[10px] xs:text-xs sm:text-sm">
                    Access comprehensive guides, templates, and tools to strengthen your applications.
                  </p>
                </div>
                <div className="bg-neutral-50 p-3 xs:p-4 sm:p-5 lg:p-6 rounded-lg xs:rounded-xl">
                  <h3 className="font-bold text-secondary-900 mb-1 xs:mb-1.5 sm:mb-2 text-xs xs:text-sm sm:text-base">Community</h3>
                  <p className="text-secondary-700 text-[10px] xs:text-xs sm:text-sm">
                    Join a supportive network of ambitious peers pursuing similar goals.
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg xs:rounded-xl p-4 xs:p-5 sm:p-6 lg:p-8 text-center">
              <h2 className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-secondary-900 mb-2 xs:mb-3 sm:mb-4">
                Join Us in Our Mission
              </h2>
              <p className="text-[10px] xs:text-xs sm:text-sm md:text-base text-secondary-700 leading-relaxed mb-3 xs:mb-4 sm:mb-5 lg:mb-6">
                Whether you're a student seeking opportunities, a mentor willing to give back, or an organization looking to reach talented candidates, we invite you to be part of our movement to democratize access to global opportunities.
              </p>
              <a
                href="/register"
                className="inline-block px-3 xs:px-4 sm:px-5 lg:px-6 py-1.5 xs:py-2 sm:py-2.5 lg:py-3 bg-primary-600 text-white font-semibold rounded-md xs:rounded-lg hover:bg-primary-700 transition-colors text-[10px] xs:text-xs sm:text-sm md:text-base"
              >
                Get Started Today
              </a>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};
