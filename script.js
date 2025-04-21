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
  document.addEventListener('mousemove', e => {
    cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  });
})();

// Hero parallax effect
(function(){
  const hero = document.querySelector('.hero');
  document.addEventListener('mousemove', e => {
    const x = (e.clientX / window.innerWidth - 0.5) * 10;
    const y = (e.clientY / window.innerHeight - 0.5) * 10;
    hero.style.backgroundPosition = `${50 + x}% ${50 + y}%`;
  });
})();

// Fade-in projects on scroll
(function(){
  const projects = document.querySelectorAll('.project');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.1 });
  projects.forEach(p => observer.observe(p));
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
  window.addEventListener('scroll', () => {
    const scroll = window.scrollY;
    const height = document.body.scrollHeight - window.innerHeight;
    const pct = (scroll / height) * 100;
    progress.style.width = pct + '%';
  });
})();

// Theme toggle
(function(){
  const btn = document.getElementById('toggle-theme');
  btn.addEventListener('click', () => {
    document.documentElement.toggleAttribute('data-theme', 'dark');
    btn.textContent = document.documentElement.hasAttribute('data-theme') ? '☀️' : '🌙';
  });
})();

// Easter egg
(function(){
  const trigger = document.getElementById('easter-trigger');
  const egg = document.getElementById('easter-egg');
  trigger.addEventListener('click', () => egg.classList.toggle('hidden'));
})();


