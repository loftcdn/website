
/* MEDIA BLOCK INJECTIONS */


    document.addEventListener('DOMContentLoaded', function() {
        // Initialize Media Blocks
        initMediaBlocks();

        // Handle Tab Visibility Changes
        handleTabVisibility();
    });

    /* Function to Initialize Media Blocks */
    function initMediaBlocks() {
        const mediaBlocks = document.querySelectorAll('.media-container[data-url]');
        mediaBlocks.forEach(mediaBlock => {
            const mediaUrl = mediaBlock.getAttribute('data-url');

            if (isCloudinaryImage(mediaUrl)) {
                // Handle Cloudinary Image
                injectCloudinaryImage(mediaBlock, mediaUrl);
            } else if (isVimeoVideo(mediaUrl)) {
                // Handle Vimeo Video
                fetchVimeoThumbnail(mediaUrl, mediaBlock);
            } else {
                console.warn(`Unsupported media type for URL: ${mediaUrl}`);
            }
        });
    }

    /* Helper Function to Check if URL is a Cloudinary Image */
    function isCloudinaryImage(url) {
        return url.includes('res.cloudinary.com') && /\.(jpg|jpeg|png|gif|webp)$/.test(url);
    }

    /* Helper Function to Check if URL is a Vimeo Video */
    function isVimeoVideo(url) {
        return url.includes('player.vimeo.com/video/');
    }

    /* Function to Inject Cloudinary Image */
    function injectCloudinaryImage(mediaBlock, imageUrl) {
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = 'Background Image';
        img.classList.add('media-image');
        img.loading = 'lazy';

        // Handle Image Load Event
        img.onload = () => {
            img.classList.add('loaded');
        };

        mediaBlock.appendChild(img);
    }

    /* Function to Fetch Vimeo Thumbnail and Inject Placeholder */
    function fetchVimeoThumbnail(vimeoUrl, mediaBlock) {
        // Check if thumbnail is cached in sessionStorage
        const cachedThumbnail = sessionStorage.getItem(vimeoUrl);
        if (cachedThumbnail) {
            injectVimeoPlaceholder(mediaBlock, cachedThumbnail);
            injectVimeoIframe(mediaBlock, vimeoUrl);
            return;
        }

        const oEmbedUrl = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(vimeoUrl)}`;

        fetch(oEmbedUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                const thumbnailUrl = data.thumbnail_url;
                sessionStorage.setItem(vimeoUrl, thumbnailUrl); // Cache the thumbnail
                injectVimeoPlaceholder(mediaBlock, thumbnailUrl);
                injectVimeoIframe(mediaBlock, vimeoUrl);
            })
            .catch(error => {
                console.error('Error fetching Vimeo thumbnail:', error);
                // Inject a default placeholder image on error
                injectVimeoPlaceholder(mediaBlock, 'https://via.placeholder.com/640x360?text=Video+Unavailable');
                injectVimeoIframe(mediaBlock, vimeoUrl);
            });
    }

    /* Function to Inject Vimeo Placeholder with Blurred Thumbnail */
    function injectVimeoPlaceholder(mediaBlock, thumbnailUrl) {
        const placeholder = document.createElement('div');
        placeholder.classList.add('placeholder');

        const img = document.createElement('img');
        img.src = thumbnailUrl;
        img.alt = 'Video Thumbnail';
        img.classList.add('thumbnail');

        placeholder.appendChild(img);
        mediaBlock.appendChild(placeholder);
    }

    /* Function to Inject Vimeo Iframe */
    function injectVimeoIframe(mediaBlock, vimeoUrl) {
        const iframe = document.createElement('iframe');
        iframe.src = vimeoUrl;
        iframe.frameBorder = '0';
        iframe.allow = 'autoplay; fullscreen; playsinline';
        iframe.allowFullscreen = true;
        iframe.classList.add('vimeo-iframe');
        iframe.title = 'Vimeo Video Player';
        iframe.setAttribute('aria-label', 'Vimeo Video Player');
        iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-presentation');

        mediaBlock.appendChild(iframe);

        // Initialize Vimeo Player and Control Playback
        const player = new Vimeo.Player(iframe);

        // Store the player instance for later control
        mediaBlock.player = player;

        // Ensure the player is muted
        player.setVolume(0).catch(error => {
            console.error('Error setting volume:', error);
        });

        // Hide the placeholder when the video is playing
        player.on('playing', function() {
            console.log('Player is playing.');
            iframe.classList.add('loaded');
            const placeholder = mediaBlock.querySelector('.placeholder');
            if (placeholder) {
                console.log('Placeholder found. Hiding it now.');
                // Optionally, add a slight delay before hiding the placeholder
                setTimeout(() => {
                    placeholder.classList.add('hide');
                }, 100); // Adjust delay as needed (in milliseconds)
            } else {
                console.log('Placeholder not found.');
            }
        });

        // Automatically play the video
        player.play().then(function() {
            console.log('Video playback started successfully.');
        }).catch(function(error) {
            console.error('Error attempting to play the video:', error);
        });
    }

    /* Function to Handle Tab Visibility Changes */
    function handleTabVisibility() {
        document.addEventListener('visibilitychange', function() {
            const mediaBlocks = document.querySelectorAll('.media-container[data-url]');

            if (document.visibilityState === 'hidden') {
                // Pause all playing Vimeo videos
                mediaBlocks.forEach(mediaBlock => {
                    if (mediaBlock.player) {
                        mediaBlock.player.pause().catch(error => {
                            console.error('Error pausing video:', error);
                        });
                    }
                });
            } else {
                // Resume playing videos that are in view
                mediaBlocks.forEach(mediaBlock => {
                    if (mediaBlock.player) {
                        // Check if the video is in view before playing
                        const rect = mediaBlock.getBoundingClientRect();
                        const inView = (
                            rect.top < (window.innerHeight || document.documentElement.clientHeight) &&
                            rect.bottom >= 0
                        );

                        if (inView) {
                            mediaBlock.player.play().catch(error => {
                                console.error('Error playing video:', error);
                            });
                        }
                    }
                });
            }
        });
    }


/* SWIPER STUFF */
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
