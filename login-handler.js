// Login button handler - separated from inline script to comply with CSP
document.addEventListener('DOMContentLoaded', function() {
  const loginFromMessageBtn = document.getElementById('loginFromMessage');
  if (loginFromMessageBtn) {
    loginFromMessageBtn.addEventListener('click', function() {
      const sidebar = document.getElementById('sidebar');
      const overlay = document.getElementById('overlay');
      sidebar.classList.add('open');
      overlay.classList.add('active');
      
      // Focus on the email input for better UX
      const loginEmail = document.getElementById('loginEmail');
      if (loginEmail) {
        setTimeout(() => loginEmail.focus(), 300);
      }
      
      // Add an animation to the login form to draw attention
      const loginForm = document.getElementById('loginForm');
      if (loginForm) {
        loginForm.classList.add('highlight-animation');
        setTimeout(() => loginForm.classList.remove('highlight-animation'), 1500);
      }
      
      // Ensure login form is visible (not signup)
      const signupForm = document.getElementById('signupForm');
      if (loginForm && signupForm) {
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
      }
    });
  }
  
  // Initialize click listener for all buttons with ripple effect
  const buttons = document.querySelectorAll('button');
  buttons.forEach(button => {
    button.addEventListener('click', function(e) {
      if (this.classList.contains('ripple-effect')) {
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        this.appendChild(ripple);
        
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        
        setTimeout(() => {
          ripple.remove();
        }, 600);
      }
    });
  });
});
