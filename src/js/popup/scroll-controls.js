/**
 * Scroll Controls Script
 * Adds enhanced scrolling functionality to the extension
 */

/**
 * Initialize scroll controls for easy page navigation
 */
function initScrollControls() {
  const scrollUpBtn = document.getElementById('scrollUpBtn');
  const scrollDownBtn = document.getElementById('scrollDownBtn');
  
  if (scrollUpBtn && scrollDownBtn) {
    // Scroll up button functionality
    scrollUpBtn.addEventListener('click', function() {
      scrollSmoothly(-300);
    });
    
    // Scroll down button functionality
    scrollDownBtn.addEventListener('click', function() {
      scrollSmoothly(300);
    });
    
    // Show/hide scroll buttons based on scroll position
    window.addEventListener('scroll', function() {
      const scrollPosition = window.scrollY || document.documentElement.scrollTop;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      
      // Only show up button when scrolled down a bit
      scrollUpBtn.style.display = scrollPosition > 100 ? 'flex' : 'none';
      
      // Only show down button when not at bottom
      scrollDownBtn.style.display = scrollPosition < maxScroll - 50 ? 'flex' : 'none';
    });
    
    // Hide both buttons initially and perform a check after a short delay
    scrollUpBtn.style.display = 'none';
    scrollDownBtn.style.display = 'none';
    
    // Initial check to set visibility
    setTimeout(() => {
      const event = new Event('scroll');
      window.dispatchEvent(event);
    }, 500);
    
    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
      if (document.activeElement.tagName !== 'TEXTAREA' && 
          document.activeElement.tagName !== 'INPUT') {
        if (e.key === 'ArrowUp') {
          scrollSmoothly(-100);
          e.preventDefault();
        } else if (e.key === 'ArrowDown') {
          scrollSmoothly(100);
          e.preventDefault();
        }
      }
    });
  }
}

/**
 * Scroll the page smoothly by a given amount
 * @param {number} distance - The distance to scroll (positive for down, negative for up)
 */
function scrollSmoothly(distance) {
  const currentPosition = window.scrollY || document.documentElement.scrollTop;
  const targetPosition = currentPosition + distance;
  
  window.scrollTo({
    top: targetPosition,
    behavior: 'smooth'
  });
}
