/**
 * UI Enhancements Script
 * Adds additional UI functionality beyond the core features
 */

document.addEventListener('DOMContentLoaded', function() {
  // Enhance visual elements
  enhanceUIElements();
  
  // Add animation effects
  addRippleEffect();
  
  // Add smooth transitions
  addSmoothTransitions();

  // Add responsive behaviors
  addResponsiveBehaviors();
});

/**
 * Enhance various UI elements with visual and interactive improvements
 */
function enhanceUIElements() {
  // Add shadow effect on scroll for sticky elements
  const header = document.querySelector('.header');
  if (header) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 10) {
        header.classList.add('elevated');
      } else {
        header.classList.remove('elevated');
      }
    });
  }
  
  // Focus effect for textarea
  const textareas = document.querySelectorAll('textarea');
  textareas.forEach(textarea => {
    textarea.addEventListener('focus', function() {
      this.parentElement.classList.add('focused');
    });
    
    textarea.addEventListener('blur', function() {
      this.parentElement.classList.remove('focused');
    });
  });
  
  // Enhance select dropdown
  const selects = document.querySelectorAll('select');
  selects.forEach(select => {
    select.addEventListener('change', function() {
      this.classList.add('selected');
    });
  });
  
  // Add hover effects to plan cards
  const planCards = document.querySelectorAll('.plan-card');
  planCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      planCards.forEach(c => c.classList.remove('active-hover'));
      this.classList.add('active-hover');
    });
    
    card.addEventListener('mouseleave', function() {
      this.classList.remove('active-hover');
    });
  });
  
  // Add copy animation
  const copyBtn = document.getElementById('copyBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', function() {
      const originalText = this.innerHTML;
      this.innerHTML = '<svg class="button-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Copied!';
      
      setTimeout(() => {
        this.innerHTML = originalText;
      }, 2000);
    });
  }
}

/**
 * Add ripple effect to buttons for better interaction feedback
 */
function addRippleEffect() {
  const buttons = document.querySelectorAll('.ripple-effect');
  
  buttons.forEach(button => {
    button.addEventListener('click', function(e) {
      const x = e.clientX - e.target.getBoundingClientRect().left;
      const y = e.clientY - e.target.getBoundingClientRect().top;
      
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      
      this.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });
}

/**
 * Add smooth transitions for UI elements
 */
function addSmoothTransitions() {
  // Smooth transition for output section
  const generateBtn = document.getElementById('generateBtn');
  const outputSection = document.querySelector('.output-section');
  
  if (generateBtn && outputSection) {
    generateBtn.addEventListener('click', function() {
      // This is just for the UI enhancement demo - actual functionality is in popup.js
      if (!this.classList.contains('demo-clicked')) {
        setTimeout(() => {
          outputSection.style.display = 'block';
          setTimeout(() => {
            outputSection.classList.add('visible');
          }, 10);
        }, 300);
        this.classList.add('demo-clicked');
      }
    });
  }
  
  // Smooth sidebar opening
  const menuBtn = document.getElementById('menuBtn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  const closeSidebarBtn = document.getElementById('closeSidebar');
  
  if (menuBtn && sidebar && overlay && closeSidebarBtn) {
    menuBtn.addEventListener('click', function() {
      sidebar.classList.add('open');
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
    
    closeSidebarBtn.addEventListener('click', function() {
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
      document.body.style.overflow = 'auto';
    });
    
    overlay.addEventListener('click', function() {
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
      document.body.style.overflow = 'auto';
    });
  }
  
  // Modal dialog smooth animations
  const modalTriggers = document.querySelectorAll('[data-modal]');
  modalTriggers.forEach(trigger => {
    trigger.addEventListener('click', function() {
      const modalId = this.dataset.modal;
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.add('visible');
        overlay.classList.add('active');
      }
    });
  });
  
  const closeModalButtons = document.querySelectorAll('.close-modal');
  closeModalButtons.forEach(button => {
    button.addEventListener('click', function() {
      const modal = this.closest('.modal');
      if (modal) {
        modal.classList.remove('visible');
        overlay.classList.remove('active');
      }
    });
  });
}

/**
 * Add responsive behaviors for different screen sizes and interactions
 */
function addResponsiveBehaviors() {
  // Adjust sidebar width based on screen size
  function adjustSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      if (window.innerWidth < 500) {
        sidebar.style.width = '100%';
      } else {
        sidebar.style.width = '320px';
      }
    }
  }
  
  window.addEventListener('resize', adjustSidebar);
  adjustSidebar();
  
  // Collapse subscription section on small screens
  const subscriptionHeader = document.querySelector('.subscription-section h3');
  if (subscriptionHeader) {
    subscriptionHeader.addEventListener('click', function() {
      if (window.innerWidth < 500) {
        const plans = this.nextElementSibling;
        if (plans) {
          plans.classList.toggle('collapsed');
          this.classList.toggle('collapsed');
        }
      }
    });
  }
  
  // Initialize scroll controls
  initScrollControls();
}