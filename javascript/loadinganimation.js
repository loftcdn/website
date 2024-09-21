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
