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
                This Cookie Policy explains how beBrivus uses cookies and similar tracking technologies when you visit our platform. By using beBrivus, you consent to the use of cookies as described in this policy.
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

            {/* Types of Cookies We Use */}
            <section>
              <h2 className="text-2xl font-bold text-secondary-900 mb-6">
                Types of Cookies We Use
              </h2>
              
              <div className="space-y-6">
                {/* Essential Cookies */}
                <div className="bg-success-50 border-l-4 border-success-500 p-6 rounded-lg">
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-success-500 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-success-900 mb-2">
                        1. Essential Cookies (Required)
                      </h3>
                      <p className="text-success-800 mb-3">
                        These cookies are necessary for the platform to function and cannot be disabled. They enable core functionality such as:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-success-800">
                        <li>User authentication and login sessions</li>
                        <li>Security and fraud prevention</li>
                        <li>Load balancing and platform performance</li>
                        <li>Remember your cookie preferences</li>
                      </ul>
                      <div className="mt-3 inline-flex items-center text-success-700 font-semibold">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Cannot be disabled
                      </div>
                    </div>
                  </div>
                </div>

                {/* Functional Cookies */}
                <div className="bg-primary-50 border-l-4 border-primary-500 p-6 rounded-lg">
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                      <Settings className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-primary-900 mb-2">
                        2. Functional Cookies (Optional)
                      </h3>
                      <p className="text-primary-800 mb-3">
                        These cookies enhance your experience by remembering your preferences and settings:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-primary-800">
                        <li>Language and region preferences</li>
                        <li>Display settings and customization</li>
                        <li>Filter and search preferences</li>
                        <li>Recently viewed opportunities</li>
                        <li>Notification preferences</li>
                      </ul>
                      <div className="mt-3 inline-flex items-center text-primary-700 font-semibold">
                        <Settings className="w-4 h-4 mr-2" />
                        Can be managed in settings
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="bg-secondary-50 border-l-4 border-secondary-500 p-6 rounded-lg">
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-secondary-500 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                        3. Analytics and Performance Cookies (Optional)
                      </h3>
                      <p className="text-secondary-800 mb-3">
                        These cookies help us understand how users interact with our platform and identify areas for improvement:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-secondary-800">
                        <li>Page views and navigation patterns</li>
                        <li>Time spent on pages and features</li>
                        <li>Click tracking and user behavior analysis</li>
                        <li>Error reporting and debugging</li>
                        <li>Performance metrics and load times</li>
                      </ul>
                      <div className="mt-3 space-y-1">
                        <p className="text-secondary-700 font-semibold">
                          Third-party analytics providers we use:
                        </p>
                        <ul className="list-disc list-inside text-secondary-700">
                          <li>Google Analytics</li>
                          <li>Mixpanel</li>
                          <li>Hotjar</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Marketing Cookies */}
                <div className="bg-warning-50 border-l-4 border-warning-500 p-6 rounded-lg">
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-warning-500 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                      <Eye className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-warning-900 mb-2">
                        4. Marketing and Targeting Cookies (Optional)
                      </h3>
                      <p className="text-warning-800 mb-3">
                        These cookies track your browsing activity to deliver personalized content and advertisements:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-warning-800">
                        <li>Personalized opportunity recommendations</li>
                        <li>Retargeting and remarketing campaigns</li>
                        <li>Social media integration and sharing</li>
                        <li>Conversion tracking</li>
                        <li>Email campaign effectiveness</li>
                      </ul>
                      <div className="mt-3 space-y-1">
                        <p className="text-warning-700 font-semibold">
                          Third-party advertising partners:
                        </p>
                        <ul className="list-disc list-inside text-warning-700">
                          <li>Google Ads</li>
                          <li>Facebook Pixel</li>
                          <li>LinkedIn Insight Tag</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Other Tracking Technologies */}
            <section>
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                Other Tracking Technologies
              </h2>
              
              <div className="space-y-4">
                <p className="text-secondary-700">
                  In addition to cookies, we may use other tracking technologies:
                </p>

                <div className="space-y-3">
                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-secondary-900 mb-2">Web Beacons (Pixels)</h3>
                    <p className="text-secondary-700">
                      Small transparent image files embedded in web pages and emails to track page views, email opens, and user engagement.
                    </p>
                  </div>

                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-secondary-900 mb-2">Local Storage</h3>
                    <p className="text-secondary-700">
                      HTML5 local storage to save data locally in your browser for improved performance and offline functionality.
                    </p>
                  </div>

                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-secondary-900 mb-2">Device Fingerprinting</h3>
                    <p className="text-secondary-700">
                      Collection of device and browser characteristics to identify unique users for security and analytics purposes.
                    </p>
                  </div>

                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-secondary-900 mb-2">Session Replay</h3>
                    <p className="text-secondary-700">
                      Recording of user interactions (clicks, scrolls, mouse movements) to improve user experience and identify usability issues.
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
                      2. Platform Cookie Preferences
                    </h3>
                    <p className="text-secondary-700">
                      You can manage your cookie preferences directly on beBrivus through your account settings or our cookie consent banner.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                      3. Opt-Out Tools
                    </h3>
                    <p className="text-secondary-700 mb-2">
                      Opt out of third-party advertising cookies:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-secondary-700">
                      <li><a href="https://optout.aboutads.info/" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">Digital Advertising Alliance (DAA)</a></li>
                      <li><a href="https://www.youronlinechoices.com/" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">Your Online Choices (Europe)</a></li>
                      <li><a href="https://www.networkadvertising.org/choices/" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">Network Advertising Initiative (NAI)</a></li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                      4. Do Not Track (DNT)
                    </h3>
                    <p className="text-secondary-700">
                      Some browsers support "Do Not Track" signals. However, there is currently no industry standard for responding to DNT signals, and we do not currently respond to them.
                    </p>
                  </div>
                </div>

                <div className="bg-warning-50 border border-warning-200 p-4 rounded-lg mt-4">
                  <p className="text-warning-900 font-semibold mb-2">
                    ⚠️ Important Note:
                  </p>
                  <p className="text-warning-800">
                    Disabling cookies may affect your ability to use certain features of beBrivus. Essential cookies are required for the platform to function and cannot be disabled.
                  </p>
                </div>
              </div>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                Cookie Data Retention
              </h2>
              
              <div className="space-y-4">
                <p className="text-secondary-700">
                  Different cookies have different retention periods:
                </p>

                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-neutral-200 rounded-lg">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-secondary-900 border-b">Cookie Type</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-secondary-900 border-b">Retention Period</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      <tr>
                        <td className="px-6 py-4 text-secondary-700">Session Cookies</td>
                        <td className="px-6 py-4 text-secondary-700">Deleted when browser closes</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-secondary-700">Authentication Cookies</td>
                        <td className="px-6 py-4 text-secondary-700">30 days</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-secondary-700">Functional Cookies</td>
                        <td className="px-6 py-4 text-secondary-700">1 year</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-secondary-700">Analytics Cookies</td>
                        <td className="px-6 py-4 text-secondary-700">2 years</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-secondary-700">Marketing Cookies</td>
                        <td className="px-6 py-4 text-secondary-700">1 year</td>
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
