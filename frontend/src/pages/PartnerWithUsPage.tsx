import React, { useState } from "react";
import { Layout } from "../components/layout";
import { 
  Target, 
  Users, 
  TrendingUp, 
  Globe, 
  Award,
  CheckCircle,
  Star,
  ArrowRight,
  Zap,
  Shield,
  BarChart3,
} from "lucide-react";

export const PartnerWithUsPage: React.FC = () => {
  const [selectedTier, setSelectedTier] = useState<'bronze' | 'silver' | 'gold' | 'platinum'>('gold');
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);

  const partnershipTiers = [
    {
      id: 'bronze',
      name: 'Bronze Partner',
      price: 'From $150/year',
      icon: Award,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-500',
      features: [
        'List up to 5 opportunities',
        'Access to candidate database',
        'Monthly performance reports',
        'Email support',
        'Standard listing visibility'
      ]
    },
    {
      id: 'silver',
      name: 'Silver Partner',
      price: 'From $200/year',
      icon: Star,
      color: 'from-gray-400 to-gray-500',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-400',
      features: [
        'List up to 15 opportunities',
        'Priority candidate matching',
        'Weekly analytics dashboard',
        'Priority email & chat support',
        'Enhanced listing visibility',
        'Co-marketing opportunities'
      ]
    },
    {
      id: 'gold',
      name: 'Gold Partner',
      price: 'From $400/year',
      icon: Star,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-500',
      popular: true,
      features: [
        'Unlimited opportunities',
        'AI-powered candidate matching',
        'Real-time analytics dashboard',
        '24/7 dedicated support',
        'Premium listing placement',
        'Sponsored content & webinars',
        'Custom integration solutions',
        'Quarterly strategy sessions'
      ]
    },
    {
      id: 'platinum',
      name: 'Platinum Partner',
      price: 'Custom pricing',
      icon: Zap,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-500',
      features: [
        'Everything in Gold, plus:',
        'Exclusive partnership manager',
        'Custom branded portal',
        'Advanced API access',
        'White-label solutions',
        'Joint research initiatives',
        'Executive briefings',
        'Global events & conferences'
      ]
    }
  ];

  const impactMetrics = [
    { icon: Globe, value: '15+', label: 'African Countries Reached', color: 'text-success-600' },
    { icon: Users, value: '2,400+', label: 'Students Supported', color: 'text-primary-600' },
    { icon: TrendingUp, value: '82%', label: 'Opportunity Match Rate', color: 'text-warning-600' },
    { icon: Award, value: '1,200+', label: 'Opportunities Listed', color: 'text-purple-600' }
  ];

  // Partnership Growth Data (2020-2026)
  const growthData = [
    { year: 2020, partners: 45, opportunities: 850, applications: 12000, placement: 68 },
    { year: 2021, partners: 98, opportunities: 1800, applications: 28000, placement: 74 },
    { year: 2022, partners: 175, opportunities: 3200, applications: 52000, placement: 79 },
    { year: 2023, partners: 285, opportunities: 5100, applications: 89000, placement: 82 },
    { year: 2024, partners: 410, opportunities: 7800, applications: 145000, placement: 85 },
    { year: 2025, partners: 500, opportunities: 10200, applications: 198000, placement: 88 }
  ];

  const maxPartners = Math.max(...growthData.map(d => d.partners));

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white relative overflow-x-hidden">
        {/* Animated dotted background */}
        <div className="absolute inset-0 opacity-35 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, rgba(59, 130, 246, 0.5) 1.5px, transparent 1.5px)',
          backgroundSize: '20px 20px',
          animation: 'moveDots 20s linear infinite'
        }}></div>

        <div className="relative z-10">
          {/* Hero Section */}
          <div
            className="relative text-white py-16 sm:py-20 lg:py-24"
            style={{
              backgroundImage: "url('/partnership.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="absolute inset-0 bg-slate-900/35" />
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12 flex flex-col items-center">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
                  Partner With beBrivus
                </h1>
                <p className="text-xl sm:text-2xl text-white/90 max-w-3xl mx-auto mb-8">
                  Collaborate to expand access to scholarships, internships, and mentorship across Africa.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <a
                    href="#tiers"
                    className="inline-flex items-center px-8 py-4 bg-white text-primary-700 font-semibold rounded-xl hover:bg-neutral-50 transition-all shadow-lg hover:shadow-xl"
                  >
                    View Partnership Tiers
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </a>
                  <a
                    href="#contact"
                    className="inline-flex items-center px-8 py-4 bg-white/15 text-white font-semibold rounded-xl hover:bg-white/25 transition-all border-2 border-white/30"
                  >
                    Schedule a Call
                  </a>
                </div>
              </div>

              {/* Impact Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-12 text-center">
                {impactMetrics.map((metric, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <metric.icon className="w-10 h-10 text-white mx-auto mb-3" />
                    <div className="text-3xl sm:text-4xl font-bold mb-1">{metric.value}</div>
                    <div className="text-sm sm:text-base text-white/80">{metric.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Partnership Growth Analytics Section */}
          <div className="bg-gradient-to-b from-white to-neutral-50 py-16 sm:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl mb-4">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-secondary-900 mb-4">
                  Our Growth Journey
                </h2>
                <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
                  6 years of exponential growth, connecting organizations with talented individuals worldwide
                </p>
              </div>

              {/* Professional Analytics Chart with Bars and Trend Lines */}
              <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl shadow-2xl p-8 md:p-12 mb-8 relative overflow-hidden border border-slate-200">
                {/* World Map Background */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                  <svg viewBox="0 0 1000 500" className="w-full h-full">
                    <path d="M150,100 Q200,80 250,100 T350,100 M400,150 L450,140 L500,160 M300,200 Q350,180 400,200 T500,200" 
                          stroke="currentColor" fill="none" strokeWidth="2" className="text-slate-400"/>
                    <circle cx="200" cy="120" r="3" fill="currentColor" className="text-slate-400"/>
                    <circle cx="450" cy="160" r="3" fill="currentColor" className="text-slate-400"/>
                    <circle cx="350" cy="200" r="3" fill="currentColor" className="text-slate-400"/>
                  </svg>
                </div>

                <div className="mb-8 relative z-10">
                  <div className="flex flex-wrap gap-6 justify-center">
                    <div className="flex items-center bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200">
                      <div className="w-3 h-8 bg-gradient-to-t from-slate-400 to-slate-600 rounded mr-2"></div>
                      <span className="text-sm font-semibold text-secondary-700">Organizations</span>
                    </div>
                    <div className="flex items-center bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200">
                      <div className="w-3 h-3 bg-primary-500 rounded-full mr-2"></div>
                      <span className="text-sm font-semibold text-secondary-700">Growth Trend</span>
                    </div>
                    <div className="flex items-center bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200">
                      <div className="w-3 h-3 bg-success-500 rounded-full mr-2"></div>
                      <span className="text-sm font-semibold text-secondary-700">Success Rate</span>
                    </div>
                  </div>
                </div>

                {/* Chart Container */}
                <div className="relative h-[450px] bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-200">
                  {/* Y-axis labels */}
                  <div className="absolute -left-2 top-6 h-[calc(100%-80px)] flex flex-col justify-between text-xs text-secondary-500 font-semibold">
                    <span>600</span>
                    <span>500</span>
                    <span>400</span>
                    <span>300</span>
                    <span>200</span>
                    <span>100</span>
                    <span>0</span>
                  </div>

                  {/* Grid lines */}
                  <div className="absolute left-12 right-6 top-6 h-[calc(100%-80px)] flex flex-col justify-between pointer-events-none">
                    {[...Array(7)].map((_, i) => (
                      <div key={i} className="border-t border-slate-200/60"></div>
                    ))}
                  </div>

                  {/* Main Chart Area */}
                  <div className="absolute left-12 right-6 top-6 bottom-20 flex items-end justify-between gap-2">
                    {growthData.map((d) => {
                      const barHeight = (d.partners / maxPartners) * 100;
                      const isHovered = hoveredYear === d.year;
                      
                      return (
                        <div 
                          key={d.year} 
                          className="relative flex-1 group cursor-pointer"
                          onMouseEnter={() => setHoveredYear(d.year)}
                          onMouseLeave={() => setHoveredYear(null)}
                        >
                          {/* Bar */}
                          <div 
                            className="relative w-full rounded-t-lg transition-all duration-300 shadow-lg"
                            style={{
                              height: `${barHeight}%`,
                              background: isHovered 
                                ? 'linear-gradient(to top, #1e40af, #3b82f6, #60a5fa)'
                                : 'linear-gradient(to top, #475569, #64748b, #94a3b8)'
                            }}
                          >
                            {/* Value label on bar */}
                            <div className={`absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-bold whitespace-nowrap transition-all duration-300 ${
                              isHovered ? 'text-primary-600 scale-110' : 'text-secondary-600'
                            }`}>
                              {d.partners}
                            </div>
                            
                            {/* Hover tooltip */}
                            {isHovered && (
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-12 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 min-w-[200px]">
                                  <div className="text-xs font-bold text-slate-300 mb-2">{d.year} Performance</div>
                                  <div className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                      <span className="text-xs text-slate-400">Organizations:</span>
                                      <span className="text-sm font-bold text-primary-400">{d.partners}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-xs text-slate-400">Opportunities:</span>
                                      <span className="text-sm font-bold text-success-400">{d.opportunities.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-xs text-slate-400">Applications:</span>
                                      <span className="text-sm font-bold text-warning-400">{(d.applications / 1000).toFixed(0)}K</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-xs text-slate-400">Success Rate:</span>
                                      <span className="text-sm font-bold text-purple-400">{d.placement}%</span>
                                    </div>
                                  </div>
                                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Year label */}
                          <div className={`absolute -bottom-14 left-1/2 -translate-x-1/2 text-xs font-semibold transition-colors ${
                            isHovered ? 'text-primary-600' : 'text-secondary-500'
                          }`}>
                            {d.year}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Trend Lines Overlay */}
                  <svg className="absolute left-12 right-6 top-6 bottom-20 w-[calc(100%-72px)] h-[calc(100%-104px)] pointer-events-none" style={{ zIndex: 20 }}>
                    <defs>
                      <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgba(59, 130, 246, 0.8)" />
                        <stop offset="100%" stopColor="rgba(37, 99, 235, 0.8)" />
                      </linearGradient>
                      <linearGradient id="successGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgba(34, 197, 94, 0.8)" />
                        <stop offset="100%" stopColor="rgba(22, 163, 74, 0.8)" />
                      </linearGradient>
                      <filter id="shadow">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
                      </filter>
                    </defs>

                    {/* Main Growth Trend Line */}
                    <polyline
                      points={growthData.map((d, i) => {
                        const x = (i / (growthData.length - 1)) * 100;
                        const y = 100 - (d.partners / maxPartners) * 100;
                        return `${x}%,${y}%`;
                      }).join(' ')}
                      fill="none"
                      stroke="url(#primaryGradient)"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-all duration-300"
                      style={{ filter: 'url(#shadow)' }}
                    />

                    {/* Success Rate Trend Line */}
                    <polyline
                      points={growthData.map((d, i) => {
                        const x = (i / (growthData.length - 1)) * 100;
                        const y = 100 - ((d.placement - 60) / 30) * 100;
                        return `${x}%,${y}%`;
                      }).join(' ')}
                      fill="none"
                      stroke="url(#successGradient)"
                      strokeWidth="3"
                      strokeDasharray="8,4"
                      strokeLinecap="round"
                      className="transition-all duration-300"
                      style={{ filter: 'url(#shadow)' }}
                    />

                    {/* Data Point Circles on Main Line */}
                    {growthData.map((d, i) => {
                      const x = (i / (growthData.length - 1)) * 100;
                      const y = 100 - (d.partners / maxPartners) * 100;
                      const isHovered = hoveredYear === d.year;
                      
                      return (
                        <g key={i}>
                          <circle
                            cx={`${x}%`}
                            cy={`${y}%`}
                            r={isHovered ? "8" : "6"}
                            fill="white"
                            stroke="rgb(59, 130, 246)"
                            strokeWidth="3"
                            className="transition-all duration-200"
                            style={{ filter: 'url(#shadow)' }}
                          />
                          <circle
                            cx={`${x}%`}
                            cy={`${y}%`}
                            r="3"
                            fill="rgb(59, 130, 246)"
                            className="transition-all duration-200"
                          />
                        </g>
                      );
                    })}

                    {/* Upward Arrow Indicator */}
                    <g transform="translate(90%, 10%)">
                      <path 
                        d="M0,20 L0,0 M0,0 L-5,5 M0,0 L5,5" 
                        stroke="rgb(59, 130, 246)" 
                        strokeWidth="3" 
                        fill="none" 
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="0" cy="25" r="2" fill="rgb(59, 130, 246)"/>
                      <circle cx="0" cy="32" r="2" fill="rgb(59, 130, 246)"/>
                      <circle cx="0" cy="39" r="2" fill="rgb(59, 130, 246)"/>
                    </g>
                  </svg>
                </div>
              </div>

              {/* Key Insights */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-6 border border-primary-200">
                  <div className="flex items-center justify-between mb-4">
                    <TrendingUp className="w-10 h-10 text-primary-600" />
                    <span className="text-3xl font-bold text-primary-900">1011%</span>
                  </div>
                  <h3 className="font-semibold text-primary-900 mb-2">Organization Growth</h3>
                  <p className="text-sm text-primary-700">From 45 to 500+ organizations in 5 years, demonstrating consistent trust and value delivery</p>
                </div>

                <div className="bg-gradient-to-br from-success-50 to-success-100 rounded-2xl p-6 border border-success-200">
                  <div className="flex items-center justify-between mb-4">
                    <BarChart3 className="w-10 h-10 text-success-600" />
                    <span className="text-3xl font-bold text-success-900">1100%</span>
                  </div>
                  <h3 className="font-semibold text-success-900 mb-2">Opportunities Listed</h3>
                  <p className="text-sm text-success-700">From 850 to 10,200+ opportunities, expanding access to global programs</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                  <div className="flex items-center justify-between mb-4">
                    <Award className="w-10 h-10 text-purple-600" />
                    <span className="text-3xl font-bold text-purple-900">88%</span>
                  </div>
                  <h3 className="font-semibold text-purple-900 mb-2">Placement Success Rate</h3>
                  <p className="text-sm text-purple-700">Improved from 68% to 88% through AI-powered matching and dedicated support</p>
                </div>
              </div>
            </div>
          </div>

          {/* Partnership Tiers Section */}
          <div id="tiers" className="bg-gradient-to-b from-neutral-50 to-white py-16 sm:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-secondary-900 mb-4">
                  Partnership Tiers
                </h2>
                <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
                  Choose the partnership level that best fits your organization's needs and goals
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {partnershipTiers.map((tier) => (
                  <div
                    key={tier.id}
                    onClick={() => setSelectedTier(tier.id as any)}
                    className={`relative cursor-pointer transition-all ${
                      selectedTier === tier.id 
                        ? 'ring-4 ring-primary-500 shadow-2xl scale-105' 
                        : 'hover:shadow-lg'
                    }`}
                  >
                    {tier.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                        <span className="inline-flex items-center px-4 py-1 bg-primary-600 text-white text-sm font-semibold rounded-full shadow-lg">
                          <Star className="w-4 h-4 mr-1" /> Most Popular
                        </span>
                      </div>
                    )}
                    <div className="bg-white rounded-2xl p-6 h-full border-2 border-neutral-200">
                      <div className={`w-14 h-14 bg-gradient-to-br ${tier.color} rounded-xl flex items-center justify-center mb-4`}>
                        <tier.icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-secondary-900 mb-2">
                        {tier.name}
                      </h3>
                      <p className="text-primary-600 font-bold text-xl mb-6">
                        {tier.price}
                      </p>
                      <ul className="space-y-3">
                        {tier.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start text-sm text-secondary-700">
                            <CheckCircle className="w-5 h-5 text-success-600 mr-2 flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              {/* Additional Benefits */}
              <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-success-500 to-success-600 rounded-xl flex items-center justify-center mr-4">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-secondary-900">
                    All Partners Receive
                  </h3>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="flex items-start">
                    <BarChart3 className="w-6 h-6 text-primary-600 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-secondary-900 mb-1">Advanced Analytics</h4>
                      <p className="text-sm text-secondary-600">Track applications, engagement, and ROI in real-time</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Target className="w-6 h-6 text-primary-600 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-secondary-900 mb-1">Smart Targeting</h4>
                      <p className="text-sm text-secondary-600">Reach candidates matching your specific criteria</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Zap className="w-6 h-6 text-primary-600 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-secondary-900 mb-1">Dedicated Support</h4>
                      <p className="text-sm text-secondary-600">Expert assistance from our partnerships team</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
