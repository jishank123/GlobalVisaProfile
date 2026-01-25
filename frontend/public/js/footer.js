/**
 * Shared Footer Component
 */

class Footer {
    constructor() {
        this.init();
    }

    getFooterHTML() {
        return `
            <footer class="bg-gray-900 text-white py-16">
                <div class="container mx-auto px-4">
                    <div class="grid md:grid-cols-4 gap-8">
                        <!-- Company Info -->
                        <div class="md:col-span-1">
                            <div class="flex items-center space-x-2 mb-4">
                                <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                    <i class="fas fa-graduation-cap text-white text-lg"></i>
                                </div>
                                <span class="text-xl font-bold">ImmigrationPro</span>
                            </div>
                            <p class="text-gray-400 mb-4">
                                Expert guidance for EB-1A, EB-2 NIW, and O-1 visa applications. 
                                Build your extraordinary profile with confidence.
                            </p>
                            <div class="flex space-x-4">
                                <a href="#" class="text-gray-400 hover:text-white transition-colors">
                                    <i class="fab fa-linkedin text-xl"></i>
                                </a>
                                <a href="#" class="text-gray-400 hover:text-white transition-colors">
                                    <i class="fab fa-twitter text-xl"></i>
                                </a>
                                <a href="#" class="text-gray-400 hover:text-white transition-colors">
                                    <i class="fab fa-facebook text-xl"></i>
                                </a>
                            </div>
                        </div>

                        <!-- Services -->
                        <div>
                            <h3 class="text-lg font-semibold mb-4">Services</h3>
                            <ul class="space-y-2 text-gray-400">
                                <li><a href="eb1a-eligibility.html" class="hover:text-white transition-colors">EB-1A Eligibility</a></li>
                                <li><a href="eb2-niw.html" class="hover:text-white transition-colors">EB-2 NIW</a></li>
                                <li><a href="o1-visa.html" class="hover:text-white transition-colors">O-1 Visa</a></li>
                                <li><a href="profile-building.html" class="hover:text-white transition-colors">Profile Building</a></li>
                                <li><a href="services-detailed.html" class="hover:text-white transition-colors">All Services</a></li>
                            </ul>
                        </div>

                        <!-- Resources -->
                        <div>
                            <h3 class="text-lg font-semibold mb-4">Resources</h3>
                            <ul class="space-y-2 text-gray-400">
                                <li><a href="profile-assessment.html" class="hover:text-white transition-colors">Free Assessment</a></li>
                                <li><a href="pricing.html" class="hover:text-white transition-colors">Pricing</a></li>
                                <li><a href="faq.html" class="hover:text-white transition-colors">FAQ</a></li>
                                <li><a href="attorney-referrals.html" class="hover:text-white transition-colors">Attorney Referrals</a></li>
                                <li><a href="database-documentation.html" class="hover:text-white transition-colors">Documentation</a></li>
                            </ul>
                        </div>

                        <!-- Contact -->
                        <div>
                            <h3 class="text-lg font-semibold mb-4">Get Started</h3>
                            <ul class="space-y-2 text-gray-400">
                                <li><a href="schedule-appointment.html" class="hover:text-white transition-colors">Schedule Consultation</a></li>
                                <li><a href="client-signup.html" class="hover:text-white transition-colors">Create Account</a></li>
                                <li><a href="client-login.html" class="hover:text-white transition-colors">Client Portal</a></li>
                                <li>
                                    <a href="mailto:info@immigrationpro.com" class="hover:text-white transition-colors">
                                        <i class="fas fa-envelope mr-2"></i>Contact Us
                                    </a>
                                </li>
                                <li>
                                    <a href="tel:+1234567890" class="hover:text-white transition-colors">
                                        <i class="fas fa-phone mr-2"></i>+1 (234) 567-8900
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <!-- Bottom Bar -->
                    <div class="border-t border-gray-700 mt-12 pt-8">
                        <div class="flex flex-col md:flex-row justify-between items-center">
                            <p class="text-gray-400 text-sm mb-4 md:mb-0">
                                &copy; 2024 ImmigrationPro. All rights reserved.
                            </p>
                            <div class="flex space-x-6 text-sm text-gray-400">
                                <a href="#" class="hover:text-white transition-colors">Privacy Policy</a>
                                <a href="#" class="hover:text-white transition-colors">Terms of Service</a>
                                <a href="#" class="hover:text-white transition-colors">Cookie Policy</a>
                            </div>
                        </div>
                        
                        <!-- Disclaimer -->
                        <div class="mt-6 p-4 bg-gray-800 rounded-lg">
                            <p class="text-xs text-gray-400 leading-relaxed">
                                <i class="fas fa-exclamation-triangle text-yellow-500 mr-2"></i>
                                <strong>Legal Disclaimer:</strong> ImmigrationPro provides educational guidance and consultation services. 
                                We are not attorneys and do not provide legal advice. All information is for educational purposes only. 
                                For legal advice specific to your case, please consult a licensed immigration attorney.
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        `;
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            const footerContainer = document.getElementById('footer-placeholder');
            if (footerContainer) {
                footerContainer.innerHTML = this.getFooterHTML();
            }
        });
    }
}

// Initialize footer
new Footer();