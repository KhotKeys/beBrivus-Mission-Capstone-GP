import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
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
import { useLanguage } from "../hooks/useLanguage";
import HeroDotCanvas from "../components/HeroDotCanvas";

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Restore language on component mount
  useLanguage();

  useEffect(() => {
    if (user?.user_type === "mentor") {
      navigate("/mentor-dashboard");
    }
  }, []);

  const userName = user?.first_name || '';

  return (
    <Layout>
      <style>{`
        .hero-section {
          position:        relative;
          width:           100%;
          height:          520px;
          overflow:        hidden;
          display:         flex;
          align-items:     center;
          justify-content: center;
        }
        @media (max-width: 1024px) { .hero-section { height: 420px; } }
        @media (max-width: 768px)  { .hero-section { height: 340px; } }
        @media (max-width: 480px)  { .hero-section { height: 280px; } }

        .hero-video {
          position:        absolute;
          inset:           0;
          width:           100%;
          height:          100%;
          object-fit:      cover;
          object-position: center;
          z-index:         0;
        }
        .hero-overlay {
          position:   absolute;
          inset:      0;
          background: linear-gradient(
            135deg,
            rgba(0,0,0,0.38) 0%,
            rgba(0,0,0,0.18) 40%,
            rgba(0,0,0,0.18) 60%,
            rgba(0,0,0,0.38) 100%
          );
          z-index: 1;
        }
        .hero-bottom-fade {
          position:   absolute;
          bottom:     0;
          left:       0;
          right:      0;
          height:     80px;
          background: linear-gradient(to bottom, transparent, rgba(249,250,251,0.95));
          z-index:    4;
          pointer-events: none;
        }
        .hero-content {
          position:   relative;
          z-index:    3;
          text-align: center;
          padding:    0 8px;
          max-width:  700px;
          width:      100%;
          box-sizing: border-box;
        }
        .hero-greeting {
          font-size:      clamp(13px, 5vw, 48px);
          font-weight:    800;
          color:          white;
          margin:         0 0 8px;
          line-height:    1.2;
          text-shadow:    0 2px 20px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.4);
          letter-spacing: -0.5px;
          word-break:     break-word;
          overflow-wrap:  break-word;
        }
        .hero-subtitle {
          font-size:   clamp(9px, 2.2vw, 18px);
          color:       rgba(255,255,255,0.88);
          margin:      0 0 14px;
          line-height: 1.5;
          text-shadow: 0 1px 8px rgba(0,0,0,0.45);
          font-weight: 400;
          word-break:  break-word;
        }
        .hero-cta-row {
          display:         flex;
          gap:             6px;
          justify-content: center;
          flex-wrap:       wrap;
        }
        .hero-cta-primary {
          padding:         clamp(5px, 1.5vw, 12px) clamp(8px, 3vw, 28px);
          border-radius:   10px;
          border:          none;
          background:      #065f46;
          color:           white;
          font-size:       clamp(9px, 2.5vw, 15px);
          font-weight:     700;
          cursor:          pointer;
          text-decoration: none;
          display:         inline-flex;
          align-items:     center;
          gap:             clamp(3px, 1vw, 8px);
          transition:      transform 0.2s, box-shadow 0.2s, background 0.2s;
          box-shadow:      0 4px 16px rgba(6,95,70,0.4);
          white-space:     nowrap;
        }
        .hero-cta-primary:hover {
          background:  #047857;
          transform:   translateY(-2px);
          box-shadow:  0 8px 24px rgba(6,95,70,0.5);
        }
        .hero-cta-secondary {
          padding:         clamp(5px, 1.5vw, 12px) clamp(8px, 3vw, 28px);
          border-radius:   10px;
          border:          2px solid rgba(255,255,255,0.75);
          background:      rgba(255,255,255,0.12);
          color:           white;
          font-size:       clamp(9px, 2.5vw, 15px);
          font-weight:     600;
          cursor:          pointer;
          text-decoration: none;
          display:         inline-flex;
          align-items:     center;
          gap:             clamp(3px, 1vw, 8px);
          backdrop-filter: blur(4px);
          transition:      transform 0.2s, background 0.2s, border-color 0.2s;
          white-space:     nowrap;
        }
        .hero-cta-secondary:hover {
          background:   rgba(255,255,255,0.22);
          border-color: white;
          transform:    translateY(-2px);
        }
        .hero-scroll-indicator {
          position:       absolute;
          bottom:         20px;
          left:           50%;
          transform:      translateX(-50%);
          z-index:        4;
          display:        flex;
          flex-direction: column;
          align-items:    center;
          gap:            6px;
          opacity:        0.6;
          animation:      heroScrollBounce 2s ease-in-out infinite;
        }
        @media (max-width: 480px) { .hero-scroll-indicator { bottom: 12px; } }
        @media (max-width: 300px) { .hero-scroll-indicator { display: none; } }
        @keyframes heroScrollBounce {
          0%, 100% { transform: translateX(-50%) translateY(0px); }
          50%       { transform: translateX(-50%) translateY(6px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-scroll-indicator { animation: none; }
          .hero-cta-primary, .hero-cta-secondary { transition: none; }
        }
      `}</style>

      {/* ══════════════════════════════════════════════════════ */}
      {/* HERO SECTION                                          */}
      {/* ══════════════════════════════════════════════════════ */}
      <section className="hero-section" aria-label="Welcome hero">

        {/* Layer 1 — Video background */}
        <video
          className="hero-video"
          src="/access.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          onError={(e) => {
            (e.currentTarget as HTMLVideoElement).style.display = 'none';
          }}
        />

        {/* Layer 2 — Subtle gradient overlay */}
        <div className="hero-overlay" aria-hidden="true" />

        {/* Layer 3 — Dot canvas (subtle, never overpowers video) */}
        <HeroDotCanvas
          dotCount={1800}
          waveRadius={120}
          waveStrength={6}
          returnSpeed={0.04}
          idleShiftMs={5000}
        />

        {/* Layer 4 — Hero text content */}
        <div className="hero-content">
          <h1 className="hero-greeting">
            {userName ? `Welcome back, ${userName} 👋` : 'Welcome to beBrivus'}
          </h1>
          <p className="hero-subtitle">
            Your gateway to opportunities, mentorship, and a thriving community.<br />
            Everything you need to grow — right here.
          </p>
          <div className="hero-cta-row">
            <a href="/opportunities" className="hero-cta-primary">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              Explore Opportunities
            </a>
            <a href="/mentors" className="hero-cta-secondary">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              Find a Mentor
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="hero-scroll-indicator" aria-hidden="true">
          <span style={{ fontSize: '11px', color: 'white', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: '600' }}>Scroll</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12l7 7 7-7"/>
          </svg>
        </div>

        {/* Bottom fade into page content */}
        <div className="hero-bottom-fade" aria-hidden="true" />

      </section>
      {/* ══════════════════════════════════════════════════════ */}
      {/* END HERO SECTION                                      */}
      {/* ══════════════════════════════════════════════════════ */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900">
            {t("Welcome back")}, {user?.first_name}!
          </h1>
          <p className="text-secondary-600 mt-2 text-sm sm:text-base">
            {t("Here's what's happening with your opportunities today.")}
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
                    {t("New Opportunities")}
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
                    {t("Pending Applications")}
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
                    {t("Success Rate")}
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
                    {t("Achievements")}
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
                    {t("Recommended for You")}
                  </h2>
                  <Button size="sm" variant="secondary" className="w-full sm:w-auto">
                    {t("View All")}
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="flex flex-col sm:flex-row sm:items-start sm:space-x-4 space-y-3 sm:space-y-0 p-3 sm:p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors overflow-hidden"
                    >
                      <div className="w-8 h-8 sm:w-12 sm:h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-4 h-4 sm:w-6 sm:h-6 text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[11px] sm:text-base font-semibold text-secondary-900 break-words leading-tight">
                          Google Summer Internship Program
                        </h3>
                        <p className="text-[10px] sm:text-sm text-secondary-600 mt-0.5 break-words leading-tight">
                          Software Engineering Internship at Google
                        </p>
                        <div className="flex flex-wrap items-center mt-1 sm:mt-2 gap-1">
                          <Badge variant="primary" className="text-[9px] sm:text-xs">Technology</Badge>
                          <Badge variant="success" className="text-[9px] sm:text-xs">Remote</Badge>
                          <span className="text-[9px] sm:text-xs text-secondary-500">Due in 5 days</span>
                        </div>
                      </div>
                      <Button size="sm" className="w-full sm:w-auto text-xs sm:text-sm">{t("Apply Now")}</Button>
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
                  {t("Quick Actions")}
                </h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  <Button className="w-full justify-start text-sm sm:text-base" variant="secondary">
                    <Search className="w-4 h-4 mr-2" />
                    {t("Find Opportunities")}
                  </Button>
                  <Button className="w-full justify-start text-sm sm:text-base" variant="secondary">
                    <Users className="w-4 h-4 mr-2" />
                    {t("Find a Mentor")}
                  </Button>
                  <Button className="w-full justify-start text-sm sm:text-base" variant="secondary">
                    <Target className="w-4 h-4 mr-2" />
                    {t("Track Applications")}
                  </Button>
                  <Button className="w-full justify-start text-sm sm:text-base" variant="secondary">
                    <BookOpen className="w-4 h-4 mr-2" />
                    {t("Browse Resources")}
                  </Button>
                </div>
              </CardBody>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <h3 className="text-base sm:text-lg font-semibold text-secondary-900">
                  {t("Recent Activity")}
                </h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  <div className="text-xs sm:text-sm">
                    <p className="text-secondary-600">
                      {t("Applied to")}{" "}
                      <span className="font-medium text-secondary-900">
                        Microsoft Internship
                      </span>
                    </p>
                    <p className="text-xs text-secondary-500">2 hours ago</p>
                  </div>
                  <div className="text-xs sm:text-sm">
                    <p className="text-secondary-600">
                      {t("Saved")}{" "}
                      <span className="font-medium text-secondary-900">
                        Tesla Engineering Role
                      </span>
                    </p>
                    <p className="text-xs text-secondary-500">1 day ago</p>
                  </div>
                  <div className="text-xs sm:text-sm">
                    <p className="text-secondary-600">
                      {t("Completed profile setup")}
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
                  {t("Profile Completion")}
                </h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span>{t("Profile Progress")}</span>
                    <span className="font-medium">75%</span>
                  </div>
                  <div className="w-full bg-secondary-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: "75%" }}
                    ></div>
                  </div>
                  <div className="text-xs sm:text-sm text-secondary-600">
                    <p>{t("Add work experience to improve your profile")}</p>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => navigate("/profile")}
                  >
                    {t("Complete Profile")}
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
