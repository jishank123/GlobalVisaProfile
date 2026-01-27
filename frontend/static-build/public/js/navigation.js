/**
 * Navigation Enhancement Script
 * Handles mobile menu functionality and smooth scrolling
 */

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle Function
    function toggleMobileMenu() {
        const menu = document.getElementById('mobile-menu');
        const btn = document.getElementById('mobile-menu-btn');
        const icon = btn.querySelector('i');
        
        if (menu.classList.contains('hidden')) {
            menu.classList.remove('hidden');
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            menu.classList.add('hidden');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    }
    
    // Make toggleMobileMenu available globally
    window.toggleMobileMenu = toggleMobileMenu;
    
    // Close menu when clicking on a link
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
        const links = mobileMenu.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', function() {
                // Only close menu for anchor links, not route links
                if (this.getAttribute('href').startsWith('#')) {
                    toggleMobileMenu();
                }
            });
        });
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        const nav = document.querySelector('nav');
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        
        if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
            if (!nav.contains(e.target)) {
                toggleMobileMenu();
            }
        }
    });
    
    // Add active state to current page navigation
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || (currentPath === '/' && href === '#home')) {
            link.classList.add('text-primary', 'font-semibold');
            link.classList.remove('text-gray-700');
        }
    });
});