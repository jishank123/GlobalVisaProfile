/**
 * Shared Navigation Component
 * Handles navigation rendering and mobile menu functionality
 */

class Navigation {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.init();
    }

    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop() || 'index.html';
        return page.replace('.html', '');
    }

    getNavigationHTML() {
        const navItems = [
            { href: 'index.html', label: 'Home', id: 'index' },
            { 
                href: '#', 
                label: 'Services', 
                id: 'services',
                dropdown: [
                    { href: 'eb1a-eligibility.html', label: 'EB-1A Eligibility' },
                    { href: 'eb2-niw.html', label: 'EB-2 NIW' },
                    { href: 'o1-visa.html', label: 'O-1 Visa' },
                    { href: 'services-detailed.html', label: 'All Services' }
                ]
            },
            { href: 'profile-assessment.html', label: 'Assessment', id: 'profile-assessment' },
            { href: 'pricing.html', label: 'Pricing', id: 'pricing' },
            { href: 'schedule-appointment.html', label: 'Schedule', id: 'schedule-appointment' },
            { href: 'faq.html', label: 'FAQ', id: 'faq' },
            { href: 'attorney-referrals.html', label: 'Attorneys', id: 'attorney-referrals' }
        ];

        const renderNavItem = (item) => {
            const isActive = this.currentPage === item.id;
            const activeClass = isActive ? 'text-primary font-semibold' : 'text-gray-700 hover:text-primary';
            
            if (item.dropdown) {
                return `
                    <div class="relative group">
                        <a href="${item.href}" class="nav-link ${activeClass} transition-colors cursor-pointer inline-block py-2">
                            ${item.label} <i class="fas fa-chevron-down text-xs ml-1"></i>
                        </a>
                        <div class="absolute top-full left-0 bg-white shadow-lg rounded-lg py-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                            ${item.dropdown.map(subItem => `
                                <a href="${subItem.href}" class="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors">
                                    ${subItem.label}
                                </a>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
            
            return `
                <a href="${item.href}" class="nav-link ${activeClass} transition-colors inline-block py-2">
                    ${item.label}
                </a>
            `;
        };

        return `
            <nav class="fixed w-full bg-white/95 backdrop-blur-sm shadow-sm z-50" id="main-navigation">
                <div class="container mx-auto px-4 py-4">
                    <div class="flex justify-between items-center">
                        <!-- Logo -->
                        <div class="flex items-center space-x-2">
                            <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                <i class="fas fa-graduation-cap text-white text-lg"></i>
                            </div>
                            <span class="text-xl font-bold text-gray-900">ImmigrationPro</span>
                        </div>
                        
                        <!-- Desktop Menu -->
                        <div class="hidden md:flex space-x-8 items-center">
                            ${navItems.map(renderNavItem).join('')}
                        </div>
                        
                        <!-- Client Portal & CTA -->
                        <div class="hidden md:flex items-center space-x-4">
                            <a href="client-login-clean.html" class="text-gray-700 hover:text-primary transition-colors">
                                <i class="fas fa-user mr-1"></i>Client Portal
                            </a>
                            <a href="schedule-appointment-clean.html" class="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105">
                                Get Started
                            </a>
                        </div>
                        
                        <!-- Mobile Menu Button -->
                        <button class="md:hidden text-gray-700 hover:text-primary transition-colors" id="mobile-menu-button">
                            <i class="fas fa-bars text-xl"></i>
                        </button>
                    </div>
                    
                    <!-- Mobile Menu -->
                    <div class="md:hidden mt-4 pb-4 border-t border-gray-200 hidden" id="mobile-menu">
                        <div class="flex flex-col space-y-2 pt-4">
                            ${navItems.map(item => {
                                if (item.dropdown) {
                                    return `
                                        <div class="mobile-dropdown">
                                            <button class="w-full text-left py-2 text-gray-700 hover:text-primary transition-colors flex items-center justify-between">
                                                ${item.label} <i class="fas fa-chevron-down text-xs"></i>
                                            </button>
                                            <div class="pl-4 space-y-1 hidden">
                                                ${item.dropdown.map(subItem => `
                                                    <a href="${subItem.href}" class="block py-1 text-gray-600 hover:text-primary transition-colors">
                                                        ${subItem.label}
                                                    </a>
                                                `).join('')}
                                            </div>
                                        </div>
                                    `;
                                }
                                const isActive = this.currentPage === item.id;
                                const activeClass = isActive ? 'text-primary font-semibold' : 'text-gray-700 hover:text-primary';
                                return `<a href="${item.href}" class="${activeClass} transition-colors py-2">${item.label}</a>`;
                            }).join('')}
                            <div class="pt-4 border-t border-gray-200 space-y-2">
                                <a href="client-login-clean.html" class="block text-gray-700 hover:text-primary transition-colors py-2">
                                    <i class="fas fa-user mr-2"></i>Client Portal
                                </a>
                                <a href="schedule-appointment-clean.html" class="block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-center hover:from-blue-700 hover:to-purple-700 transition-all">
                                    Get Started
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        `;
    }

    init() {
        // Insert navigation HTML
        document.addEventListener('DOMContentLoaded', () => {
            const navContainer = document.getElementById('navigation-placeholder');
            if (navContainer) {
                navContainer.innerHTML = this.getNavigationHTML();
                this.bindEvents();
            }
        });
    }

    bindEvents() {
        // Mobile menu toggle
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (mobileMenuButton && mobileMenu) {
            mobileMenuButton.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
                const icon = mobileMenuButton.querySelector('i');
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            });
        }

        // Mobile dropdown toggles
        const mobileDropdowns = document.querySelectorAll('.mobile-dropdown button');
        mobileDropdowns.forEach(button => {
            button.addEventListener('click', () => {
                const dropdown = button.nextElementSibling;
                const icon = button.querySelector('i');
                dropdown.classList.toggle('hidden');
                icon.classList.toggle('fa-chevron-down');
                icon.classList.toggle('fa-chevron-up');
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#main-navigation')) {
                mobileMenu?.classList.add('hidden');
                const icon = mobileMenuButton?.querySelector('i');
                if (icon) {
                    icon.classList.add('fa-bars');
                    icon.classList.remove('fa-times');
                }
            }
        });
    }
}

// Initialize navigation
new Navigation();