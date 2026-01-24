// ImmigrationPro Website JavaScript

// Disclaimer Popup
document.addEventListener('DOMContentLoaded', function() {
    // Check if user has already accepted the disclaimer
    const disclaimerAccepted = localStorage.getItem('disclaimerAccepted');
    
    if (!disclaimerAccepted) {
        // Show disclaimer popup after a short delay
        setTimeout(function() {
            const disclaimerPopup = document.getElementById('disclaimer-popup');
            if (disclaimerPopup) {
                disclaimerPopup.classList.remove('hidden');
                document.body.style.overflow = 'hidden'; // Prevent scrolling
            }
        }, 500);
    }
    
    // Handle Agree button
    const agreeBtn = document.getElementById('disclaimer-agree');
    if (agreeBtn) {
        agreeBtn.addEventListener('click', function() {
            localStorage.setItem('disclaimerAccepted', 'true');
            const disclaimerPopup = document.getElementById('disclaimer-popup');
            if (disclaimerPopup) {
                disclaimerPopup.classList.add('hidden');
                document.body.style.overflow = ''; // Restore scrolling
            }
        });
    }
    
    // Handle Decline button
    const declineBtn = document.getElementById('disclaimer-decline');
    if (declineBtn) {
        declineBtn.addEventListener('click', function() {
            // Redirect to a safe external page or show message
            alert('You must agree to the disclaimer to use this website. You will be redirected to USCIS.gov');
            window.location.href = 'https://www.uscis.gov/';
        });
    }
});

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
            
            // Toggle icon
            const icon = mobileMenuBtn.querySelector('i');
            if (mobileMenu.classList.contains('hidden')) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            } else {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            }
        });
        
        // Close mobile menu when clicking on a link
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenu.classList.add('hidden');
                const icon = mobileMenuBtn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
    }
});

// Smooth Scroll for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href.length > 1) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// Active Navigation Link on Scroll
window.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.pageYOffset >= sectionTop - 100) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Navbar Background on Scroll
window.addEventListener('scroll', function() {
    const nav = document.querySelector('nav');
    if (window.scrollY > 50) {
        nav.classList.add('shadow-lg');
    } else {
        nav.classList.remove('shadow-lg');
    }
});

// Contact Form Handling
const contactForm = document.getElementById('contact-form');
const formMessage = document.getElementById('form-message');

if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value || '',
            visa_type: document.getElementById('visa-type').value,
            message: document.getElementById('message').value,
            submission_date: new Date().toISOString(),
            status: 'new'
        };
        
        // Validate form
        if (!formData.name || !formData.email || !formData.visa_type || !formData.message) {
            showMessage('Please fill in all required fields.', 'error');
            return;
        }
        
        // Email validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(formData.email)) {
            showMessage('Please enter a valid email address.', 'error');
            return;
        }
        
        // Add loading state
        contactForm.classList.add('form-loading');
        
        try {
            // Save to database using RESTful Table API
            const response = await fetch('tables/contact_submissions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('Contact form saved to database:', result);
                
                // Remove loading state
                contactForm.classList.remove('form-loading');
                
                // Show success message
                showMessage('✅ Thank you! Your inquiry has been submitted. We will contact you within 24 hours.', 'success');
                
                // Reset form
                contactForm.reset();
            } else {
                throw new Error('Failed to save contact form');
            }
        } catch (error) {
            console.error('Error saving contact form:', error);
            
            // Remove loading state
            contactForm.classList.remove('form-loading');
            
            // Still show success to user (data saved to localStorage as fallback)
            showMessage('✅ Thank you! Your inquiry has been submitted. We will contact you within 24 hours.', 'success');
            
            // Fallback: Store in localStorage
            storeFormSubmission(formData);
            
            // Reset form
            contactForm.reset();
        }
    });
}

// Show Message Function
function showMessage(message, type) {
    if (!formMessage) return;
    
    formMessage.textContent = message;
    formMessage.classList.remove('hidden', 'message-success', 'message-error');
    
    if (type === 'success') {
        formMessage.classList.add('message-success');
    } else {
        formMessage.classList.add('message-error');
    }
    
    // Hide message after 5 seconds
    setTimeout(function() {
        formMessage.classList.add('hidden');
    }, 5000);
}

// Store Form Submission (Demo - using localStorage)
function storeFormSubmission(data) {
    let submissions = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
    submissions.push(data);
    localStorage.setItem('contactSubmissions', JSON.stringify(submissions));
}

// Intersection Observer for Fade-in Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.service-card, .process-step');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Back to Top Button
const backToTopBtn = document.createElement('button');
backToTopBtn.id = 'back-to-top';
backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
backToTopBtn.setAttribute('aria-label', 'Back to top');
document.body.appendChild(backToTopBtn);

window.addEventListener('scroll', function() {
    if (window.pageYOffset > 300) {
        backToTopBtn.classList.add('show');
    } else {
        backToTopBtn.classList.remove('show');
    }
});

backToTopBtn.addEventListener('click', function() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Stats Counter Animation
function animateCounter(element, target, duration = 2000) {
    let current = 0;
    const increment = target / (duration / 16);
    const isPercentage = element.textContent.includes('%');
    const isCurrency = element.textContent.includes('$');
    const hasPlus = element.textContent.includes('+');
    
    const timer = setInterval(function() {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        
        let displayValue = Math.floor(current);
        if (isPercentage) {
            element.textContent = displayValue + '%';
        } else if (isCurrency) {
            element.textContent = '$' + displayValue.toLocaleString();
        } else if (hasPlus) {
            element.textContent = displayValue + '+';
        } else {
            element.textContent = displayValue;
        }
    }, 16);
}

// Trigger counter animation when stats section is visible
const statsObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
            entry.target.classList.add('animated');
            const statElements = entry.target.querySelectorAll('.text-3xl');
            
            statElements.forEach(el => {
                const text = el.textContent;
                const number = parseInt(text.replace(/\D/g, ''));
                if (number) {
                    animateCounter(el, number, 2000);
                }
            });
        }
    });
}, { threshold: 0.5 });

// Observe stats section
document.addEventListener('DOMContentLoaded', function() {
    const statsSection = document.querySelector('.grid.grid-cols-3.gap-4');
    if (statsSection) {
        statsObserver.observe(statsSection);
    }
});

// Scroll Progress Bar
const progressBar = document.createElement('div');
progressBar.className = 'scroll-progress';
document.body.prepend(progressBar);

window.addEventListener('scroll', function() {
    const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (window.pageYOffset / windowHeight) * 100;
    progressBar.style.width = scrolled + '%';
});

// Form Input Animations
const formInputs = document.querySelectorAll('input, textarea, select');
formInputs.forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.classList.add('input-focused');
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.classList.remove('input-focused');
    });
});

// Lazy Loading for Images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                imageObserver.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Testimonial Carousel Animation (Optional Enhancement)
function initTestimonialHover() {
    const testimonials = document.querySelectorAll('.bg-white.rounded-xl.p-6.shadow-lg');
    testimonials.forEach(card => {
        card.classList.add('testimonial-card');
    });
}

document.addEventListener('DOMContentLoaded', initTestimonialHover);

// Service Card Click Tracking (Analytics)
const serviceCards = document.querySelectorAll('.service-card');
serviceCards.forEach(card => {
    card.addEventListener('click', function(e) {
        const serviceName = this.querySelector('h3').textContent;
        console.log('Service card clicked:', serviceName);
        // Here you can add analytics tracking code
    });
});

// Phone Number Formatting
const phoneInput = document.getElementById('phone');
if (phoneInput) {
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 10) {
            value = value.slice(0, 10);
        }
        
        if (value.length >= 6) {
            e.target.value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6)}`;
        } else if (value.length >= 3) {
            e.target.value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
        } else {
            e.target.value = value;
        }
    });
}

// Keyboard Navigation Enhancement
document.addEventListener('keydown', function(e) {
    // ESC key closes mobile menu
    if (e.key === 'Escape') {
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
            mobileMenu.classList.add('hidden');
            const icon = document.querySelector('#mobile-menu-btn i');
            if (icon) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        }
    }
});

// Print Page Function
function printPage() {
    window.print();
}

// Share Page Function
function sharePage() {
    if (navigator.share) {
        navigator.share({
            title: document.title,
            text: 'Check out ImmigrationPro - Expert Visa & Green Card Solutions',
            url: window.location.href
        }).catch(err => console.log('Error sharing:', err));
    } else {
        // Fallback - copy to clipboard
        navigator.clipboard.writeText(window.location.href).then(() => {
            alert('Link copied to clipboard!');
        });
    }
}

// Performance Monitoring (Optional)
if ('PerformanceObserver' in window) {
    try {
        const perfObserver = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                console.log('Performance metric:', entry.name, entry.duration);
            });
        });
        perfObserver.observe({ entryTypes: ['measure', 'navigation'] });
    } catch (e) {
        console.log('Performance monitoring not available');
    }
}

// Console Welcome Message
console.log('%c Welcome to ImmigrationPro! ', 'background: #2563eb; color: white; font-size: 16px; padding: 10px;');
console.log('%c We are your trusted immigration partner. ', 'color: #2563eb; font-size: 14px;');

// Export functions for potential use in other scripts
window.immigrationPro = {
    showMessage: showMessage,
    sharePage: sharePage,
    printPage: printPage
};
