import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-secondary-900 text-white pt-10 sm:pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12 mb-10 sm:mb-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center justify-center sm:justify-start space-x-2 mb-4 sm:mb-6">
              <img
                className="max-w-20 sm:max-w-24 brightness-0 invert"
                src="/beBivus.png"
                alt="beBrivus Logo"
              />
            </div>
            <p className="text-secondary-300 mb-5 sm:mb-6 leading-relaxed text-sm sm:text-base text-center sm:text-left">
              Empowering students worldwide to discover and secure
              life-changing scholarships, internships, and fellowship
              opportunities.
            </p>
            <div className="flex justify-center sm:justify-start space-x-3 sm:space-x-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 sm:w-10 sm:h-10 bg-secondary-800 hover:bg-primary-600 rounded-full flex items-center justify-center transition-colors cursor-pointer"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 sm:w-10 sm:h-10 bg-secondary-800 hover:bg-primary-600 rounded-full flex items-center justify-center transition-colors cursor-pointer"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 sm:w-10 sm:h-10 bg-secondary-800 hover:bg-primary-600 rounded-full flex items-center justify-center transition-colors cursor-pointer"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 sm:w-10 sm:h-10 bg-secondary-800 hover:bg-primary-600 rounded-full flex items-center justify-center transition-colors cursor-pointer"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 text-center sm:text-left">
              Platform
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/opportunities"
                  className="text-secondary-300 hover:text-primary-400 transition-colors flex items-center justify-center sm:justify-start group text-sm sm:text-base"
                >
                  <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Opportunities
                </Link>
              </li>
              <li>
                <Link
                  to="/mentors"
                  className="text-secondary-300 hover:text-primary-400 transition-colors flex items-center justify-center sm:justify-start group text-sm sm:text-base"
                >
                  <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Mentorship
                </Link>
              </li>
              <li>
                <Link
                  to="/resources"
                  className="text-secondary-300 hover:text-primary-400 transition-colors flex items-center justify-center sm:justify-start group text-sm sm:text-base"
                >
                  <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Resources
                </Link>
              </li>
              <li>
                <Link
                  to="/forum"
                  className="text-secondary-300 hover:text-primary-400 transition-colors flex items-center justify-center sm:justify-start group text-sm sm:text-base"
                >
                  <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Community Forum
                </Link>
              </li>
              <li>
                <Link
                  to="/ai-coach"
                  className="text-secondary-300 hover:text-primary-400 transition-colors flex items-center justify-center sm:justify-start group text-sm sm:text-base"
                >
                  <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  AI Career Coach
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 text-center sm:text-left">
              Resources
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/success-stories"
                  className="text-secondary-300 hover:text-primary-400 transition-colors flex items-center justify-center sm:justify-start group text-sm sm:text-base"
                >
                  <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Success Stories
                </Link>
              </li>
              <li>
                <Link
                  to="/application-tips"
                  className="text-secondary-300 hover:text-primary-400 transition-colors flex items-center justify-center sm:justify-start group text-sm sm:text-base"
                >
                  <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Application Tips
                </Link>
              </li>
              <li>
                <Link
                  to="/blog-guides"
                  className="text-secondary-300 hover:text-primary-400 transition-colors flex items-center justify-center sm:justify-start group text-sm sm:text-base"
                >
                  <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Blog & Guides
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-secondary-300 hover:text-primary-400 transition-colors flex items-center justify-center sm:justify-start group text-sm sm:text-base"
                >
                  <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/help-center"
                  className="text-secondary-300 hover:text-primary-400 transition-colors flex items-center justify-center sm:justify-start group text-sm sm:text-base"
                >
                  <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 text-center sm:text-left">
              Company
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/about-us"
                  className="text-secondary-300 hover:text-primary-400 transition-colors flex items-center justify-center sm:justify-start group text-sm sm:text-base"
                >
                  <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/our-mission"
                  className="text-secondary-300 hover:text-primary-400 transition-colors flex items-center justify-center sm:justify-start group text-sm sm:text-base"
                >
                  <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Our Mission
                </Link>
              </li>
              <li>
                <Link
                  to="/careers"
                  className="text-secondary-300 hover:text-primary-400 transition-colors flex items-center justify-center sm:justify-start group text-sm sm:text-base"
                >
                  <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-secondary-300 hover:text-primary-400 transition-colors flex items-center justify-center sm:justify-start group text-sm sm:text-base"
                >
                  <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/partner-with-us"
                  className="text-secondary-300 hover:text-primary-400 transition-colors flex items-center justify-center sm:justify-start group text-sm sm:text-base"
                >
                  <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Partner With Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-secondary-800 pt-6 sm:pt-8 mb-6 sm:mb-8">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-lg sm:text-2xl font-bold mb-3">
              Stay Updated on New Opportunities
            </h3>
            <p className="text-secondary-300 mb-5 sm:mb-6 text-sm sm:text-base">
              Get weekly insights, exclusive opportunities, and application
              tips delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-secondary-800 border border-secondary-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-white placeholder-secondary-500 text-sm sm:text-base"
              />
              <button className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 active:from-primary-800 active:to-primary-900 text-white font-semibold rounded-lg transition-all transform hover:scale-105 active:scale-95 active:shadow-lg cursor-pointer text-sm sm:text-base">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-secondary-800 pt-6 sm:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="text-secondary-400 text-xs sm:text-sm text-left">
              © {new Date().getFullYear()} beBrivus. All rights reserved.
            </div>
            <div className="flex flex-wrap gap-4 sm:gap-6 text-xs sm:text-sm justify-start">
              <Link
                to="/privacy-policy"
                className="text-secondary-400 hover:text-primary-400 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms-of-service"
                className="text-secondary-400 hover:text-primary-400 transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                to="/cookie-policy"
                className="text-secondary-400 hover:text-primary-400 transition-colors"
              >
                Cookie Policy
              </Link>
              <Link
                to="/accessibility"
                className="text-secondary-400 hover:text-primary-400 transition-colors"
              >
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
