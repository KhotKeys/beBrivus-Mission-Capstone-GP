import React from "react";
import { Layout } from "../components/layout";
import { FileText, CheckCircle, AlertTriangle, Scale, UserX, Shield } from "lucide-react";

export const TermsOfServicePage: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white py-12 sm:py-16 lg:py-20 relative overflow-x-hidden">
        {/* Animated dotted background */}
        <div className="absolute inset-0 opacity-35 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, rgba(59, 130, 246, 0.5) 1.5px, transparent 1.5px)',
          backgroundSize: '20px 20px',
          animation: 'moveDots 20s linear infinite'
        }}></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-2xl mb-6">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-4">
              Terms of Service
            </h1>
            <p className="text-lg text-secondary-600">
              Last Updated: January 26, 2026
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8">
            {/* Introduction */}
            <section>
              <p className="text-secondary-700 leading-relaxed">
                Welcome to beBrivus! These Terms of Service ("Terms") govern your access to and use of the beBrivus platform, website, and services. By accessing or using beBrivus, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our services.
              </p>
            </section>

            {/* Acceptance of Terms */}
            <section>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center mr-4">
                  <CheckCircle className="w-6 h-6 text-success-600" />
                </div>
                <h2 className="text-2xl font-bold text-secondary-900">
                  Acceptance of Terms
                </h2>
              </div>
              
              <div className="space-y-4 ml-0 sm:ml-16">
                <p className="text-secondary-700">
                  By creating an account, accessing, or using beBrivus, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. You represent that you are at least 13 years of age and have the legal capacity to enter into this agreement.
                </p>
              </div>
            </section>

            {/* Account Registration */}
            <section>
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                Account Registration and Security
              </h2>
              
              <div className="space-y-4">
                <p className="text-secondary-700">
                  To access certain features, you must create an account. You agree to:
                </p>
                
                <ul className="list-disc list-inside space-y-2 text-secondary-700">
                  <li>Provide accurate, current, and complete information during registration</li>
                  <li>Maintain and promptly update your account information</li>
                  <li>Keep your password confidential and secure</li>
                  <li>Notify us immediately of any unauthorized access or security breach</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Not share your account credentials with others</li>
                  <li>Not create multiple accounts or impersonate others</li>
                </ul>

                <p className="text-secondary-700">
                  We reserve the right to suspend or terminate accounts that violate these Terms or engage in fraudulent, abusive, or illegal activities.
                </p>
              </div>
            </section>

            {/* Use of Services */}
            <section>
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                Permitted Use of Services
              </h2>
              
              <div className="space-y-4">
                <p className="text-secondary-700">
                  beBrivus grants you a limited, non-exclusive, non-transferable license to access and use our platform for personal, non-commercial purposes. You agree to use beBrivus only for lawful purposes and in accordance with these Terms.
                </p>

                <div className="bg-success-50 border-l-4 border-success-500 p-4 rounded">
                  <h3 className="text-lg font-semibold text-success-900 mb-2">
                    Permitted Activities
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-success-800">
                    <li>Search and browse opportunities</li>
                    <li>Apply to scholarships, internships, and fellowships</li>
                    <li>Connect with mentors and peers</li>
                    <li>Participate in community forums</li>
                    <li>Track your applications and progress</li>
                    <li>Access educational resources and materials</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Prohibited Conduct */}
            <section>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-error-100 rounded-xl flex items-center justify-center mr-4">
                  <AlertTriangle className="w-6 h-6 text-error-600" />
                </div>
                <h2 className="text-2xl font-bold text-secondary-900">
                  Prohibited Conduct
                </h2>
              </div>
              
              <div className="space-y-4 ml-0 sm:ml-16">
                <p className="text-secondary-700">
                  You agree NOT to:
                </p>
                
                <div className="bg-error-50 border-l-4 border-error-500 p-4 rounded">
                  <ul className="list-disc list-inside space-y-2 text-error-800">
                    <li>Violate any local, state, national, or international laws</li>
                    <li>Infringe on intellectual property rights of others</li>
                    <li>Upload or transmit viruses, malware, or harmful code</li>
                    <li>Harass, threaten, or harm other users</li>
                    <li>Post false, misleading, or fraudulent information</li>
                    <li>Engage in spam, phishing, or unauthorized marketing</li>
                    <li>Scrape, crawl, or harvest data from the platform</li>
                    <li>Reverse engineer or decompile any part of our services</li>
                    <li>Circumvent security measures or authentication systems</li>
                    <li>Use automated tools or bots without authorization</li>
                    <li>Resell or commercially exploit our services</li>
                    <li>Interfere with platform operations or other users' access</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* User Content */}
            <section>
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                User-Generated Content
              </h2>
              
              <div className="space-y-4">
                <p className="text-secondary-700">
                  You retain ownership of content you submit to beBrivus (e.g., profile information, forum posts, application materials). However, by posting content, you grant beBrivus a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute your content for purposes of operating and improving our services.
                </p>

                <p className="text-secondary-700">
                  You represent and warrant that:
                </p>

                <ul className="list-disc list-inside space-y-2 text-secondary-700">
                  <li>You own or have the necessary rights to all content you submit</li>
                  <li>Your content does not violate any third-party rights</li>
                  <li>Your content complies with all applicable laws and these Terms</li>
                  <li>Your content is accurate and not misleading</li>
                </ul>

                <p className="text-secondary-700">
                  We reserve the right to remove any content that violates these Terms or is otherwise objectionable, without prior notice.
                </p>
              </div>
            </section>

            {/* Intellectual Property */}
            <section>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mr-4">
                  <Shield className="w-6 h-6 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-secondary-900">
                  Intellectual Property Rights
                </h2>
              </div>
              
              <div className="space-y-4 ml-0 sm:ml-16">
                <p className="text-secondary-700">
                  The beBrivus platform, including all content, features, functionality, software, and design, is owned by beBrivus Inc. and protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                </p>

                <p className="text-secondary-700">
                  Our trademarks, logos, and service marks (collectively, "Marks") may not be used without our prior written consent. All other trademarks appearing on our platform are the property of their respective owners.
                </p>
              </div>
            </section>

            {/* Disclaimers */}
            <section>
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                Disclaimers and Limitations of Liability
              </h2>
              
              <div className="space-y-4">
                <div className="bg-warning-50 border border-warning-200 p-4 rounded-lg">
                  <p className="text-warning-900 font-semibold mb-2">
                    IMPORTANT DISCLAIMER:
                  </p>
                  <p className="text-warning-800">
                    beBrivus is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, either express or implied. We do not guarantee that our services will be uninterrupted, secure, or error-free. We do not guarantee acceptance or success in any opportunity applications.
                  </p>
                </div>

                <p className="text-secondary-700">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, beBrivus SHALL NOT BE LIABLE FOR:
                </p>

                <ul className="list-disc list-inside space-y-2 text-secondary-700">
                  <li>Indirect, incidental, special, consequential, or punitive damages</li>
                  <li>Loss of profits, data, or opportunities</li>
                  <li>Service interruptions or technical failures</li>
                  <li>Actions or inactions of third parties (including opportunity providers)</li>
                  <li>Unauthorized access to your account or data</li>
                  <li>Accuracy or reliability of user-generated content</li>
                </ul>

                <p className="text-secondary-700">
                  Our total liability shall not exceed the amount you paid to beBrivus in the twelve (12) months preceding the claim, or $100, whichever is greater.
                </p>
              </div>
            </section>

            {/* Third-Party Services */}
            <section>
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                Third-Party Services and Links
              </h2>
              
              <p className="text-secondary-700">
                Our platform may contain links to third-party websites, services, or opportunity providers. We do not endorse, control, or assume responsibility for third-party content, policies, or practices. Your interactions with third parties are solely between you and the third party. We encourage you to review their terms and privacy policies.
              </p>
            </section>

            {/* Termination */}
            <section>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-error-100 rounded-xl flex items-center justify-center mr-4">
                  <UserX className="w-6 h-6 text-error-600" />
                </div>
                <h2 className="text-2xl font-bold text-secondary-900">
                  Termination
                </h2>
              </div>
              
              <div className="space-y-4 ml-0 sm:ml-16">
                <p className="text-secondary-700">
                  You may terminate your account at any time by contacting us or using account settings. We reserve the right to suspend or terminate your access to beBrivus immediately, without prior notice, for:
                </p>

                <ul className="list-disc list-inside space-y-2 text-secondary-700">
                  <li>Violation of these Terms</li>
                  <li>Fraudulent, abusive, or illegal activity</li>
                  <li>Prolonged inactivity</li>
                  <li>Legal or regulatory requirements</li>
                  <li>Security concerns or risks to other users</li>
                </ul>

                <p className="text-secondary-700">
                  Upon termination, your right to use beBrivus will immediately cease. We may retain certain information as required by law or for legitimate business purposes.
                </p>
              </div>
            </section>

            {/* Governing Law */}
            <section>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center mr-4">
                  <Scale className="w-6 h-6 text-secondary-600" />
                </div>
                <h2 className="text-2xl font-bold text-secondary-900">
                  Governing Law and Dispute Resolution
                </h2>
              </div>
              
              <div className="space-y-2 xs:space-y-3 sm:space-y-4 ml-0">
                <p className="text-[10px] xs:text-xs sm:text-sm md:text-base text-secondary-700 text-center">
                  These Terms are governed by the laws of Rwanda, without regard to conflict of law principles. Any disputes arising from these Terms or your use of beBrivus shall be resolved through binding arbitration in Kigali, Rwanda, in accordance with the Kigali International Arbitration Centre rules.
                </p>

                <p className="text-[10px] xs:text-xs sm:text-sm md:text-base text-secondary-700 text-center">
                  You agree to waive any right to a jury trial or to participate in a class action lawsuit.
                </p>
              </div>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                Changes to These Terms
              </h2>
              
              <p className="text-secondary-700">
                We may modify these Terms at any time by posting the updated version on our platform with a new "Last Updated" date. Material changes will be communicated via email or platform notification. Your continued use of beBrivus after changes constitutes acceptance of the updated Terms.
              </p>
            </section>

            {/* Contact Information */}
            <section className="bg-secondary-50 rounded-lg xs:rounded-xl p-3 xs:p-4 sm:p-5 lg:p-6">
              <h2 className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-secondary-900 mb-3 xs:mb-4 text-center">
                Contact Us
              </h2>
              
              <div className="space-y-2 xs:space-y-2.5 sm:space-y-3 text-secondary-700 text-center">
                <p className="text-[10px] xs:text-xs sm:text-sm md:text-base">
                  If you have questions about these Terms of Service, please contact us:
                </p>
                <ul className="space-y-1 xs:space-y-1.5 sm:space-y-2 text-[9px] xs:text-[10px] sm:text-xs md:text-sm">
                  <li><strong>Email:</strong> <a href="mailto:legal@bebrivus.com" className="text-primary-600 hover:text-primary-700">legal@bebrivus.com</a></li>
                  <li><strong>Address:</strong> beBrivus Inc., KG 11 Ave, Kigali, Rwanda</li>
                  <li><strong>Phone:</strong> <a href="tel:+250798619967" className="text-primary-600 hover:text-primary-700">+250 798 619 967</a></li>
                </ul>
              </div>
            </section>

            {/* Severability */}
            <section>
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                Severability and Entire Agreement
              </h2>
              
              <p className="text-secondary-700">
                If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect. These Terms, together with our Privacy Policy and any additional agreements, constitute the entire agreement between you and beBrivus regarding your use of our services.
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};
