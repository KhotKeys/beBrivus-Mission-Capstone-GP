import React from "react";
import { Layout } from "../components/layout";
import { Accessibility, Eye, Keyboard, Volume2, MousePointer, Smartphone, Mail } from "lucide-react";

export const AccessibilityPage: React.FC = () => {
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
            <div className="inline-flex items-center justify-center w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-success-500 to-success-600 rounded-xl xs:rounded-2xl mb-3 xs:mb-4 sm:mb-5 lg:mb-6">
              <Accessibility className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
            </div>
            <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-secondary-900 mb-2 xs:mb-3 sm:mb-4">
              Accessibility Statement
            </h1>
            <p className="text-xs xs:text-sm sm:text-base lg:text-lg text-secondary-600">
              Last Updated: January 26, 2026
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg xs:rounded-xl sm:rounded-2xl shadow-lg p-3 xs:p-4 sm:p-6 md:p-8 lg:p-12 space-y-4 xs:space-y-5 sm:space-y-6 lg:space-y-8 text-left">
            {/* Introduction */}
            <section>
              <p className="text-sm sm:text-base text-secondary-700 leading-relaxed">
                At beBrivus, we are committed to ensuring that our platform is accessible to everyone, including people with disabilities. We believe that access to educational and career opportunities should be available to all, regardless of ability. This Accessibility Statement outlines our ongoing efforts to improve accessibility and provide an inclusive user experience.
              </p>
            </section>

            {/* Our Commitment */}
            <section>
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                Our Commitment to Accessibility
              </h2>
              
              <div className="space-y-4">
                <p className="text-secondary-700">
                  beBrivus strives to conform to Level AA of the Web Content Accessibility Guidelines (WCAG) 2.1, an internationally recognized standard for web accessibility. We are dedicated to:
                </p>

                <ul className="list-disc list-inside space-y-2 text-secondary-700">
                  <li>Making our platform usable for people with diverse abilities</li>
                  <li>Ensuring compatibility with assistive technologies</li>
                  <li>Providing alternative formats for content when needed</li>
                  <li>Continuously testing and improving accessibility</li>
                  <li>Training our team on accessibility best practices</li>
                  <li>Incorporating user feedback to enhance accessibility</li>
                </ul>
              </div>
            </section>

            {/* Accessibility Features */}
            <section>
              <h2 className="text-2xl font-bold text-secondary-900 mb-6">
                Accessibility Features
              </h2>
              
              <div className="space-y-6">
                {/* Visual Accessibility */}
                <div className="bg-primary-50 border-l-4 border-primary-500 p-6 rounded-lg">
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                      <Eye className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-primary-900 mb-3">
                        Visual Accessibility
                      </h3>
                      <ul className="list-disc list-inside space-y-2 text-primary-800">
                        <li><strong>High Contrast:</strong> Sufficient color contrast ratios (minimum 4.5:1 for text)</li>
                        <li><strong>Resizable Text:</strong> All text can be resized up to 200% without loss of functionality</li>
                        <li><strong>Clear Typography:</strong> Readable fonts with appropriate spacing and line height</li>
                        <li><strong>Alternative Text:</strong> Descriptive alt text for all images and icons</li>
                        <li><strong>Color Independence:</strong> Information not conveyed by color alone</li>
                        <li><strong>Focus Indicators:</strong> Visible keyboard focus indicators on all interactive elements</li>
                        <li><strong>Screen Reader Support:</strong> Compatible with JAWS, NVDA, VoiceOver, and TalkBack</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Keyboard Navigation */}
                <div className="bg-secondary-50 border-l-4 border-secondary-500 p-6 rounded-lg">
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-secondary-500 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                      <Keyboard className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-secondary-900 mb-3">
                        Keyboard Navigation
                      </h3>
                      <ul className="list-disc list-inside space-y-2 text-secondary-800">
                        <li><strong>Full Keyboard Access:</strong> All features accessible using keyboard only</li>
                        <li><strong>Logical Tab Order:</strong> Intuitive navigation through interactive elements</li>
                        <li><strong>Skip Links:</strong> "Skip to main content" links to bypass navigation</li>
                        <li><strong>Keyboard Shortcuts:</strong> Common shortcuts for frequent actions</li>
                        <li><strong>No Keyboard Traps:</strong> Users can navigate away from any element</li>
                        <li><strong>Modal Management:</strong> Proper focus management in dialogs and modals</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Audio and Video */}
                <div className="bg-success-50 border-l-4 border-success-500 p-6 rounded-lg">
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-success-500 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                      <Volume2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-success-900 mb-3">
                        Multimedia Accessibility
                      </h3>
                      <ul className="list-disc list-inside space-y-2 text-success-800">
                        <li><strong>Captions:</strong> Closed captions for all video content</li>
                        <li><strong>Transcripts:</strong> Text transcripts for audio and video materials</li>
                        <li><strong>Audio Descriptions:</strong> Descriptions of visual content in videos</li>
                        <li><strong>Playback Controls:</strong> Accessible media player controls</li>
                        <li><strong>Volume Control:</strong> Independent volume adjustment</li>
                        <li><strong>Auto-Play Control:</strong> Option to disable auto-playing media</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Interactive Elements */}
                <div className="bg-warning-50 border-l-4 border-warning-500 p-6 rounded-lg">
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-warning-500 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                      <MousePointer className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-warning-900 mb-3">
                        Interactive Elements
                      </h3>
                      <ul className="list-disc list-inside space-y-2 text-warning-800">
                        <li><strong>Large Click Targets:</strong> Minimum 44x44 pixel touch targets</li>
                        <li><strong>Clear Labels:</strong> Descriptive labels for all form fields and buttons</li>
                        <li><strong>Error Identification:</strong> Clear error messages with suggestions</li>
                        <li><strong>Time Limits:</strong> Adjustable or no time limits on tasks</li>
                        <li><strong>Predictable Navigation:</strong> Consistent navigation patterns</li>
                        <li><strong>ARIA Landmarks:</strong> Proper use of ARIA roles and landmarks</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Mobile Accessibility */}
                <div className="bg-error-50 border-l-4 border-error-500 p-6 rounded-lg">
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-error-500 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                      <Smartphone className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-error-900 mb-3">
                        Mobile Accessibility
                      </h3>
                      <ul className="list-disc list-inside space-y-2 text-error-800">
                        <li><strong>Responsive Design:</strong> Optimized for all screen sizes</li>
                        <li><strong>Touch-Friendly:</strong> Appropriate spacing between interactive elements</li>
                        <li><strong>Orientation Support:</strong> Works in both portrait and landscape modes</li>
                        <li><strong>Mobile Screen Readers:</strong> Compatible with iOS VoiceOver and Android TalkBack</li>
                        <li><strong>Gesture Alternatives:</strong> Alternative input methods for complex gestures</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Standards Compliance */}
            <section>
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                Standards and Guidelines
              </h2>
              
              <div className="space-y-4">
                <p className="text-secondary-700">
                  beBrivus aims to comply with the following accessibility standards and guidelines:
                </p>

                <ul className="list-disc list-inside space-y-2 text-secondary-700">
                  <li><strong>WCAG 2.1 Level AA:</strong> Web Content Accessibility Guidelines published by W3C</li>
                  <li><strong>Section 508:</strong> U.S. federal accessibility requirements</li>
                  <li><strong>ADA:</strong> Americans with Disabilities Act compliance for digital accessibility</li>
                  <li><strong>EN 301 549:</strong> European accessibility standard for ICT products and services</li>
                  <li><strong>ARIA 1.2:</strong> Accessible Rich Internet Applications specifications</li>
                </ul>
              </div>
            </section>

            {/* Assistive Technologies */}
            <section>
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                Compatible Assistive Technologies
              </h2>
              
              <div className="space-y-4">
                <p className="text-secondary-700">
                  beBrivus is designed to work with the following assistive technologies:
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-secondary-900 mb-2">Screen Readers</h3>
                    <ul className="list-disc list-inside space-y-1 text-secondary-700">
                      <li>JAWS (Windows)</li>
                      <li>NVDA (Windows)</li>
                      <li>VoiceOver (macOS/iOS)</li>
                      <li>TalkBack (Android)</li>
                      <li>Narrator (Windows)</li>
                    </ul>
                  </div>

                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-secondary-900 mb-2">Browser Extensions</h3>
                    <ul className="list-disc list-inside space-y-1 text-secondary-700">
                      <li>ZoomText</li>
                      <li>Read&Write</li>
                      <li>Natural Reader</li>
                      <li>High Contrast Extensions</li>
                    </ul>
                  </div>

                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-secondary-900 mb-2">Input Devices</h3>
                    <ul className="list-disc list-inside space-y-1 text-secondary-700">
                      <li>Switch Access</li>
                      <li>Voice Control</li>
                      <li>Eye Tracking</li>
                      <li>Adaptive Keyboards</li>
                    </ul>
                  </div>

                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-secondary-900 mb-2">Operating System Features</h3>
                    <ul className="list-disc list-inside space-y-1 text-secondary-700">
                      <li>Magnification Tools</li>
                      <li>High Contrast Modes</li>
                      <li>Speech Recognition</li>
                      <li>Color Filters</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Known Limitations */}
            <section>
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                Known Limitations
              </h2>
              
              <div className="space-y-4">
                <p className="text-secondary-700">
                  We are actively working to address the following accessibility limitations:
                </p>

                <ul className="list-disc list-inside space-y-2 text-secondary-700">
                  <li>Some third-party embedded content may not be fully accessible</li>
                  <li>Certain complex data visualizations may have limited screen reader support</li>
                  <li>PDF documents from external sources may not meet accessibility standards</li>
                  <li>Live chat features may have limited accessibility in certain scenarios</li>
                </ul>

                <p className="text-secondary-700">
                  If you encounter accessibility barriers while using our platform, please contact us so we can provide alternative solutions.
                </p>
              </div>
            </section>

            {/* Ongoing Efforts */}
            <section>
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                Ongoing Accessibility Efforts
              </h2>
              
              <ul className="list-disc list-inside space-y-2 text-secondary-700">
                <li>Regular accessibility audits by third-party experts</li>
                <li>Automated and manual testing with assistive technologies</li>
                <li>User testing with people with disabilities</li>
                <li>Staff training on accessibility best practices</li>
                <li>Incorporating accessibility in the design and development process</li>
                <li>Monitoring and addressing user-reported accessibility issues</li>
                <li>Staying updated on emerging accessibility standards</li>
              </ul>
            </section>

            {/* Feedback and Support */}
            <section className="bg-success-50 rounded-lg xs:rounded-xl p-3 xs:p-4 sm:p-5 lg:p-6">
              <div className="flex items-start justify-start gap-3 mb-3 xs:mb-4">
                <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 bg-success-600 rounded-lg xs:rounded-xl flex items-center justify-center">
                  <Mail className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h2 className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-secondary-900 text-left">
                  Accessibility Feedback and Support
                </h2>
              </div>
              
              <div className="space-y-2 xs:space-y-3 sm:space-y-4 text-secondary-700 text-left">
                <p className="text-[10px] xs:text-xs sm:text-sm md:text-base">
                  We welcome your feedback on the accessibility of beBrivus. If you encounter accessibility barriers or have suggestions for improvement, please contact us:
                </p>
                
                <ul className="space-y-1 xs:space-y-1.5 sm:space-y-2 text-[9px] xs:text-[10px] sm:text-xs md:text-sm">
                  <li><strong>Email:</strong> <a href="mailto:accessibility@bebrivus.com" className="text-primary-600 hover:text-primary-700">accessibility@bebrivus.com</a></li>
                  <li><strong>Phone:</strong> <a href="tel:+250798619967" className="text-primary-600 hover:text-primary-700">+250 798 619 967</a> (TTY available)</li>
                  <li><strong>Address:</strong> beBrivus Inc., KG 11 Ave, Kigali, Rwanda</li>
                  <li><strong>Response Time:</strong> We aim to respond to accessibility inquiries within 2 business days</li>
                </ul>

                <p className="font-semibold text-[10px] xs:text-xs sm:text-sm md:text-base">
                  When reporting accessibility issues, please include:
                </p>
                <ul className="list-disc list-inside space-y-1 text-[9px] xs:text-[10px] sm:text-xs md:text-sm">
                  <li>The web page or feature you were trying to access</li>
                  <li>A description of the problem</li>
                  <li>The assistive technology you were using (if applicable)</li>
                  <li>Your browser and operating system</li>
                </ul>
              </div>
            </section>

            {/* Third-Party Content */}
            <section>
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                Third-Party Content
              </h2>
              
              <p className="text-secondary-700">
                beBrivus may contain links to external websites and third-party content. We are not responsible for the accessibility of third-party websites or services. However, we encourage our partners to maintain accessible platforms and will work with them to address accessibility concerns when possible.
              </p>
            </section>

            {/* Updates */}
            <section>
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                Updates to This Statement
              </h2>
              
              <p className="text-secondary-700">
                We review and update this Accessibility Statement regularly to reflect our ongoing efforts and improvements. The "Last Updated" date at the top of this page indicates when this statement was most recently revised.
              </p>
            </section>

            {/* Formal Complaints */}
            <section className="bg-neutral-50 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                Formal Complaints
              </h2>
              
              <p className="text-secondary-700">
                If you are not satisfied with our response to your accessibility concern, you may file a formal complaint with:
              </p>
              
              <ul className="list-disc list-inside space-y-2 text-secondary-700 mt-4">
                <li><strong>U.S. Department of Justice:</strong> <a href="https://www.ada.gov/filing_complaint.htm" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">ADA Complaint Process</a></li>
                <li><strong>U.S. Office for Civil Rights:</strong> <a href="https://www.hhs.gov/ocr/complaints/index.html" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">OCR Complaint Portal</a></li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};
