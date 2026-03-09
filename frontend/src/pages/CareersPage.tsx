import React from "react";
import { Layout } from "../components/layout";
import { Briefcase, TrendingUp, Users, Heart } from "lucide-react";

export const CareersPage: React.FC = () => {
  const openings = [
    {
      title: "Senior Full-Stack Developer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time"
    },
    {
      title: "Product Manager",
      department: "Product",
      location: "Kigali, Rwanda",
      type: "Full-time"
    },
    {
      title: "Community Manager",
      department: "Community",
      location: "Remote",
      type: "Full-time"
    },
    {
      title: "Data Scientist",
      department: "AI/ML",
      location: "Remote",
      type: "Full-time"
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
              <div className="inline-flex items-center justify-center w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-success-500 to-success-600 rounded-lg xs:rounded-xl sm:rounded-2xl">
                <Briefcase className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
              </div>
            </div>
            <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-secondary-900 mb-2 xs:mb-3 sm:mb-4">
              Careers at beBrivus
            </h1>
            <p className="text-[10px] xs:text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-secondary-600 max-w-3xl mx-auto px-2">
              Join our mission to democratize access to global opportunities and help students achieve their dreams
            </p>
          </div>

          {/* Why Join Us */}
          <div className="bg-white rounded-lg xs:rounded-xl sm:rounded-2xl shadow-lg p-4 xs:p-5 sm:p-6 md:p-8 lg:p-10 xl:p-12 mb-6 xs:mb-8 sm:mb-10 lg:mb-12">
            <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-secondary-900 mb-4 xs:mb-5 sm:mb-6 lg:mb-8 text-center">
              Why Work at beBrivus?
            </h2>
            <div className="grid md:grid-cols-3 gap-4 xs:gap-5 sm:gap-6 lg:gap-8">
              <div className="text-center">
                <div className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-primary-100 rounded-lg xs:rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-2 xs:mb-3 sm:mb-4">
                  <Heart className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-primary-600" />
                </div>
                <h3 className="text-sm xs:text-base sm:text-lg md:text-xl font-bold text-secondary-900 mb-1 xs:mb-1.5 sm:mb-2">Meaningful Impact</h3>
                <p className="text-[10px] xs:text-xs sm:text-sm md:text-base text-secondary-700">
                  Help thousands of students access life-changing opportunities every day
                </p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-success-100 rounded-lg xs:rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-2 xs:mb-3 sm:mb-4">
                  <TrendingUp className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-success-600" />
                </div>
                <h3 className="text-sm xs:text-base sm:text-lg md:text-xl font-bold text-secondary-900 mb-1 xs:mb-1.5 sm:mb-2">Growth Opportunities</h3>
                <p className="text-[10px] xs:text-xs sm:text-sm md:text-base text-secondary-700">
                  Develop your skills in a fast-paced, innovative environment
                </p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-warning-100 rounded-lg xs:rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-2 xs:mb-3 sm:mb-4">
                  <Users className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-warning-600" />
                </div>
                <h3 className="text-sm xs:text-base sm:text-lg md:text-xl font-bold text-secondary-900 mb-1 xs:mb-1.5 sm:mb-2">Amazing Team</h3>
                <p className="text-[10px] xs:text-xs sm:text-sm md:text-base text-secondary-700">
                  Work with talented, passionate people from around the world
                </p>
              </div>
            </div>
          </div>

          {/* Open Positions */}
          <div className="mb-6 xs:mb-8 sm:mb-10 lg:mb-12">
            <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-secondary-900 mb-4 xs:mb-5 sm:mb-6 lg:mb-8 text-center">Open Positions</h2>
            <div className="space-y-3 xs:space-y-4">
              {openings.map((job, index) => (
                <div key={index} className="bg-white rounded-lg xs:rounded-xl shadow-lg p-3 xs:p-4 sm:p-5 lg:p-6 hover:shadow-xl transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-sm xs:text-base sm:text-lg md:text-xl font-bold text-secondary-900 mb-1 xs:mb-1.5 sm:mb-2">{job.title}</h3>
                      <div className="flex flex-wrap gap-2 xs:gap-3 text-[10px] xs:text-xs sm:text-sm text-secondary-600">
                        <span className="flex items-center">
                          <span className="w-1.5 h-1.5 xs:w-2 xs:h-2 bg-primary-600 rounded-full mr-1 xs:mr-2"></span>
                          {job.department}
                        </span>
                        <span className="flex items-center">
                          <span className="w-1.5 h-1.5 xs:w-2 xs:h-2 bg-success-600 rounded-full mr-1 xs:mr-2"></span>
                          {job.location}
                        </span>
                        <span className="flex items-center">
                          <span className="w-1.5 h-1.5 xs:w-2 xs:h-2 bg-warning-600 rounded-full mr-1 xs:mr-2"></span>
                          {job.type}
                        </span>
                      </div>
                    </div>
                    <button className="mt-3 xs:mt-4 md:mt-0 px-3 xs:px-4 sm:px-5 lg:px-6 py-1.5 xs:py-2 sm:py-2.5 lg:py-3 bg-primary-600 text-white font-semibold rounded-md xs:rounded-lg hover:bg-primary-700 transition-colors text-[10px] xs:text-xs sm:text-sm md:text-base">
                      Apply Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-white rounded-lg xs:rounded-xl sm:rounded-2xl shadow-lg p-4 xs:p-5 sm:p-6 md:p-8 lg:p-10 xl:p-12 mb-6 xs:mb-8 sm:mb-10 lg:mb-12">
            <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-secondary-900 mb-4 xs:mb-5 sm:mb-6 lg:mb-8 text-center">Benefits & Perks</h2>
            <div className="grid md:grid-cols-2 gap-3 xs:gap-4 sm:gap-5 lg:gap-6">
              <div className="flex items-start">
                <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 bg-success-100 rounded-md xs:rounded-lg flex items-center justify-center mr-2 xs:mr-3 sm:mr-4 flex-shrink-0 mt-1">
                  <span className="text-success-600 font-bold text-[10px] xs:text-xs sm:text-sm">✓</span>
                </div>
                <div>
                  <h3 className="font-bold text-secondary-900 mb-0.5 xs:mb-1 text-xs xs:text-sm sm:text-base">Competitive Salary & Equity</h3>
                  <p className="text-secondary-700 text-[10px] xs:text-xs sm:text-sm">Industry-leading compensation with equity options</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 bg-success-100 rounded-md xs:rounded-lg flex items-center justify-center mr-2 xs:mr-3 sm:mr-4 flex-shrink-0 mt-1">
                  <span className="text-success-600 font-bold text-[10px] xs:text-xs sm:text-sm">✓</span>
                </div>
                <div>
                  <h3 className="font-bold text-secondary-900 mb-0.5 xs:mb-1 text-xs xs:text-sm sm:text-base">Health & Wellness</h3>
                  <p className="text-secondary-700 text-[10px] xs:text-xs sm:text-sm">Comprehensive health, dental, and vision coverage</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 bg-success-100 rounded-md xs:rounded-lg flex items-center justify-center mr-2 xs:mr-3 sm:mr-4 flex-shrink-0 mt-1">
                  <span className="text-success-600 font-bold text-[10px] xs:text-xs sm:text-sm">✓</span>
                </div>
                <div>
                  <h3 className="font-bold text-secondary-900 mb-0.5 xs:mb-1 text-xs xs:text-sm sm:text-base">Flexible Work</h3>
                  <p className="text-secondary-700 text-[10px] xs:text-xs sm:text-sm">Remote-first culture with flexible hours</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 bg-success-100 rounded-md xs:rounded-lg flex items-center justify-center mr-2 xs:mr-3 sm:mr-4 flex-shrink-0 mt-1">
                  <span className="text-success-600 font-bold text-[10px] xs:text-xs sm:text-sm">✓</span>
                </div>
                <div>
                  <h3 className="font-bold text-secondary-900 mb-0.5 xs:mb-1 text-xs xs:text-sm sm:text-base">Professional Development</h3>
                  <p className="text-secondary-700 text-[10px] xs:text-xs sm:text-sm">Learning budget and conference attendance</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 bg-success-100 rounded-md xs:rounded-lg flex items-center justify-center mr-2 xs:mr-3 sm:mr-4 flex-shrink-0 mt-1">
                  <span className="text-success-600 font-bold text-[10px] xs:text-xs sm:text-sm">✓</span>
                </div>
                <div>
                  <h3 className="font-bold text-secondary-900 mb-0.5 xs:mb-1 text-xs xs:text-sm sm:text-base">Unlimited PTO</h3>
                  <p className="text-secondary-700 text-[10px] xs:text-xs sm:text-sm">Take time off when you need it</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 bg-success-100 rounded-md xs:rounded-lg flex items-center justify-center mr-2 xs:mr-3 sm:mr-4 flex-shrink-0 mt-1">
                  <span className="text-success-600 font-bold text-[10px] xs:text-xs sm:text-sm">✓</span>
                </div>
                <div>
                  <h3 className="font-bold text-secondary-900 mb-0.5 xs:mb-1 text-xs xs:text-sm sm:text-base">Home Office Setup</h3>
                  <p className="text-secondary-700 text-[10px] xs:text-xs sm:text-sm">Budget for your ideal workspace</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg xs:rounded-xl sm:rounded-2xl p-6 xs:p-8 sm:p-10 lg:p-12 text-center text-white">
            <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-2 xs:mb-3 sm:mb-4">
              Don't See the Perfect Role?
            </h2>
            <p className="text-[10px] xs:text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-primary-100 mb-4 xs:mb-5 sm:mb-6 lg:mb-8">
              We're always looking for talented people. Send us your resume!
            </p>
            <a
              href="/contact"
              className="inline-block px-4 xs:px-5 sm:px-6 lg:px-8 py-2 xs:py-2.5 sm:py-3 lg:py-4 bg-white text-primary-600 font-semibold rounded-lg xs:rounded-xl hover:bg-primary-50 transition-colors text-[10px] xs:text-xs sm:text-sm md:text-base"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
};
