import React from "react";
import { Layout } from "../components/layout";
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin, MessageSquare, Send } from "lucide-react";

export const ContactUsPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white py-6 xs:py-8 sm:py-12 lg:py-16 xl:py-20 relative overflow-x-hidden">
        {/* Animated dotted background */}
        <div className="absolute inset-0 opacity-35 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, rgba(59, 130, 246, 0.5) 1.5px, transparent 1.5px)',
          backgroundSize: '20px 20px',
          animation: 'moveDots 20s linear infinite'
        }}></div>

        <div className="max-w-4xl mx-auto px-2 xs:px-3 sm:px-4 lg:px-6 xl:px-8 relative z-10">
          {/* Header */}
          <div className="text-center mb-6 xs:mb-8 sm:mb-10 lg:mb-16 xl:mb-20">
            <div className="flex justify-center mb-3 xs:mb-4 sm:mb-5 lg:mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl xs:rounded-2xl">
                <MessageSquare className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
              </div>
            </div>
            <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-secondary-900 mb-2 xs:mb-3 sm:mb-4">
              Contact Us
            </h1>
            <p className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl text-secondary-600 px-2">
              We're here to help! Reach out with any questions or feedback
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 xs:gap-5 sm:gap-6 lg:gap-8">
            {/* Contact Form */}
            <div className="bg-white rounded-lg xs:rounded-xl sm:rounded-2xl shadow-lg p-3 xs:p-4 sm:p-6 lg:p-8">
              <h2 className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-secondary-900 mb-3 xs:mb-4 sm:mb-5 lg:mb-6 text-center">
                Send us a Message
              </h2>
              <form className="space-y-3 xs:space-y-4 sm:space-y-5 lg:space-y-6">
                <div>
                  <label className="block text-[10px] xs:text-xs sm:text-sm font-medium text-secondary-700 mb-1 xs:mb-1.5 sm:mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-2.5 lg:py-3 text-[10px] xs:text-xs sm:text-sm md:text-base border border-neutral-300 rounded-md xs:rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-[10px] xs:text-xs sm:text-sm font-medium text-secondary-700 mb-1 xs:mb-1.5 sm:mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-2.5 lg:py-3 text-[10px] xs:text-xs sm:text-sm md:text-base border border-neutral-300 rounded-md xs:rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-[10px] xs:text-xs sm:text-sm font-medium text-secondary-700 mb-1 xs:mb-1.5 sm:mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    className="w-full px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-2.5 lg:py-3 text-[10px] xs:text-xs sm:text-sm md:text-base border border-neutral-300 rounded-md xs:rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="How can we help?"
                  />
                </div>
                <div>
                  <label className="block text-[10px] xs:text-xs sm:text-sm font-medium text-secondary-700 mb-1 xs:mb-1.5 sm:mb-2">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-2.5 lg:py-3 text-[10px] xs:text-xs sm:text-sm md:text-base border border-neutral-300 rounded-md xs:rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Tell us more..."
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center px-3 xs:px-4 sm:px-5 lg:px-6 py-1.5 xs:py-2 sm:py-2.5 lg:py-3 bg-primary-600 text-white font-semibold rounded-md xs:rounded-lg hover:bg-primary-700 transition-colors text-[10px] xs:text-xs sm:text-sm md:text-base"
                >
                  <Send className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 mr-1 xs:mr-1.5 sm:mr-2" />
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-3 xs:space-y-4 sm:space-y-5 lg:space-y-6">
              <div className="bg-white rounded-lg xs:rounded-xl sm:rounded-2xl shadow-lg p-3 xs:p-4 sm:p-6 lg:p-8">
                <h2 className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-secondary-900 mb-3 xs:mb-4 sm:mb-5 lg:mb-6 text-center">
                  Get in Touch
                </h2>
                <div className="space-y-3 xs:space-y-4 sm:space-y-5 lg:space-y-6">
                  <div className="flex items-start">
                    <div className="w-10 h-10 xs:w-12 xs:h-12 bg-primary-100 rounded-lg xs:rounded-xl flex items-center justify-center mr-3 xs:mr-4 flex-shrink-0">
                      <Mail className="w-5 h-5 xs:w-6 xs:h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-secondary-900 mb-1 text-xs xs:text-sm sm:text-base">{t('Email')}</h3>
                      <p className="text-secondary-600 text-[10px] xs:text-xs sm:text-sm">{t('support@bebrivus.com')}</p>
                      <p className="text-secondary-600 text-[10px] xs:text-xs sm:text-sm">{t('partnerships@bebrivus.com')}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-10 h-10 xs:w-12 xs:h-12 bg-success-100 rounded-lg xs:rounded-xl flex items-center justify-center mr-3 xs:mr-4 flex-shrink-0">
                      <Phone className="w-5 h-5 xs:w-6 xs:h-6 text-success-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-secondary-900 mb-1 text-xs xs:text-sm sm:text-base">{t('Phone')}</h3>
                      <p className="text-secondary-600 text-[10px] xs:text-xs sm:text-sm"><a href="tel:+250798619967" className="hover:text-primary-600">{t('+250 798 619 967')}</a></p>
                      <p className="text-secondary-500 text-[9px] xs:text-[10px] sm:text-xs">{t('Mon-Fri, 8am-5pm CAT')}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-10 h-10 xs:w-12 xs:h-12 bg-warning-100 rounded-lg xs:rounded-xl flex items-center justify-center mr-3 xs:mr-4 flex-shrink-0">
                      <MapPin className="w-5 h-5 xs:w-6 xs:h-6 text-warning-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-secondary-900 mb-1 text-xs xs:text-sm sm:text-base">{t('Address')}</h3>
                      <p className="text-secondary-600 text-[10px] xs:text-xs sm:text-sm">
                        beBrivus Inc.<br />
                        KG 11 Ave<br />
                        Kigali, Rwanda
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg xs:rounded-xl sm:rounded-2xl p-4 xs:p-5 sm:p-6 lg:p-8 text-white text-center">
                <h3 className="text-sm xs:text-base sm:text-lg md:text-xl font-bold mb-2 xs:mb-3">
                  Looking for Support?
                </h3>
                <p className="text-primary-100 mb-3 xs:mb-4 sm:mb-5 lg:mb-6 text-[10px] xs:text-xs sm:text-sm md:text-base">
                  Check out our Help Center for instant answers to common questions.
                </p>
                <a
                  href="/help-center"
                  className="inline-block px-3 xs:px-4 sm:px-5 lg:px-6 py-1.5 xs:py-2 sm:py-2.5 lg:py-3 bg-white text-primary-600 font-semibold rounded-md xs:rounded-lg hover:bg-primary-50 transition-colors text-[10px] xs:text-xs sm:text-sm md:text-base"
                >
                  Visit Help Center
                </a>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-secondary-900 mb-3">
                  Response Time
                </h3>
                <p className="text-secondary-700">
                  We typically respond to all inquiries within 24-48 hours during business days. For urgent matters, please call us directly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
