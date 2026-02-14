import React from "react";
import { Layout } from "../components/layout";
import { Shield, Lock, Eye, Database, UserCheck, Mail } from "lucide-react";

export const PrivacyPolicyPage: React.FC = () => {
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
            <div className="inline-flex items-center justify-center w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl xs:rounded-2xl mb-3 xs:mb-4 sm:mb-5 lg:mb-6">
              <Shield className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
            </div>
            <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-secondary-900 mb-2 xs:mb-3 sm:mb-4">
              Privacy Policy
            </h1>
            <p className="text-xs xs:text-sm sm:text-base lg:text-lg text-secondary-600">
              Last Updated: January 26, 2026
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg xs:rounded-xl sm:rounded-2xl shadow-lg p-3 xs:p-4 sm:p-6 md:p-8 lg:p-12 space-y-4 xs:space-y-5 sm:space-y-6 lg:space-y-8">
            {/* Introduction */}
            <section>
              <p className="text-[10px] xs:text-xs sm:text-sm md:text-base text-secondary-700 leading-relaxed text-left">
                At beBrivus, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mr-4">
                  <Database className="w-6 h-6 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-secondary-900">
                  Information We Collect
                </h2>
              </div>
              
              <div className="space-y-4 ml-0 sm:ml-16">
                <div>
                  <h3 className="text-xl font-semibold text-secondary-800 mb-2 text-left">
                    Personal Information
                  </h3>
                  <ul className="list-disc pl-6 space-y-2 text-secondary-700">
                    <li>Name, email address, and contact information</li>
                    <li>Educational background and academic records</li>
                    <li>Professional experience and career goals</li>
                    <li>Profile pictures and biographical information</li>
                    <li>Application materials and documents</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-secondary-800 mb-2 text-left">
                    Usage Information
                  </h3>
                  <ul className="list-disc pl-6 space-y-2 text-secondary-700">
                    <li>Browser type, device information, and IP address</li>
                    <li>Pages visited, features used, and time spent on platform</li>
                    <li>Search queries and opportunity interactions</li>
                    <li>Communication preferences and settings</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-secondary-800 mb-2 text-left">
                    Cookies and Tracking Technologies
                  </h3>
                  <p className="text-secondary-700 text-left">
                    We use cookies, web beacons, and similar technologies to enhance your experience, analyze usage patterns, and personalize content. You can control cookie preferences through your browser settings.
                  </p>
                </div>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center mr-4">
                  <UserCheck className="w-6 h-6 text-success-600" />
                </div>
                <h2 className="text-2xl font-bold text-secondary-900">
                  How We Use Your Information
                </h2>
              </div>
              
              <ul className="list-disc pl-6 space-y-2 text-secondary-700 ml-0 sm:ml-16">
                <li>Provide personalized opportunity recommendations</li>
                <li>Connect you with mentors and other users</li>
                <li>Process your applications and track submissions</li>
                <li>Send relevant notifications and updates</li>
                <li>Improve our services and develop new features</li>
                <li>Ensure platform security and prevent fraud</li>
                <li>Comply with legal obligations and enforce our policies</li>
                <li>Communicate important announcements and changes</li>
              </ul>
            </section>

            {/* Information Sharing */}
            <section>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center mr-4">
                  <Eye className="w-6 h-6 text-warning-600" />
                </div>
                <h2 className="text-2xl font-bold text-secondary-900">
                  Information Sharing and Disclosure
                </h2>
              </div>
              
              <div className="space-y-4 text-left ml-0 sm:ml-16">
                <p className="text-secondary-700 text-left">
                  We do not sell your personal information. We may share your information in the following circumstances:
                </p>
                
                <ul className="list-disc pl-6 space-y-2 text-secondary-700">
                  <li><strong>With Mentors:</strong> When you request mentorship or participate in mentoring sessions</li>
                  <li><strong>With Opportunity Providers:</strong> When you apply to scholarships, internships, or fellowships</li>
                  <li><strong>Service Providers:</strong> Third-party vendors who assist in platform operations (e.g., hosting, analytics, email services)</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect rights, safety, and security</li>
                  <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or asset sales</li>
                  <li><strong>With Your Consent:</strong> When you explicitly authorize information sharing</li>
                </ul>
              </div>
            </section>

            {/* Data Security */}
            <section>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-error-100 rounded-xl flex items-center justify-center mr-4">
                  <Lock className="w-6 h-6 text-error-600" />
                </div>
                <h2 className="text-2xl font-bold text-secondary-900">
                  Data Security
                </h2>
              </div>
              
              <div className="space-y-4 text-left ml-0 sm:ml-16">
                <p className="text-secondary-700 text-left">
                  We implement industry-standard security measures to protect your information:
                </p>
                
                <ul className="list-disc pl-6 space-y-2 text-secondary-700">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security assessments and audits</li>
                  <li>Access controls and authentication mechanisms</li>
                  <li>Employee training on data protection practices</li>
                  <li>Incident response and breach notification procedures</li>
                </ul>

                <p className="text-secondary-700 text-left">
                  While we strive to protect your information, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.
                </p>
              </div>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-bold text-secondary-900 mb-4 text-left">
                Your Privacy Rights
              </h2>
              
              <div className="space-y-4 text-left">
                <p className="text-secondary-700 text-left">
                  Depending on your location, you may have the following rights:
                </p>
                
                <ul className="list-disc pl-6 space-y-2 text-secondary-700">
                  <li><strong>Access:</strong> Request a copy of your personal information</li>
                  <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                  <li><strong>Portability:</strong> Receive your data in a portable format</li>
                  <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
                  <li><strong>Restrict Processing:</strong> Limit how we use your information</li>
                  <li><strong>Object:</strong> Object to certain data processing activities</li>
                </ul>

                <p className="text-secondary-700 text-left">
                  To exercise these rights, please contact us at <a href="mailto:privacy@bebrivus.com" className="text-primary-600 hover:text-primary-700 font-semibold">privacy@bebrivus.com</a>
                </p>
              </div>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-bold text-secondary-900 mb-4 text-left">
                Data Retention
              </h2>
              
              <p className="text-secondary-700 text-left">
                We retain your personal information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements. When you delete your account, we will remove or anonymize your personal information within 30 days, except where required by law.
              </p>
            </section>

            {/* International Data Transfers */}
            <section>
              <h2 className="text-2xl font-bold text-secondary-900 mb-4 text-left">
                International Data Transfers
              </h2>
              
              <p className="text-secondary-700 text-left">
                Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy and applicable laws.
              </p>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl font-bold text-secondary-900 mb-4 text-left">
                Children's Privacy
              </h2>
              
              <p className="text-secondary-700 text-left">
                Our platform is not intended for users under 13 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
              </p>
            </section>

            {/* Changes to Privacy Policy */}
            <section>
              <h2 className="text-2xl font-bold text-secondary-900 mb-4 text-left">
                Changes to This Privacy Policy
              </h2>
              
              <p className="text-secondary-700 text-left">
                We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements. We will notify you of material changes by posting the updated policy on our platform and updating the "Last Updated" date. Your continued use of beBrivus after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            {/* Contact Information */}
            <section className="bg-primary-50 rounded-lg xs:rounded-xl p-3 xs:p-4 sm:p-5 lg:p-6">
              <div className="flex flex-col items-center justify-center mb-3 xs:mb-4">
                <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 bg-primary-600 rounded-lg xs:rounded-xl flex items-center justify-center mb-2 xs:mb-3">
                  <Mail className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h2 className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-secondary-900 text-center">
                  Contact Us
                </h2>
              </div>
              
              <div className="space-y-2 xs:space-y-2.5 sm:space-y-3 text-secondary-700 text-center">
                <p className="text-[10px] xs:text-xs sm:text-sm md:text-base">
                  If you have questions or concerns about this Privacy Policy, please contact us:
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
