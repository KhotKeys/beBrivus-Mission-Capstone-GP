import React from "react";
import { Layout } from "../components/layout";
import { Cookie, Settings, Eye, BarChart3, Shield, CheckCircle } from "lucide-react";

export const CookiePolicyPage: React.FC = () => {
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
          <div className="text-center mb-6 xs:mb-8 sm:mb-10 lg:mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-warning-500 to-warning-600 rounded-xl xs:rounded-2xl mb-3 xs:mb-4 sm:mb-5 lg:mb-6">
              <Cookie className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
            </div>
            <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-secondary-900 mb-2 xs:mb-3 sm:mb-4">
              Cookie Policy
            </h1>
            <p className="text-xs xs:text-sm sm:text-base lg:text-lg text-secondary-600">
              Last Updated: January 26, 2026
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg xs:rounded-xl sm:rounded-2xl shadow-lg p-3 xs:p-4 sm:p-6 md:p-8 lg:p-12 space-y-4 xs:space-y-5 sm:space-y-6 lg:space-y-8 text-left">
            {/* Introduction */}
            <section>
              <p className="text-[10px] xs:text-xs sm:text-sm md:text-base text-secondary-700 leading-relaxed">
                This Cookie Policy explains how beBrivus uses cookies and browser storage technologies when you visit our platform. By using beBrivus, you consent to the use of these technologies as described in this policy.
              </p>
            </section>

            {/* What Are Cookies */}
            <section>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mr-4">
                  <Cookie className="w-6 h-6 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-secondary-900">
                  What Are Cookies?
                </h2>
              </div>
              
              <div className="space-y-4 ml-0 sm:ml-16">
                <p className="text-secondary-700">
                  Cookies are small text files stored on your device (computer, tablet, or mobile phone) when you visit a website. They help websites remember your preferences, authenticate your identity, and improve your browsing experience.
                </p>

                <p className="text-secondary-700">
                  Cookies can be "persistent" (remain on your device until deleted or expired) or "session" (deleted when you close your browser).
                </p>
              </div>
            </section>

            {/* What We Actually Use */}
            <section>
              <h2 className="text-2xl font-bold text-secondary-900 mb-6">
                What We Actually Use
              </h2>
              
              <div className="space-y-6">
                {/* Essential Session Cookies */}
                <div className="bg-success-50 border-l-4 border-success-500 p-6 rounded-lg">
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-success-500 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-success-900 mb-2">
                        1. Essential Session Cookies (Required)
                      </h3>
                      <p className="text-success-800 mb-3">
                        Our Django backend automatically sets session cookies that are necessary for the platform to function. These cookies:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-success-800">
                        <li>Maintain your login session on the server side</li>
                        <li>Enable security features and CSRF protection</li>
                        <li>Are deleted when you close your browser (session cookies)</li>
                        <li>Cannot be disabled as they are required for core functionality</li>
                      </ul>
                      <div className="mt-3 inline-flex items-center text-success-700 font-semibold">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Cannot be disabled
                      </div>
                    </div>
                  </div>
                </div>

                {/* Browser Local Storage */}
                <div className="bg-primary-50 border-l-4 border-primary-500 p-6 rounded-lg">
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                      <Settings className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-primary-900 mb-2">
                        2. Browser Local Storage (Not Cookies)
                      </h3>
                      <p className="text-primary-800 mb-3">
                        We use your browser's localStorage (NOT cookies) to store:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-primary-800">
                        <li><strong>Authentication tokens:</strong> JWT access and refresh tokens for keeping you logged in</li>
                        <li><strong>User profile data:</strong> Cached copy of your profile information for faster loading</li>
                        <li><strong>Language preference:</strong> Your selected language (stored as 'bebrivus_language')</li>
                        <li><strong>Analytics data:</strong> Registration and resource upload tracking</li>
                      </ul>
                      <div className="mt-3 bg-primary-100 p-3 rounded">
                        <p className="text-primary-900 text-sm font-semibold mb-1">Important Note:</p>
                        <p className="text-primary-800 text-sm">
                          localStorage is different from cookies. It persists until you manually clear your browser data or log out. You can clear it through your browser settings.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* What We DON'T Use */}
                <div className="bg-neutral-50 border-l-4 border-neutral-500 p-6 rounded-lg">
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-neutral-500 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                      <Eye className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                        3. What We DON'T Use
                      </h3>
                      <p className="text-neutral-800 mb-3">
                        To be completely transparent, we do NOT currently use:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-neutral-800">
                        <li>❌ Google Analytics or any analytics cookies</li>
                        <li>❌ Mixpanel, Hotjar, or similar tracking tools</li>
                        <li>❌ Facebook Pixel, Google Ads, or marketing cookies</li>
                        <li>❌ LinkedIn Insight Tag or social media tracking</li>
                        <li>❌ Third-party advertising or retargeting cookies</li>
                        <li>❌ Web beacons or tracking pixels</li>
                        <li>❌ Device fingerprinting</li>
                        <li>❌ Session replay tools</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* IP Address and User Agent Collection */}
            <section>
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                IP Address and Browser Information
              </h2>
              
              <div className="space-y-4">
                <p className="text-secondary-700">
                  For security and analytics purposes, we collect:
                </p>

                <div className="space-y-3">
                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-secondary-900 mb-2">IP Addresses</h3>
                    <p className="text-secondary-700">
                      We collect your IP address when you view forum discussions, opportunities, and resources. This helps us prevent abuse and understand geographic usage patterns.
                    </p>
                  </div>

                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-secondary-900 mb-2">Browser and Device Information</h3>
                    <p className="text-secondary-700">
                      We collect your browser type and device information (user agent string) to ensure compatibility and improve the user experience across different devices.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Managing Cookies */}
            <section>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center mr-4">
                  <Settings className="w-6 h-6 text-success-600" />
                </div>
                <h2 className="text-2xl font-bold text-secondary-900">
                  How to Manage Cookies
                </h2>
              </div>
              
              <div className="space-y-4 ml-0 sm:ml-16">
                <p className="text-secondary-700">
                  You have several options to manage or disable cookies:
                </p>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                      1. Browser Settings
                    </h3>
                    <p className="text-secondary-700 mb-2">
                      Most browsers allow you to control cookies through their settings:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-secondary-700">
                      <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">Google Chrome</a></li>
                      <li><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">Mozilla Firefox</a></li>
                      <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">Safari</a></li>
                      <li><a href="https://support.microsoft.com/en-us/windows/microsoft-edge-browsing-data-and-privacy-bb8174ba-9d73-dcf2-9b4a-c582b4e640dd" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">Microsoft Edge</a></li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                      2. Clear Browser Local Storage
                    </h3>
                    <p className="text-secondary-700">
                      To clear authentication tokens and cached data, you can clear your browser's localStorage through your browser's developer tools or by logging out of beBrivus.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                      3. Account Deletion
                    </h3>
                    <p className="text-secondary-700">
                      If you want to permanently remove all your data from beBrivus, you can delete your account through your profile settings. This will clear all stored data including localStorage items.
                    </p>
                  </div>
                </div>

                <div className="bg-warning-50 border border-warning-200 p-4 rounded-lg mt-4">
                  <p className="text-warning-900 font-semibold mb-2">
                    ⚠️ Important Note:
                  </p>
                  <p className="text-warning-800">
                    Disabling session cookies will prevent you from logging in and using beBrivus. Clearing localStorage will log you out and remove your language preference.
                  </p>
                </div>
              </div>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                Data Retention
              </h2>
              
              <div className="space-y-4">
                <p className="text-secondary-700">
                  Here's how long we retain different types of data:
                </p>

                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-neutral-200 rounded-lg">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-secondary-900 border-b">Data Type</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-secondary-900 border-b">Retention Period</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      <tr>
                        <td className="px-6 py-4 text-secondary-700">Session Cookies (Django)</td>
                        <td className="px-6 py-4 text-secondary-700">Deleted when browser closes</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-secondary-700">JWT Access Token (localStorage)</td>
                        <td className="px-6 py-4 text-secondary-700">1 hour (then auto-refreshed)</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-secondary-700">JWT Refresh Token (localStorage)</td>
                        <td className="px-6 py-4 text-secondary-700">30 days</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-secondary-700">User Profile Cache (localStorage)</td>
                        <td className="px-6 py-4 text-secondary-700">Until logout or manual clear</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-secondary-700">Language Preference (localStorage)</td>
                        <td className="px-6 py-4 text-secondary-700">Until manual clear</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Changes to Cookie Policy */}
            <section>
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                Changes to This Cookie Policy
              </h2>
              
              <p className="text-secondary-700">
                We may update this Cookie Policy periodically to reflect changes in our practices or legal requirements. We will notify you of material changes by posting the updated policy on our platform and updating the "Last Updated" date. We encourage you to review this policy regularly.
              </p>
            </section>

            {/* Contact Information */}
            <section className="bg-warning-50 rounded-lg xs:rounded-xl p-3 xs:p-4 sm:p-5 lg:p-6">
              <h2 className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-secondary-900 mb-3 xs:mb-4 text-left">
                Questions About Cookies?
              </h2>
              
              <div className="space-y-2 xs:space-y-2.5 sm:space-y-3 text-secondary-700 text-left">
                <p className="text-[10px] xs:text-xs sm:text-sm md:text-base">
                  If you have questions about our use of cookies or this policy, please contact us:
                </p>
                <ul className="space-y-1 xs:space-y-1.5 sm:space-y-2 text-[9px] xs:text-[10px] sm:text-xs md:text-sm">
                  <li><strong>Email:</strong> <a href="mailto:privacy@bebrivus.com" className="text-primary-600 hover:text-primary-700">privacy@bebrivus.com</a></li>
                  <li><strong>Address:</strong> beBrivus Inc., KG 11 Ave, Kigali, Rwanda</li>
                  <li><strong>Phone:</strong> <a href="tel:+250798619967" className="text-primary-600 hover:text-primary-700">+250 798 619 967</a></li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};
