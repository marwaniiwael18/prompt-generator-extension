/**
 * UI Animations - Additional visual enhancements
 */

document.addEventListener('DOMContentLoaded', () => {
  // Apply hover effects to subscription plans
  const planCards = document.querySelectorAll('.plan-card');
  
  planCards.forEach(card => {
    const hoverEffect = document.createElement('div');
    hoverEffect.className = 'plan-hover-effect';
    card.appendChild(hoverEffect);
    
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      hoverEffect.style.setProperty('--x', `${x}px`);
      hoverEffect.style.setProperty('--y', `${y}px`);
      hoverEffect.classList.add('active');
    });
    
    card.addEventListener('mouseleave', () => {
      hoverEffect.classList.remove('active');
    });
  });

  // Apply typing animation to headers
  animateTyping();
  
  // Add subtle background animation
  addBackgroundAnimation();
  
  // Enhance button interactions
  enhanceButtons();
});

/**
 * Creates typing animation effect for key headers
 */
function animateTyping() {
  const headers = document.querySelectorAll('h1, .header h3');
  
  headers.forEach(header => {
    const originalText = header.innerText;
    if (header._animationApplied) return; // Prevent multiple animations
    
    header._animationApplied = true;
    header.style.opacity = '0';
    
    setTimeout(() => {
      header.style.opacity = '1';
      header.classList.add('fade-in');
    }, 300);
  });
}

/**
 * Adds subtle animated gradient to background elements
 */
function addBackgroundAnimation() {
  const featuredCards = document.querySelectorAll('.plan-card.featured');
  
  featuredCards.forEach(card => {
    card.style.position = 'relative';
    card.style.overflow = 'hidden';
    
    // Create gradient overlay
    const gradientOverlay = document.createElement('div');
    gradientOverlay.style.cssText = `
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(78, 84, 200, 0.1) 0%, transparent 70%);
      opacity: 0.7;
      pointer-events: none;
      z-index: 0;
    `;
    
    // Animated positioning
    let phase = 0;
    setInterval(() => {
      phase += 0.01;
      const x = 50 + Math.sin(phase) * 20;
      const y = 50 + Math.cos(phase * 1.3) * 20;
      gradientOverlay.style.top = `${y - 100}%`;
      gradientOverlay.style.left = `${x - 100}%`;
    }, 50);
    
    card.insertBefore(gradientOverlay, card.firstChild);
  });
}

/**
 * Enhances button interactions with subtle effects
 */
function enhanceButtons() {
  const buttons = document.querySelectorAll('button:not(.text-button):not(.close-btn):not(.close-modal)');
  
  buttons.forEach(button => {
    button.addEventListener('mouseover', () => {
      button.classList.add('button-hover');
    });
    
    button.addEventListener('mouseout', () => {
      button.classList.remove('button-hover');
    });
    
    button.addEventListener('mousedown', () => {
      button.classList.add('button-active');
    });
    
    button.addEventListener('mouseup', () => {
      button.classList.remove('button-active');
    });
    
    // Add pressed state management
    button.addEventListener('click', () => {
      if (!button.classList.contains('auth-btn') && 
          !button.id.includes('login') && 
          !button.id.includes('signup')) {
        button.classList.add('button-pressed');
        
        setTimeout(() => {
          button.classList.remove('button-pressed');
        }, 1000);
      }
    });
  });
  
  // Custom handling for the generate button which is the most important action
  const generateBtn = document.getElementById('generateBtn');
  if (generateBtn) {
    generateBtn.addEventListener('click', () => {
      // Only for visual effect - actual functionality is in popup.js
      // This just enhances the user experience
      const originalText = generateBtn.innerHTML;
      const loadingText = '<svg class="button-icon rotating" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg> Generating...';
      
      if (!generateBtn.dataset.isLoading) {
        generateBtn.dataset.isLoading = true;
        generateBtn.dataset.originalText = originalText;
        generateBtn.innerHTML = loadingText;
        
        // Reset button after the animation would have completed
        // This is just for the UI demo, actual functionality will take over
        setTimeout(() => {
          generateBtn.innerHTML = originalText;
          generateBtn.dataset.isLoading = false;
        }, 2000);
      }
    });
  }
}
