class PresentationApp {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = 15;
        this.slides = document.querySelectorAll('.slide');
        this.isFullscreen = false;
        
        this.init();
    }

    init() {
        this.createNavigationDots();
        this.bindEvents();
        this.updateSlideCounter();
        this.updateNavigationButtons();
        this.updateNavigationDots();
    }

    createNavigationDots() {
        const navDots = document.querySelector('.nav-dots');
        navDots.innerHTML = '';
        
        for (let i = 1; i <= this.totalSlides; i++) {
            const dot = document.createElement('div');
            dot.classList.add('nav-dot');
            if (i === 1) dot.classList.add('active');
            dot.addEventListener('click', () => this.goToSlide(i));
            navDots.appendChild(dot);
        }
    }

    bindEvents() {
        // Button navigation
        document.getElementById('nextBtn').addEventListener('click', () => this.nextSlide());
        document.getElementById('prevBtn').addEventListener('click', () => this.prevSlide());
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
        
        // Fullscreen toggle
        document.getElementById('fullscreenBtn').addEventListener('click', () => this.toggleFullscreen());
        
        // Touch/swipe support
        this.bindTouchEvents();
        
        // Prevent context menu on right click
        document.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    bindTouchEvents() {
        let startX = null;
        let startY = null;
        const minSwipeDistance = 50;

        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            if (startX === null || startY === null) return;

            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const deltaX = startX - endX;
            const deltaY = startY - endY;

            // Only respond to horizontal swipes
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
                if (deltaX > 0) {
                    // Swipe left - next slide
                    this.nextSlide();
                } else {
                    // Swipe right - previous slide
                    this.prevSlide();
                }
            }

            startX = null;
            startY = null;
        }, { passive: true });
    }

    handleKeydown(e) {
        switch (e.key) {
            case 'ArrowRight':
            case ' ':
            case 'Enter':
                e.preventDefault();
                this.nextSlide();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                this.prevSlide();
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.goToSlide(1);
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.goToSlide(this.totalSlides);
                break;
            case 'Home':
                e.preventDefault();
                this.goToSlide(1);
                break;
            case 'End':
                e.preventDefault();
                this.goToSlide(this.totalSlides);
                break;
            case 'f':
            case 'F':
                e.preventDefault();
                this.toggleFullscreen();
                break;
            case 'Escape':
                if (this.isFullscreen) {
                    this.exitFullscreen();
                }
                break;
            default:
                // Number keys for direct slide navigation
                const num = parseInt(e.key);
                if (num >= 1 && num <= 9) {
                    e.preventDefault();
                    if (num <= this.totalSlides) {
                        this.goToSlide(num);
                    }
                }
                break;
        }
    }

    nextSlide() {
        if (this.currentSlide < this.totalSlides) {
            this.goToSlide(this.currentSlide + 1);
        }
    }

    prevSlide() {
        if (this.currentSlide > 1) {
            this.goToSlide(this.currentSlide - 1);
        }
    }

    goToSlide(slideNumber) {
        if (slideNumber < 1 || slideNumber > this.totalSlides || slideNumber === this.currentSlide) {
            return;
        }

        // Remove active class from current slide
        const currentSlideElement = document.querySelector('.slide.active');
        if (currentSlideElement) {
            currentSlideElement.classList.remove('active');
            if (slideNumber > this.currentSlide) {
                currentSlideElement.classList.add('prev');
            }
        }

        // Add active class to new slide
        const newSlideElement = document.querySelector(`.slide[data-slide="${slideNumber}"]`);
        if (newSlideElement) {
            newSlideElement.classList.add('active');
            newSlideElement.classList.remove('prev');
        }

        // Clean up prev classes after transition
        setTimeout(() => {
            document.querySelectorAll('.slide.prev').forEach(slide => {
                slide.classList.remove('prev');
            });
        }, 600);

        this.currentSlide = slideNumber;
        this.updateSlideCounter();
        this.updateNavigationButtons();
        this.updateNavigationDots();
        this.announceSlideChange();
    }

    updateSlideCounter() {
        document.getElementById('currentSlide').textContent = this.currentSlide;
        document.getElementById('totalSlides').textContent = this.totalSlides;
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');

        prevBtn.disabled = this.currentSlide === 1;
        nextBtn.disabled = this.currentSlide === this.totalSlides;
    }

    updateNavigationDots() {
        document.querySelectorAll('.nav-dot').forEach((dot, index) => {
            dot.classList.toggle('active', index + 1 === this.currentSlide);
        });
    }

    announceSlideChange() {
        // For screen readers
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = `Slide ${this.currentSlide} of ${this.totalSlides}`;
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    toggleFullscreen() {
        if (!this.isFullscreen) {
            this.enterFullscreen();
        } else {
            this.exitFullscreen();
        }
    }

    enterFullscreen() {
        const element = document.documentElement;
        
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
        
        this.isFullscreen = true;
        this.updateFullscreenButton();
    }

    exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        
        this.isFullscreen = false;
        this.updateFullscreenButton();
    }

    updateFullscreenButton() {
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        const icon = fullscreenBtn.querySelector('i');
        
        if (this.isFullscreen) {
            icon.className = 'fas fa-compress';
            fullscreenBtn.title = 'Exit Fullscreen (F or Esc)';
        } else {
            icon.className = 'fas fa-expand';
            fullscreenBtn.title = 'Enter Fullscreen (F)';
        }
    }

    // Method to handle fullscreen change events
    handleFullscreenChange() {
        this.isFullscreen = !!(document.fullscreenElement || 
                              document.mozFullScreenElement || 
                              document.webkitFullscreenElement || 
                              document.msFullscreenElement);
        this.updateFullscreenButton();
    }

    // Method to get slide title for accessibility
    getSlideTitle(slideNumber) {
        const slideElement = document.querySelector(`.slide[data-slide="${slideNumber}"]`);
        if (slideElement) {
            const titleElement = slideElement.querySelector('.slide-title, .main-title, .cta-title');
            return titleElement ? titleElement.textContent : `Slide ${slideNumber}`;
        }
        return `Slide ${slideNumber}`;
    }

    // Method to add slide titles to dots for better accessibility
    addAccessibilityFeatures() {
        document.querySelectorAll('.nav-dot').forEach((dot, index) => {
            const slideNumber = index + 1;
            const slideTitle = this.getSlideTitle(slideNumber);
            dot.setAttribute('title', `Go to ${slideTitle}`);
            dot.setAttribute('aria-label', `Go to slide ${slideNumber}: ${slideTitle}`);
        });

        // Add ARIA labels to navigation buttons
        document.getElementById('prevBtn').setAttribute('aria-label', 'Previous slide');
        document.getElementById('nextBtn').setAttribute('aria-label', 'Next slide');
        document.getElementById('fullscreenBtn').setAttribute('aria-label', 'Toggle fullscreen');
    }

    // Method to handle window resize for responsive adjustments
    handleResize() {
        // Force a repaint to ensure proper sizing
        const presentation = document.querySelector('.presentation-container');
        presentation.style.height = `${window.innerHeight}px`;
    }

    // Auto-play functionality (optional)
    startAutoPlay(intervalMs = 10000) {
        this.autoPlayInterval = setInterval(() => {
            if (this.currentSlide < this.totalSlides) {
                this.nextSlide();
            } else {
                this.stopAutoPlay();
            }
        }, intervalMs);
    }

    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }

    // Method to export presentation state
    getState() {
        return {
            currentSlide: this.currentSlide,
            totalSlides: this.totalSlides,
            isFullscreen: this.isFullscreen
        };
    }

    // Method to restore presentation state
    setState(state) {
        if (state.currentSlide && state.currentSlide >= 1 && state.currentSlide <= this.totalSlides) {
            this.goToSlide(state.currentSlide);
        }
        if (state.isFullscreen && !this.isFullscreen) {
            this.enterFullscreen();
        }
    }
}

// Utility function to detect if device supports touch
function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}

// Utility function to add smooth scrolling behavior
function addSmoothScrolling() {
    document.documentElement.style.scrollBehavior = 'smooth';
}

// Initialize the presentation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the main presentation app
    const presentationApp = new PresentationApp();
    
    // Add accessibility features
    presentationApp.addAccessibilityFeatures();
    
    // Add smooth scrolling
    addSmoothScrolling();
    
    // Handle fullscreen change events
    document.addEventListener('fullscreenchange', () => presentationApp.handleFullscreenChange());
    document.addEventListener('mozfullscreenchange', () => presentationApp.handleFullscreenChange());
    document.addEventListener('webkitfullscreenchange', () => presentationApp.handleFullscreenChange());
    document.addEventListener('msfullscreenchange', () => presentationApp.handleFullscreenChange());
    
    // Handle window resize
    window.addEventListener('resize', () => presentationApp.handleResize());
    
    // Initial resize call
    presentationApp.handleResize();
    
    // Add touch device specific classes
    if (isTouchDevice()) {
        document.body.classList.add('touch-device');
    }
    
    // Add loading complete class for any CSS animations
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
    
    // Expose the presentation app to global scope for debugging
    window.presentationApp = presentationApp;
    
    // Add some helpful console messages
    console.log('🎯 SubZero Presentation Loaded!');
    console.log('⌨️  Keyboard shortcuts:');
    console.log('   → or Space/Enter: Next slide');
    console.log('   ←: Previous slide');
    console.log('   Home: First slide');
    console.log('   End: Last slide');
    console.log('   F: Toggle fullscreen');
    console.log('   1-9: Jump to slide number');
    console.log('📱 Touch: Swipe left/right to navigate');
});

// Handle any errors gracefully
window.addEventListener('error', (e) => {
    console.error('Presentation error:', e.error);
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});

// Add viewport meta tag if not present (for mobile optimization)
if (!document.querySelector('meta[name="viewport"]')) {
    const viewportMeta = document.createElement('meta');
    viewportMeta.name = 'viewport';
    viewportMeta.content = 'width=device-width, initial-scale=1.0, user-scalable=no';
    document.head.appendChild(viewportMeta);
}

// Prevent zoom on double tap for better presentation experience
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = new Date().getTime();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, { passive: false });

// Add performance monitoring
if ('performance' in window) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = window.performance.timing;
            const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
            console.log(`📊 Page load time: ${pageLoadTime}ms`);
        }, 0);
    });
}