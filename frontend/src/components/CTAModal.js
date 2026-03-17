import React from 'react';
import { Link } from 'react-router-dom';

const CTAModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative animate-fadeIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <i className="fas fa-times text-2xl"></i>
        </button>

        {/* Modal Content */}
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            Begin Your EB-1A Journey
          </h2>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Link
              to="/assessment"
              onClick={onClose}
              className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-8 py-4 rounded-lg font-semibold transition-all transform hover:scale-105 flex items-center justify-center"
            >
              <i className="fas fa-chart-line mr-2"></i>
              Get Free Assessment
            </Link>

            <a
              href="https://wa.me/15134504166"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-4 rounded-lg font-semibold transition-all transform hover:scale-105 flex items-center justify-center"
            >
              <i className="fab fa-whatsapp mr-2 text-xl"></i>
              WhatsApp
            </a>

            <Link
              to="/schedule"
              onClick={onClose}
              className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-8 py-4 rounded-lg font-semibold transition-all transform hover:scale-105 flex items-center justify-center"
            >
              <i className="fas fa-paper-plane mr-2"></i>
              Claim Your Spot
            </Link>
          </div>

          {/* Close Button at Bottom */}
          <button
            onClick={onClose}
            className="mt-4 px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CTAModal;
