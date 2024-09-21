
/*script representing the swiper that currently works with vidzflow */
  let swiper = null;

  function initializeSwiper() {
    if (window.innerWidth > 767 && !swiper) {
      swiper = new Swiper(".swiper", {
        slidesPerView: 1.4,
        loop: true,
        centeredSlides: true,
        slideToClickedSlide: true,
        watchSlidesProgress: true, // Track progress for each slide
        speed: 800, // Increase transition speed to 800ms for smoother visual
        mousewheel: {
          invert: false, // Use true to reverse the direction
          sensitivity: 1, // Adjust sensitivity if needed
          releaseOnEdges: false, // Release slide on edge to allow page scrolling
          thresholdDelta: 50, // Minimum delta to trigger a slide change
        },
        keyboard: {
          enabled: true, // Enable keyboard navigation
          onlyInViewport: true, // Only work when the slider is in view
          pageUpDown: false, // Use arrow keys instead of Page Up/Down keys
        },
        on: {
          init: function () {
            // Ensure video in the active slide plays on load
            const activeSlide = this.slides[this.activeIndex];
            const activeIframe = activeSlide.querySelector('iframe');
            if (activeIframe) {
              activeIframe.addEventListener('load', function() {
                activeIframe.contentWindow.postMessage("playerPlay", "*");
              });
              // In case it's already loaded
              activeIframe.contentWindow.postMessage("playerPlay", "*");
            }
          },
          setTranslate: function () {
            this.slides.forEach((slide) => {
              const progress = slide.progress; // Get progress of each slide
              const scale = 1 - Math.abs(progress) * 0.2; // Adjust scale for non-active slides
              const minOpacity = 0.3; // Define a lower minimum opacity for non-active slides
              const opacity = Math.max(1 - Math.abs(progress) * 0.7, minOpacity); // Ensure opacity does not drop below minOpacity

              slide.style.transform = `scale(${scale})`;
              slide.style.opacity = opacity;
            });
          },
          transitionStart: function () {
            // Apply transitions for slide changes
            this.slides.forEach((slide) => {
              slide.style.transition = "transform 0.8s ease, opacity 0.8s ease"; // Match transition duration to speed
            });
          },
          transitionEnd: function () {
            // Reset transitions after slide change
            this.slides.forEach((slide) => {
              slide.style.transition = "";
              // Re-apply consistent scaling and opacity based on progress
              const progress = slide.progress;
              const scale = 1 - Math.abs(progress) * 0.2;
              const minOpacity = 0.3;
              const opacity = Math.max(1 - Math.abs(progress) * 0.7, minOpacity);

              slide.style.transform = `scale(${scale})`;
              slide.style.opacity = opacity;
            });
            // Ensure loop integrity
            this.updateSlidesClasses();
          },
          slideChange: function () {
            // Pause all videos first
            this.slides.forEach(slide => {
              const iframe = slide.querySelector('iframe');
              if (iframe) {
                iframe.contentWindow.postMessage("playerPause", "*");
              }
            });

            // Play video on the active slide
            const activeSlide = this.slides[this.activeIndex];
            const activeIframe = activeSlide.querySelector('iframe');
            if (activeIframe) {
              activeIframe.contentWindow.postMessage("playerPlay", "*");
            }

            // Update classes to ensure correct slide states
            this.updateSlidesClasses();
          }
        },
      });

      // Additional code to ensure active slide video plays on page load
      window.addEventListener('load', function() {
        const activeSlide = swiper.slides[swiper.activeIndex];
        const activeIframe = activeSlide.querySelector('iframe');
        if (activeIframe) {
          activeIframe.contentWindow.postMessage("playerPlay", "*");
        }
      });

      // Navigation buttons for next and previous slides
      document.querySelector('.swiper-thing-next').addEventListener('click', function() {
        swiper.slideNext(); // Move to the next slide
      });

      document.querySelector('.swiper-thing-prev').addEventListener('click', function() {
        swiper.slidePrev(); // Move to the previous slide
      });
    } else if (window.innerWidth <= 767 && swiper) {
      swiper.destroy(true, true); // Destroy swiper if window is resized smaller than 768px
      swiper = null; // Reset swiper instance
    }
  }

  // Initialize swiper based on window size
  initializeSwiper();

  // Re-initialize or destroy swiper on window resize
  window.addEventListener('resize', function() {
    initializeSwiper();
  });
