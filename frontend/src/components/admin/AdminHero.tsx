import React from 'react';

interface AdminHeroProps {
  title: string;
  subtitle: string;
  badge?: string | number;
  variant?: 'default' | 'rounded' | 'wave' | 'sharp' | 'mixed';
}

export const AdminHero: React.FC<AdminHeroProps> = ({ title, subtitle, badge, variant = 'default' }) => {
  const borderStyles = {
    default: 'rounded-b-3xl',
    rounded: 'rounded-b-[40px]',
    wave: 'rounded-b-[50px_20px]',
    sharp: 'rounded-b-lg',
    mixed: 'rounded-bl-[60px] rounded-br-2xl',
  };

  return (
    <div className={`relative h-40 sm:h-48 mb-6 overflow-hidden ${borderStyles[variant]}`}>
      {/* Animated Background Pattern with Blur */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a8a] via-[#1e40af] to-[#2563eb] backdrop-blur-sm">
        {/* Slanted Lines Pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-80" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="slant-lines" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
              {/* Hexagon shapes */}
              <path d="M30,10 L50,0 L70,10 L70,30 L50,40 L30,30 Z" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5"/>
              <path d="M90,10 L110,0 L130,10 L130,30 L110,40 L90,30 Z" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5"/>
              <path d="M30,70 L50,60 L70,70 L70,90 L50,100 L30,90 Z" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5"/>
            </pattern>
            <filter id="blur-effect">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
            </filter>
          </defs>
          <rect width="100%" height="100%" fill="url(#slant-lines)" filter="url(#blur-effect)" />
        </svg>

        {/* Animated Red Slant Stripe with Blur */}
        <div 
          className="absolute top-0 right-0 w-1/3 h-full opacity-90"
          style={{
            background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
            transform: 'skewX(-15deg) translateX(20%)',
            boxShadow: '-10px 0 30px rgba(220, 38, 38, 0.3)',
            filter: 'blur(0.5px)',
          }}
        />

        {/* Additional accent lines with blur */}
        <div 
          className="absolute top-0 right-[28%] w-1 h-full opacity-40"
          style={{
            background: 'linear-gradient(180deg, transparent, #fff, transparent)',
            transform: 'skewX(-15deg)',
            filter: 'blur(0.3px)',
          }}
        />
        <div 
          className="absolute top-0 right-[35%] w-0.5 h-full opacity-20"
          style={{
            background: 'linear-gradient(180deg, transparent, #fff, transparent)',
            transform: 'skewX(-15deg)',
            filter: 'blur(0.2px)',
          }}
        />

        {/* Dot pattern overlay with blur */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            filter: 'blur(0.4px)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-center px-4 sm:px-6 lg:px-8 z-10">
        <h1 className="text-lg sm:text-2xl md:text-4xl font-bold text-white mb-1 sm:mb-2 drop-shadow-lg leading-tight">
          {title}
          {badge !== undefined && (
            <span className="ml-2 sm:ml-3 inline-block bg-emerald-500 text-white rounded-lg sm:rounded-xl px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-semibold">
              {badge}
            </span>
          )}
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-white/95 drop-shadow-md leading-snug">
          {subtitle}
        </p>
      </div>
    </div>
  );
};
