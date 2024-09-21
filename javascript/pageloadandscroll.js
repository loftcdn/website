
/* animating in hero elements to fade and blur in*/
document.addEventListener("DOMContentLoaded", function() {
        // Delay the start of the animation by 0.5 seconds
        setTimeout(function() {
            // Select all elements that need to be animated (mobile-body, swiper-block, and hero-grid)
            const elementsToAnimate = document.querySelectorAll('.mobile-body, .swiper-block, .hero-grid');

            // Add the 'animate-in' class to each element
            elementsToAnimate.forEach(element => {
                element.classList.add('animate-in');
            });
        }, 500); // 500ms delay (0.5 seconds)
    });

/* ensuring the page scrolls to a section rather than jumping */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      const startPosition = window.pageYOffset;
      const targetPosition = targetElement.getBoundingClientRect().top + startPosition;
      const duration = 500; // 500ms for smooth scroll
      const startTime = performance.now();
      
      function scrollAnimation(currentTime) {
        const elapsed = currentTime - startTime;
        const easeOutQuad = elapsed / duration * (2 - elapsed / duration);
        window.scrollTo(0, startPosition + (targetPosition - startPosition) * easeOutQuad);
        if (elapsed < duration) {
          requestAnimationFrame(scrollAnimation);
        }
      }
      requestAnimationFrame(scrollAnimation);
    }
  });
});
