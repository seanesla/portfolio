// Dynamic accent color by time
(function(){
  const h = new Date().getHours();
  const root = document.documentElement;
  // Use muted blues throughout the day for an elegant aviation theme
  if (h < 6) root.style.setProperty('--accent', '#3E4E88');     // night navy
  else if (h < 12) root.style.setProperty('--accent', '#516091'); // day navy
  else if (h < 18) root.style.setProperty('--accent', '#6A7CB6'); // afternoon navy
  else root.style.setProperty('--accent', '#364269');             // evening navy
})();

// Custom cursor follow
(function(){
  const cursor = document.querySelector('.custom-cursor');
  let cx = 0, cy = 0, ticking = false;

  document.addEventListener('mousemove', e => {
    cx = e.clientX;
    cy = e.clientY;
    if(!ticking) {
      ticking = true;
      requestAnimationFrame(() => {
        cursor.style.transform = `translate(${cx}px, ${cy}px)`;
        ticking = false;
      });
    }
  }, { passive: true });
})();

// Hero parallax effect
(function(){
  const hero = document.querySelector('.hero');
  if(!hero) return;

  const baseBgX = 50; // CSS center X
  const baseBgY = 20; // CSS initial Y offset

  let mx = 0, my = 0, rafPending = false;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    if(!rafPending){
      rafPending = true;
      requestAnimationFrame(() => {
        const x = (mx / window.innerWidth - 0.5) * 10;
        const y = (my / window.innerHeight - 0.5) * 10;
        hero.style.backgroundPosition = `${baseBgX + x}% ${baseBgY + y}%`;
        rafPending = false;
      });
    }
  }, { passive: true });
})();

// Fade-in projects on scroll
(function(){
  const projects = document.querySelectorAll('.project');
  if (!projects.length) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.1 });

    projects.forEach(p => observer.observe(p));
  } else {
    // Fallback: immediately reveal projects for browsers without IntersectionObserver
    projects.forEach(p => p.classList.add('visible'));
  }
})();

// Fill skill bars
(function(){
  const skillBars = document.querySelectorAll('.fill');
  skillBars.forEach(bar => {
    const fill = bar.getAttribute('data-fill');
    bar.style.width = fill;
  });
})();

// Scroll progress bar
(function(){
  const progress = document.getElementById('progress');
  if(!progress) return;

  let lastScroll = 0;
  let scheduled = false;

  window.addEventListener('scroll', () => {
    lastScroll = window.scrollY;
    if(!scheduled){
      scheduled = true;
      requestAnimationFrame(() => {
        const height = document.body.scrollHeight - window.innerHeight;
        const pct = (lastScroll / height) * 100;
        progress.style.width = pct + '%';
        scheduled = false;
      });
    }
  }, { passive: true });
})();

// Theme toggle moved to inline script in index.html

// NCAS Poster Modal
(function(){
  const ncasCard = document.getElementById('ncas-card');
  const modal = document.getElementById('ncas-poster-modal');
  const closeBtn = modal.querySelector('.close');
  if(ncasCard && modal && closeBtn) {
    ncasCard.style.cursor = 'pointer';
    ncasCard.addEventListener('click', () => {
      modal.style.display = 'block';
    });
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
    modal.addEventListener('click', e => {
      if(e.target === modal) modal.style.display = 'none';
    });
  }
})();

// Easter egg
(function(){
  const trigger = document.getElementById('easter-trigger');
  const egg = document.getElementById('easter-egg');
  trigger.addEventListener('click', () => egg.classList.toggle('hidden'));
})();

// Immediately execute typing animation
(function() {
  const words = ['Pilot.', 'NCAS Alum.', 'AT3 Participant.'];
  let wordIndex = 0;
  let charIndex = 0;
  
  // Run this on page load
  function startTyping() {
    // console.log('Starting typing animation');
    const span = document.querySelector('.typing-dynamic');
    if (!span) {
      // console.error('Typing span not found!');
      return;
    }
    
    span.textContent = '';
    
    function type() {
      const word = words[wordIndex];
      span.textContent = word.substring(0, charIndex + 1);
      charIndex++;
      
      if (charIndex < word.length) {
        span.classList.add('typing');
        setTimeout(type, 150);
      } else {
        span.classList.remove('typing');
        setTimeout(erase, 2000);
      }
    }
    
    function erase() {
      const word = words[wordIndex];
      charIndex--;
      span.textContent = word.substring(0, charIndex);
      
      if (charIndex > 0) {
        span.classList.add('typing');
        setTimeout(erase, 80);
      } else {
        span.classList.remove('typing');
        wordIndex = (wordIndex + 1) % words.length;
        setTimeout(type, 500);
      }
    }
    
    // Start the animation
    type();
  }
  
  // Try to start immediately
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startTyping);
  } else {
    startTyping();
  }
})();
