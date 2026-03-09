import React from 'react';

interface MentorHeroProps {
  title: string;
  subtitle?: string;
  badge?: string;
  variant?: 'default' | 'rounded' | 'wave' | 'sharp' | 'mixed';
}

export const MentorHero: React.FC<MentorHeroProps> = ({
  title,
  subtitle,
  badge,
  variant = 'default'
}) => {
  const getBorderRadius = () => {
    switch (variant) {
      case 'rounded':
        return 'rounded-b-3xl';
      case 'wave':
        return 'rounded-b-[40px]';
      case 'sharp':
        return 'rounded-b-[50px_20px]';
      case 'mixed':
        return 'rounded-bl-[60px] rounded-br-2xl';
      default:
        return 'rounded-b-2xl';
    }
  };

  return (
    <div className={`relative bg-gradient-to-r from-[#7c3aed] via-[#8b5cf6] to-[#a78bfa] text-white overflow-hidden ${getBorderRadius()}`}>
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="mentor-hexagons" x="0" y="0" width="50" height="43.4" patternUnits="userSpaceOnUse">
              <polygon
                points="25,0 50,14.43 50,28.87 25,43.3 0,28.87 0,14.43"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                style={{ filter: 'blur(1.5px)' }}
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#mentor-hexagons)" />
        </svg>
      </div>

      <div
        className="absolute top-0 right-0 w-64 h-full bg-gradient-to-br from-[#6d28d9] to-[#5b21b6] transform skew-x-12 translate-x-32 opacity-30"
        style={{ filter: 'blur(0.5px)' }}
      />

      <div className="absolute top-8 left-0 w-32 h-0.5 bg-white/20" style={{ filter: 'blur(0.3px)' }} />
      <div className="absolute top-12 left-0 w-24 h-0.5 bg-white/15" style={{ filter: 'blur(0.2px)' }} />
      <div className="absolute bottom-8 right-0 w-40 h-0.5 bg-white/20" style={{ filter: 'blur(0.3px)' }} />

      <div className="absolute inset-0 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            filter: 'blur(0.4px)'
          }}
        />
      </div>

      <div className="relative px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs sm:text-sm md:text-base text-purple-100">
                  {subtitle}
                </p>
              )}
            </div>
            {badge && (
              <div className="hidden sm:flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                <span className="text-sm font-semibold">{badge}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
