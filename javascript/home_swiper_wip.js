
/* MEDIA BLOCK INJECTIONS */


    document.addEventListener('DOMContentLoaded', function() {
        // Initialize Media Blocks
        initMediaBlocks();

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

  

// Updated Swiper Code with Vimeo Play/Pause

let swiper = null;

function initializeSwiper() {
  if (window.innerWidth > 767 && !swiper) {
    swiper = new Swiper(".swiper", {
      slidesPerView: 1.4,
      loop: true,
      centeredSlides: true,
      slideToClickedSlide: true,
      watchSlidesProgress: true,
      speed: 800,
      mousewheel: {
        invert: false,
        sensitivity: 1,
        releaseOnEdges: false,
        thresholdDelta: 50,
      },
      keyboard: {
        enabled: true,
        onlyInViewport: true,
        pageUpDown: false,
      },
      on: {
        init: function () {
          // Play video in the active slide when Swiper initializes
          const activeSlide = this.slides[this.activeIndex];
          const activeIframe = activeSlide.querySelector('iframe');
          
          if (activeIframe) {
            const player = new Vimeo.Player(activeIframe);
            player.play().catch(function (error) {
              console.error('Error playing video:', error);
            });
          }
        },
        transitionStart: function () {
          // Optional: Apply any slide transition visual effects here
          this.slides.forEach((slide) => {
            slide.style.transition = "transform 0.8s ease, opacity 0.8s ease";
          });
        },
        transitionEnd: function () {
          // Reset transitions after slide change and ensure loop integrity
          this.slides.forEach((slide) => {
            slide.style.transition = "";
          });
          this.updateSlidesClasses();
        },
        slideChange: function () {
          // Pause all videos first
          this.slides.forEach((slide) => {
            const iframe = slide.querySelector('iframe');
            if (iframe) {
              const player = new Vimeo.Player(iframe);
              player.pause().catch(function (error) {
                console.error('Error pausing video:', error);
              });
            }
          });

          // Play video on the active slide
          const activeSlide = this.slides[this.activeIndex];
          const activeIframe = activeSlide.querySelector('iframe');
          if (activeIframe) {
            const player = new Vimeo.Player(activeIframe);
            player.play().catch(function (error) {
              console.error('Error playing video:', error);
            });
          }
        }
      },
    });

    // Ensure video plays on page load if the Swiper is already initialized
    window.addEventListener('load', function () {
      const activeSlide = swiper.slides[swiper.activeIndex];
      const activeIframe = activeSlide.querySelector('iframe');
      if (activeIframe) {
        const player = new Vimeo.Player(activeIframe);
        player.play().catch(function (error) {
          console.error('Error playing video:', error);
        });
      }
    });

    // Navigation buttons for next and previous slides
    document.querySelector('.swiper-thing-next').addEventListener('click', function () {
      swiper.slideNext();
    });

    document.querySelector('.swiper-thing-prev').addEventListener('click', function () {
      swiper.slidePrev();
    });
  } else if (window.innerWidth <= 767 && swiper) {
    swiper.destroy(true, true);
    swiper = null;
  }
}

// Initialize Swiper based on window size
initializeSwiper();

// Re-initialize or destroy Swiper on window resize
window.addEventListener('resize', function () {
  initializeSwiper();
});


