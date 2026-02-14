import React from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Target,
  BookOpen,
  BarChart3,
  MessageSquare,
  ArrowRight,
  Zap,
  Globe,
  Award,
  Star,
  Trophy,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Layout } from "../components/layout";
import { Button, Card, CardBody } from "../components/ui";

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[85vh] sm:min-h-screen text-white overflow-hidden bg-fixed-md" style={{
        backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.35) 100%), url('/education2.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center bottom',
        backgroundRepeat: 'no-repeat'
      }}>
        
        {/* Creative Blur & Mesh Overlay Layer */}
        <div className="absolute inset-0 opacity-60 pointer-events-none" style={{
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 20%, rgba(34, 197, 94, 0.08) 0%, transparent 50%)
          `,
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)'
        }}></div>

        {/* Enhanced Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-black/40 pointer-events-none"></div>

        {/* Decorative Elements for Creativity */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 flex items-center justify-center min-h-[85vh] sm:min-h-screen">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center justify-items-center w-full">
            {/* Content */}
            <div className="text-center lg:text-left lg:pr-8 w-full">
              <h1 className="text-2xl xs:text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-3 sm:mb-4 lg:mb-6 leading-tight">
                Your Gateway to
                <span className="bg-gradient-to-r from-secondary-300 to-warning-300 bg-clip-text text-transparent block">
                  Global Excellence
                </span>
              </h1>

              <p className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl mb-4 sm:mb-6 lg:mb-8 text-primary-100 leading-relaxed px-2 sm:px-0">
                Discover life-changing scholarships, internships, and career
                opportunities worldwide. Get AI-powered recommendations, expert
                mentorship, and comprehensive support throughout your
                application journey.
              </p>

              {/* Stats Row */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-2 xs:gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8 lg:mb-10">
                <div className="flex items-center">
                  <div className="w-9 h-9 xs:w-10 xs:h-10 sm:w-12 sm:h-12 bg-success-500/20 rounded-lg flex items-center justify-center mr-1.5 xs:mr-2 sm:mr-3">
                    <Users className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-success-300" />
                  </div>
                  <div>
                    <div className="text-base xs:text-lg sm:text-xl lg:text-2xl font-bold text-white">15K+</div>
                    <div className="text-[10px] xs:text-xs sm:text-sm text-primary-200">
                      Active Fellows
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-9 h-9 xs:w-10 xs:h-10 sm:w-12 sm:h-12 bg-warning-500/20 rounded-lg flex items-center justify-center mr-1.5 xs:mr-2 sm:mr-3">
                    <Trophy className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-warning-300" />
                  </div>
                  <div>
                    <div className="text-base xs:text-lg sm:text-xl lg:text-2xl font-bold text-white">92%</div>
                    <div className="text-[10px] xs:text-xs sm:text-sm text-primary-200">Success Rate</div>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              {!isAuthenticated ? (
                <div className="flex flex-col sm:flex-row gap-2 xs:gap-3 sm:gap-4 justify-center lg:justify-start">
                  <Link to="/register" className="w-full sm:w-auto">
                    <Button className="w-full group relative px-4 py-2.5 xs:px-5 xs:py-3 sm:px-6 sm:py-3 lg:px-8 lg:py-4 bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 active:from-secondary-700 active:to-secondary-800 text-xs xs:text-sm sm:text-base lg:text-lg text-white font-semibold rounded-lg xs:rounded-xl shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-secondary-500/25 active:scale-95 active:shadow-lg cursor-pointer">
                      <span className="flex items-center justify-center">
                        Apply Now
                        <ArrowRight className="ml-1.5 xs:ml-2 w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg xs:rounded-xl"></div>
                    </Button>
                  </Link>
                  <Link to="/opportunities" className="w-full sm:w-auto">
                    <Button className="w-full px-4 py-2.5 xs:px-5 xs:py-3 sm:px-6 sm:py-3 lg:px-8 lg:py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 active:bg-white/30 text-xs xs:text-sm sm:text-base lg:text-lg text-white font-semibold rounded-lg xs:rounded-xl border border-white/20 hover:border-white/40 active:border-white/60 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer">
                      Explore Opportunities
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex justify-center lg:justify-start">
                  <Link to="/dashboard" className="w-full sm:w-auto">
                    <Button className="w-full group px-4 py-2.5 xs:px-5 xs:py-3 sm:px-6 sm:py-3 lg:px-8 lg:py-4 bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 active:from-secondary-700 active:to-secondary-800 text-xs xs:text-sm sm:text-base lg:text-lg text-white font-semibold rounded-lg xs:rounded-xl shadow-2xl transform transition-all duration-300 hover:scale-105 active:scale-95 active:shadow-lg hover:shadow-secondary-500/25 cursor-pointer">
                      <span className="flex items-center justify-center">
                        Go to Dashboard
                        <ArrowRight className="ml-1.5 xs:ml-2 w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" />
                      </span>
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Visual Elements */}
            <div className="hidden lg:block relative">
              <div className="relative">
                {/* Main Card */}
                <div className="relative bg-transparent backdrop-blur-lg rounded-3xl p-8 border-2 border-dashed border-primary-400 shadow-2xl overflow-hidden">
                  {/* Animated dotted background */}
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                    animation: 'moveDots 20s linear infinite'
                  }}></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          Global Network
                        </h3>
                        <p className="text-primary-200">Connect worldwide</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                        <span className="text-white font-medium">
                          Scholarships
                        </span>
                        <span className="text-secondary-300 font-semibold">
                          2,847
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                        <span className="text-white font-medium">
                          Internships
                        </span>
                        <span className="text-secondary-300 font-semibold">
                          1,923
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                        <span className="text-white font-medium">
                          Fellowships
                        </span>
                        <span className="text-secondary-300 font-semibold">
                          456
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32V120H1392C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120H0V64Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 xs:py-12 sm:py-16 lg:py-20 xl:py-24 bg-gradient-to-b from-white to-neutral-50">
        <div className="max-w-7xl mx-auto px-2 xs:px-3 sm:px-6 lg:px-8">
          <div className="text-center mb-6 xs:mb-10 sm:mb-12 lg:mb-16 xl:mb-20">
            <div className="inline-flex items-center bg-primary-100 px-1.5 xs:px-2 sm:px-4 py-1 xs:py-1.5 sm:py-2 rounded-full mb-3 xs:mb-4 sm:mb-6 max-w-[98%] mx-auto">
              <Star className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4 mr-0.5 xs:mr-1 sm:mr-2 text-primary-600 flex-shrink-0" />
              <span className="text-[8px] xs:text-[10px] sm:text-xs md:text-sm font-semibold text-primary-700 truncate">
                Comprehensive Platform
              </span>
            </div>
            <h2 className="text-base xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-secondary-900 mb-2 xs:mb-3 sm:mb-4 lg:mb-6 leading-tight px-1 xs:px-2">
              Everything You Need to
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent block">
                Succeed Globally
              </span>
            </h2>
            <p className="text-[10px] xs:text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-secondary-600 max-w-4xl mx-auto leading-snug xs:leading-relaxed px-2 xs:px-4 sm:px-6">
              From AI-powered opportunity discovery to expert mentorship, we
              provide all the cutting-edge tools and personalized support you
              need to unlock your potential and advance your career on the
              global stage.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 xs:gap-3 sm:gap-6 lg:gap-8">
            <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-primary-50/30">
              <CardBody className="text-center p-2 xs:p-3 sm:p-6 lg:p-8">
                <div className="w-8 h-8 xs:w-12 xs:h-12 sm:w-20 sm:h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-md xs:rounded-lg sm:rounded-2xl flex items-center justify-center mx-auto mb-1.5 xs:mb-2 sm:mb-6 group-hover:scale-110 transition-transform shadow-xl">
                  <Zap className="w-4 h-4 xs:w-6 xs:h-6 sm:w-10 sm:h-10 text-white" />
                </div>
                <h3 className="text-xs xs:text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-secondary-900 mb-1 xs:mb-1.5 sm:mb-3 lg:mb-4 leading-tight">
                  AI-Powered Discovery
                </h3>
                <p className="text-[9px] xs:text-xs sm:text-sm md:text-base text-secondary-600 leading-snug xs:leading-relaxed">
                  Get personalized opportunity recommendations based on your
                  profile, skills, and career goals using advanced machine
                  learning.
                </p>
              </CardBody>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-success-50/30">
              <CardBody className="text-center p-2 xs:p-3 sm:p-6 lg:p-8">
                <div className="w-8 h-8 xs:w-12 xs:h-12 sm:w-20 sm:h-20 bg-gradient-to-br from-success-500 to-success-600 rounded-md xs:rounded-lg sm:rounded-2xl flex items-center justify-center mx-auto mb-1.5 xs:mb-2 sm:mb-6 group-hover:scale-110 transition-transform shadow-xl">
                  <Users className="w-4 h-4 xs:w-6 xs:h-6 sm:w-10 sm:h-10 text-white" />
                </div>
                <h3 className="text-xs xs:text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-secondary-900 mb-1 xs:mb-1.5 sm:mb-3 lg:mb-4 leading-tight">
                  Expert Mentorship
                </h3>
                <p className="text-[9px] xs:text-xs sm:text-sm md:text-base text-secondary-600 leading-snug xs:leading-relaxed">
                  Connect with industry professionals for personalized guidance
                  on applications, interviews, and strategic career development.
                </p>
              </CardBody>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-warning-50/30">
              <CardBody className="text-center p-2 xs:p-3 sm:p-6 lg:p-8">
                <div className="w-8 h-8 xs:w-12 xs:h-12 sm:w-20 sm:h-20 bg-gradient-to-br from-warning-500 to-warning-600 rounded-md xs:rounded-lg sm:rounded-2xl flex items-center justify-center mx-auto mb-1.5 xs:mb-2 sm:mb-6 group-hover:scale-110 transition-transform shadow-xl">
                  <Target className="w-4 h-4 xs:w-6 xs:h-6 sm:w-10 sm:h-10 text-white" />
                </div>
                <h3 className="text-xs xs:text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-secondary-900 mb-1 xs:mb-1.5 sm:mb-3 lg:mb-4 leading-tight">
                  Smart Tracking
                </h3>
                <p className="text-[9px] xs:text-xs sm:text-sm md:text-base text-secondary-600 leading-snug xs:leading-relaxed">
                  Never miss a deadline with intelligent application tracking,
                  automated reminders, and comprehensive status monitoring.
                </p>
              </CardBody>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-error-50/30">
              <CardBody className="text-center p-2 xs:p-3 sm:p-6 lg:p-8">
                <div className="w-8 h-8 xs:w-12 xs:h-12 sm:w-20 sm:h-20 bg-gradient-to-br from-error-500 to-error-600 rounded-md xs:rounded-lg sm:rounded-2xl flex items-center justify-center mx-auto mb-1.5 xs:mb-2 sm:mb-6 group-hover:scale-110 transition-transform shadow-xl">
                  <BookOpen className="w-4 h-4 xs:w-6 xs:h-6 sm:w-10 sm:h-10 text-white" />
                </div>
                <h3 className="text-xs xs:text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-secondary-900 mb-1 xs:mb-1.5 sm:mb-3 lg:mb-4 leading-tight">
                  Premium Resources
                </h3>
                <p className="text-[9px] xs:text-xs sm:text-sm md:text-base text-secondary-600 leading-snug xs:leading-relaxed">
                  Access exclusive templates, comprehensive guides, and expert
                  tutorials to elevate your applications and interview
                  performance.
                </p>
              </CardBody>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-secondary-50/30">
              <CardBody className="text-center p-2 xs:p-3 sm:p-6 lg:p-8">
                <div className="w-8 h-8 xs:w-12 xs:h-12 sm:w-20 sm:h-20 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-md xs:rounded-lg sm:rounded-2xl flex items-center justify-center mx-auto mb-1.5 xs:mb-2 sm:mb-6 group-hover:scale-110 transition-transform shadow-xl">
                  <MessageSquare className="w-4 h-4 xs:w-6 xs:h-6 sm:w-10 sm:h-10 text-white" />
                </div>
                <h3 className="text-xs xs:text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-secondary-900 mb-1 xs:mb-1.5 sm:mb-3 lg:mb-4 leading-tight">
                  Global Community
                </h3>
                <p className="text-[9px] xs:text-xs sm:text-sm md:text-base text-secondary-600 leading-snug xs:leading-relaxed">
                  Join an exclusive community of ambitious peers, share
                  experiences, and build lasting connections with future global
                  leaders.
                </p>
              </CardBody>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-primary-50/30">
              <CardBody className="text-center p-2 xs:p-3 sm:p-6 lg:p-8">
                <div className="w-8 h-8 xs:w-12 xs:h-12 sm:w-20 sm:h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-md xs:rounded-lg sm:rounded-2xl flex items-center justify-center mx-auto mb-1.5 xs:mb-2 sm:mb-6 group-hover:scale-110 transition-transform shadow-xl">
                  <BarChart3 className="w-4 h-4 xs:w-6 xs:h-6 sm:w-10 sm:h-10 text-white" />
                </div>
                <h3 className="text-xs xs:text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-secondary-900 mb-1 xs:mb-1.5 sm:mb-3 lg:mb-4 leading-tight">
                  Success Analytics
                </h3>
                <p className="text-[9px] xs:text-xs sm:text-sm md:text-base text-secondary-600 leading-snug xs:leading-relaxed">
                  Track your progress with detailed analytics, success metrics,
                  and actionable insights to continuously improve your approach.
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 sm:py-20 lg:py-24 relative overflow-hidden bg-fixed-md" style={{
        backgroundImage: `url('/template.jpeg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        {/* Blur Overlay */}
        <div className="absolute inset-0 bg-secondary-900/15 backdrop-blur-[1px] pointer-events-none"></div>
        
        {/* Background Decorative Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full -translate-y-48 translate-x-48 blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-500/10 rounded-full translate-y-48 -translate-x-48 blur-3xl pointer-events-none"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <div className="inline-flex items-center bg-success-500/20 backdrop-blur-sm px-3 xs:px-4 sm:px-6 py-2 xs:py-2.5 sm:py-3 rounded-full mb-4 xs:mb-5 sm:mb-6 border border-success-400/30 max-w-[95%] mx-auto">
              <Globe className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 mr-1.5 xs:mr-2 text-success-300 flex-shrink-0" />
              <span className="text-sm xs:text-base sm:text-lg font-semibold text-success-200 truncate">
                Global Impact
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              Trusted by Students
              <span className="bg-gradient-to-r from-secondary-300 to-primary-300 bg-clip-text text-transparent block">
                Worldwide
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-secondary-200 max-w-3xl mx-auto leading-relaxed px-4">
              Join a thriving community of ambitious students who have
              transformed their futures through our comprehensive fellowship
              platform.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4 sm:gap-6 lg:gap-8">
            <div className="text-center group">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl xs:rounded-3xl p-3 xs:p-4 sm:p-6 lg:p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-success-400 to-success-600 rounded-xl xs:rounded-2xl flex items-center justify-center mx-auto mb-3 xs:mb-4 sm:mb-6">
                  <Users className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 text-white" />
                </div>
                <div className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-success-300 to-success-400 bg-clip-text text-transparent mb-2 xs:mb-3">
                  15K+
                </div>
                <div className="text-sm xs:text-base sm:text-lg font-semibold text-white mb-1 xs:mb-2">
                  Active Fellows
                </div>
                <div className="text-secondary-300 text-[10px] xs:text-xs sm:text-sm">Growing daily</div>
              </div>
            </div>

            <div className="text-center group">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl xs:rounded-3xl p-3 xs:p-4 sm:p-6 lg:p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl xs:rounded-2xl flex items-center justify-center mx-auto mb-3 xs:mb-4 sm:mb-6">
                  <Target className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 text-white" />
                </div>
                <div className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary-300 to-primary-400 bg-clip-text text-transparent mb-2 xs:mb-3">
                  8.5K+
                </div>
                <div className="text-sm xs:text-base sm:text-lg font-semibold text-white mb-1 xs:mb-2">
                  Opportunities
                </div>
                <div className="text-secondary-300 text-[10px] xs:text-xs sm:text-sm">Updated weekly</div>
              </div>
            </div>

            <div className="text-center group">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl xs:rounded-3xl p-3 xs:p-4 sm:p-6 lg:p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-warning-400 to-warning-600 rounded-xl xs:rounded-2xl flex items-center justify-center mx-auto mb-3 xs:mb-4 sm:mb-6">
                  <Award className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 text-white" />
                </div>
                <div className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-warning-300 to-warning-400 bg-clip-text text-transparent mb-2 xs:mb-3">
                  750+
                </div>
                <div className="text-sm xs:text-base sm:text-lg font-semibold text-white mb-1 xs:mb-2">
                  Expert Mentors
                </div>
                <div className="text-secondary-300 text-[10px] xs:text-xs sm:text-sm">
                  Industry leaders
                </div>
              </div>
            </div>

            <div className="text-center group">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl xs:rounded-3xl p-3 xs:p-4 sm:p-6 lg:p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-xl xs:rounded-2xl flex items-center justify-center mx-auto mb-3 xs:mb-4 sm:mb-6">
                  <Trophy className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 text-white" />
                </div>
                <div className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-secondary-300 to-secondary-400 bg-clip-text text-transparent mb-2 xs:mb-3">
                  92%
                </div>
                <div className="text-sm xs:text-base sm:text-lg font-semibold text-white mb-1 xs:mb-2">
                  Success Rate
                </div>
                <div className="text-secondary-300 text-[10px] xs:text-xs sm:text-sm">Proven results</div>
              </div>
            </div>
          </div>

          {/* Testimonial Quote */}
          <div className="mt-12 sm:mt-16 lg:mt-20 text-center">
            <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 sm:p-8 lg:p-10 border border-white/10 max-w-4xl mx-auto">
              <blockquote className="text-lg sm:text-xl lg:text-2xl font-semibold text-white mb-4 sm:mb-6 leading-relaxed">
                "beBrivus helped me find opportunities I never knew existed.
                The platform made it easy to track my applications and
                connect with mentors who guided me through the process."
              </blockquote>
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="font-semibold text-white text-sm sm:text-base">Michael Rodriguez</div>
                  <div className="text-secondary-300 text-xs sm:text-sm">
                    Fulbright Scholar, Stanford University
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      {!isAuthenticated && (
        <section className="relative py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary-900/80 to-primary-600/80"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-10 lg:mb-12">
              <div className="inline-flex items-center bg-secondary-500/20 backdrop-blur-sm px-6 py-3 rounded-full mb-6 border border-secondary-400/30">
                <Trophy className="w-5 h-5 mr-2 text-secondary-300" />
                <span className="text-lg font-semibold text-secondary-200">
                  Limited Time Application
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                Ready to Transform
                <span className="bg-gradient-to-r from-secondary-300 to-warning-300 bg-clip-text text-transparent block">
                  Your Future?
                </span>
              </h2>

              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-primary-100 mb-8 sm:mb-10 lg:mb-12 max-w-4xl mx-auto leading-relaxed px-4">
                Join thousands of ambitious students who have already unlocked
                their potential and secured life-changing opportunities through
                beBrivus. Your journey to global excellence starts with a single
                click.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-14 lg:mb-16">
              <div className="text-center group">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-secondary-400/20 to-secondary-600/20 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-secondary-300" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                  Instant Matching
                </h3>
                <p className="text-sm sm:text-base text-primary-200">
                  AI finds your perfect opportunities in seconds
                </p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-warning-400/20 to-warning-600/20 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8 sm:w-10 sm:h-10 text-warning-300" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                  Expert Guidance
                </h3>
                <p className="text-sm sm:text-base text-primary-200">
                  1-on-1 mentorship from industry leaders
                </p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-success-400/20 to-success-600/20 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                  <Target className="w-8 h-8 sm:w-10 sm:h-10 text-success-300" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                  Guaranteed Results
                </h3>
                <p className="text-sm sm:text-base text-primary-200">
                  92% of our fellows secure their dream opportunity
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="text-center">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
                <Link to="/register" className="w-full sm:w-auto">
                  <Button className="w-full group relative px-8 py-4 sm:px-10 sm:py-5 lg:px-12 lg:py-6 bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 active:from-secondary-700 active:to-secondary-800 text-base sm:text-lg lg:text-xl text-white font-bold rounded-2xl shadow-2xl transform transition-all duration-300 hover:scale-110 active:scale-90 active:shadow-lg hover:shadow-secondary-500/30 cursor-pointer">
                    <span className="flex items-center justify-center">
                      Apply Now - It's Free
                      <ArrowRight className="ml-2 sm:ml-3 w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:translate-x-2" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                  </Button>
                </Link>

                <div className="flex items-center text-primary-200">
                  <div className="flex -space-x-2 mr-3 sm:mr-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full border-2 border-white flex items-center justify-center text-white text-sm sm:text-base font-bold">
                      A
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full border-2 border-white flex items-center justify-center text-white text-sm sm:text-base font-bold">
                      M
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full border-2 border-white flex items-center justify-center text-white text-sm sm:text-base font-bold">
                      S
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full border-2 border-white flex items-center justify-center text-white text-sm sm:text-base font-bold">
                      +
                    </div>
                  </div>
                  <div>
                    <div className="text-sm sm:text-base font-semibold text-white">
                      Join 15,000+ Fellows
                    </div>
                    <div className="text-xs sm:text-sm">Start your journey today</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 sm:mt-8 flex justify-center">
                <Link to="/opportunities" className="w-full sm:w-auto">
                  <Button className="w-full px-6 py-3 sm:px-8 sm:py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 active:bg-white/30 text-sm sm:text-base text-white font-semibold rounded-xl border border-white/20 hover:border-white/40 active:border-white/60 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer">
                    Browse Opportunities First
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

    </Layout>
  );
};
