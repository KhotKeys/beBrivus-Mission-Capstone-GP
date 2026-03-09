import React from "react";
import { Layout } from "../components/layout";
import { Users, Target, Heart, Globe } from "lucide-react";

export const AboutUsPage: React.FC = () => {
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
              <div className="inline-flex items-center justify-center w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg xs:rounded-xl sm:rounded-2xl">
                <Users className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
              </div>
            </div>
            <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-secondary-900 mb-2 xs:mb-3 sm:mb-4">
              About beBrivus
            </h1>
            <p className="text-[10px] xs:text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-secondary-600 px-2">
              Empowering the next generation of global leaders
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg xs:rounded-xl sm:rounded-2xl shadow-lg p-4 xs:p-5 sm:p-6 md:p-8 lg:p-10 xl:p-12 space-y-4 xs:space-y-5 sm:space-y-6 lg:space-y-8">
            <section>
              <h2 className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-secondary-900 mb-2 xs:mb-3 sm:mb-4 text-center">
                Our Story
              </h2>
              <p className="text-[10px] xs:text-xs sm:text-sm md:text-base text-secondary-700 leading-relaxed mb-2 xs:mb-3 sm:mb-4">
                beBrivus was founded in 2020 by a group of scholarship recipients who experienced firsthand the challenges of navigating the complex world of global opportunities. We noticed that talented students often missed life-changing opportunities simply because they didn't know they existed or didn't have the guidance to apply successfully.
              </p>
              <p className="text-[10px] xs:text-xs sm:text-sm md:text-base text-secondary-700 leading-relaxed">
                What started as a simple database has evolved into a comprehensive platform that combines cutting-edge AI technology with human expertise to democratize access to scholarships, internships, and fellowships worldwide.
              </p>
            </section>

            <section>
              <div className="flex items-center mb-2 xs:mb-3 sm:mb-4">
                <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-lg xs:rounded-xl flex items-center justify-center mr-2 xs:mr-3 sm:mr-4">
                  <Target className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-primary-600" />
                </div>
                <h2 className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-secondary-900">
                  Our Mission
                </h2>
              </div>
              <p className="text-[10px] xs:text-xs sm:text-sm md:text-base text-secondary-700 leading-relaxed ml-0 sm:ml-10 md:ml-12 lg:ml-16">
                To make global educational and career opportunities accessible to ambitious students everywhere, regardless of their background or resources. We believe that talent is universal, but opportunity is not—and we're working to change that.
              </p>
            </section>

            <section>
              <div className="flex items-center mb-2 xs:mb-3 sm:mb-4">
                <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 bg-success-100 rounded-lg xs:rounded-xl flex items-center justify-center mr-2 xs:mr-3 sm:mr-4">
                  <Heart className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-success-600" />
                </div>
                <h2 className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-secondary-900">
                  Our Values
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-3 xs:gap-4 sm:gap-5 lg:gap-6 ml-0 sm:ml-10 md:ml-12 lg:ml-16">
                <div className="bg-neutral-50 p-3 xs:p-4 sm:p-5 lg:p-6 rounded-lg xs:rounded-xl">
                  <h3 className="font-bold text-secondary-900 mb-1 xs:mb-1.5 sm:mb-2 text-xs xs:text-sm sm:text-base">Accessibility</h3>
                  <p className="text-secondary-700 text-[10px] xs:text-xs sm:text-sm">
                    We're committed to making opportunities discoverable and achievable for everyone.
                  </p>
                </div>
                <div className="bg-neutral-50 p-3 xs:p-4 sm:p-5 lg:p-6 rounded-lg xs:rounded-xl">
                  <h3 className="font-bold text-secondary-900 mb-1 xs:mb-1.5 sm:mb-2 text-xs xs:text-sm sm:text-base">Excellence</h3>
                  <p className="text-secondary-700 text-[10px] xs:text-xs sm:text-sm">
                    We strive for the highest quality in everything we do, from technology to support.
                  </p>
                </div>
                <div className="bg-neutral-50 p-3 xs:p-4 sm:p-5 lg:p-6 rounded-lg xs:rounded-xl">
                  <h3 className="font-bold text-secondary-900 mb-1 xs:mb-1.5 sm:mb-2 text-xs xs:text-sm sm:text-base">Community</h3>
                  <p className="text-secondary-700 text-[10px] xs:text-xs sm:text-sm">
                    We believe in the power of connection and peer-to-peer support.
                  </p>
                </div>
                <div className="bg-neutral-50 p-3 xs:p-4 sm:p-5 lg:p-6 rounded-lg xs:rounded-xl">
                  <h3 className="font-bold text-secondary-900 mb-1 xs:mb-1.5 sm:mb-2 text-xs xs:text-sm sm:text-base">Innovation</h3>
                  <p className="text-secondary-700 text-[10px] xs:text-xs sm:text-sm">
                    We continuously evolve our platform using the latest technology.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center mb-2 xs:mb-3 sm:mb-4">
                <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 bg-warning-100 rounded-lg xs:rounded-xl flex items-center justify-center mr-2 xs:mr-3 sm:mr-4">
                  <Globe className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-warning-600" />
                </div>
                <h2 className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-secondary-900">
                  Our Impact
                </h2>
              </div>
              <div className="grid md:grid-cols-3 gap-3 xs:gap-4 sm:gap-5 lg:gap-6 ml-0 sm:ml-10 md:ml-12 lg:ml-16">
                <div className="text-center p-3 xs:p-4 sm:p-5 lg:p-6 bg-primary-50 rounded-lg xs:rounded-xl">
                  <div className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold text-primary-600 mb-1 xs:mb-1.5 sm:mb-2">15,000+</div>
                  <div className="text-secondary-700 text-[10px] xs:text-xs sm:text-sm md:text-base">Active Users</div>
                </div>
                <div className="text-center p-3 xs:p-4 sm:p-5 lg:p-6 bg-success-50 rounded-lg xs:rounded-xl">
                  <div className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold text-success-600 mb-1 xs:mb-1.5 sm:mb-2">8,500+</div>
                  <div className="text-secondary-700 text-[10px] xs:text-xs sm:text-sm md:text-base">Opportunities</div>
                </div>
                <div className="text-center p-3 xs:p-4 sm:p-5 lg:p-6 bg-warning-50 rounded-lg xs:rounded-xl">
                  <div className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold text-warning-600 mb-1 xs:mb-1.5 sm:mb-2">$450M+</div>
                  <div className="text-secondary-700 text-[10px] xs:text-xs sm:text-sm md:text-base">Funding Secured</div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-secondary-900 mb-2 xs:mb-3 sm:mb-4 text-center">
                Our Team
              </h2>
              <p className="text-[10px] xs:text-xs sm:text-sm md:text-base text-secondary-700 leading-relaxed">
                beBrivus is powered by a diverse team of technologists, educators, and former scholarship recipients from around the world. We're united by a shared passion for education equity and a commitment to helping students achieve their dreams.
              </p>
            </section>

            <section className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg xs:rounded-xl p-4 xs:p-5 sm:p-6 lg:p-8 text-center">
              <h2 className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-secondary-900 mb-2 xs:mb-3 sm:mb-4">
                Join Us on Our Mission
              </h2>
              <p className="text-[10px] xs:text-xs sm:text-sm md:text-base text-secondary-700 leading-relaxed mb-3 xs:mb-4 sm:mb-5 lg:mb-6">
                Whether you're a student seeking opportunities, a mentor willing to share your knowledge, or an organization looking to reach talented candidates, we invite you to be part of the beBrivus community.
              </p>
              <div className="flex flex-wrap gap-2 xs:gap-3 sm:gap-4 justify-center">
                <a
                  href="/register"
                  className="px-3 xs:px-4 sm:px-5 lg:px-6 py-1.5 xs:py-2 sm:py-2.5 lg:py-3 bg-primary-600 text-white font-semibold rounded-md xs:rounded-lg hover:bg-primary-700 transition-colors text-[10px] xs:text-xs sm:text-sm md:text-base"
                >
                  Get Started
                </a>
                <a
                  href="/contact"
                  className="px-3 xs:px-4 sm:px-5 lg:px-6 py-1.5 xs:py-2 sm:py-2.5 lg:py-3 bg-white text-primary-600 font-semibold rounded-md xs:rounded-lg border-2 border-primary-600 hover:bg-primary-50 transition-colors text-[10px] xs:text-xs sm:text-sm md:text-base"
                >
                  Contact Us
                </a>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};
