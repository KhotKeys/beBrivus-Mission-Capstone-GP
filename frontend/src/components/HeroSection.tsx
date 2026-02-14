import React from "react";

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  showZigZag?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  backgroundImage = "/education.jpeg",
  backgroundVideo,
  showZigZag = false,
}) => {
  return (
    <section className="relative py-16 sm:py-20 lg:py-24 text-white overflow-hidden min-h-[320px] sm:min-h-[400px]">
      {backgroundVideo ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster={backgroundImage}
          aria-hidden="true"
        >
          <source src={backgroundVideo} type="video/mp4" />
        </video>
      ) : (
        <div
          className="absolute inset-0 bg-cover bg-center sm:bg-bottom bg-no-repeat"
          style={{
            backgroundImage: `url('${backgroundImage}')`,
          }}
          aria-hidden="true"
        />
      )}

      {/* Creative Blur & Mesh Overlay Layer */}
      <div
        className="absolute inset-0 opacity-60 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 20%, rgba(34, 197, 94, 0.08) 0%, transparent 50%)
          `,
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
        }}
      ></div>

      {/* Enhanced Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-black/40 pointer-events-none"></div>

      {showZigZag && (
        <svg
          className="absolute inset-0 w-full h-full opacity-60 pointer-events-none"
          viewBox="0 0 1200 400"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <polyline
            points="0,110 80,70 160,110 240,70 320,110 400,70 480,110 560,70 640,110 720,70 800,110 880,70 960,110 1040,70 1120,110 1200,70"
            fill="none"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth="2"
          />
          <polyline
            points="0,230 100,190 200,230 300,190 400,230 500,190 600,230 700,190 800,230 900,190 1000,230 1100,190 1200,230"
            fill="none"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="2"
          />
          <polyline
            points="0,320 90,280 180,320 270,280 360,320 450,280 540,320 630,280 720,320 810,280 900,320 990,280 1080,320 1170,280"
            fill="none"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="1.5"
          />
        </svg>
      )}

      {/* Decorative Elements for Creativity */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center text-center min-h-80">
        <div>
          <h1 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight font-display">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm sm:text-lg md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
