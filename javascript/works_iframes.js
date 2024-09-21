/* injecting and managing of iframes */
    document.addEventListener('DOMContentLoaded', function() {
        // Initialize Media Blocks
        initMediaBlocks();

        // Set up IntersectionObserver for Vimeo Videos
        initVideoObserver();

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
        mediaBlock.setAttribute('data-loaded', 'true');
    }

    /* Function to Fetch Vimeo Thumbnail and Inject Placeholder */
    function fetchVimeoThumbnail(vimeoUrl, mediaBlock) {
        // Check if thumbnail is cached in sessionStorage
        const cachedThumbnail = sessionStorage.getItem(vimeoUrl);
        if (cachedThumbnail) {
            injectVimeoPlaceholder(mediaBlock, cachedThumbnail);
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
            })
            .catch(error => {
                console.error('Error fetching Vimeo thumbnail:', error);
                // Inject a default placeholder image on error
                injectVimeoPlaceholder(mediaBlock, 'https://via.placeholder.com/640x360?text=Video+Unavailable');
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

    /* Function to Initialize IntersectionObserver for Vimeo Videos */
    function initVideoObserver() {
        const options = {
            root: null,
            rootMargin: '0px 0px 1000px 0px', // Adjust rootMargin as needed
            threshold: 0
        };

        const observer = new IntersectionObserver(handleIntersect, options);

        const mediaBlocks = document.querySelectorAll('.media-container[data-url]');
        mediaBlocks.forEach(mediaBlock => {
            if (isVimeoVideo(mediaBlock.getAttribute('data-url'))) {
                observer.observe(mediaBlock);
            }
        });
    }

    /* Handler for IntersectionObserver Entries */
    function handleIntersect(entries, observer) {
        entries.forEach(entry => {
            const mediaBlock = entry.target;
            const mediaUrl = mediaBlock.getAttribute('data-url');

            if (entry.isIntersecting) {
                // Video is entering the viewport
                if (mediaBlock.getAttribute('data-loaded') !== 'true') {
                    injectVimeoIframe(mediaBlock, mediaUrl);
                    mediaBlock.setAttribute('data-loaded', 'true');
                } else if (mediaBlock.player) {
                    // Resume playing if previously paused
                    mediaBlock.player.play().catch(error => {
                        console.error('Error attempting to play video:', error);
                    });
                }
            } else {
                // Video is exiting the viewport
                if (mediaBlock.player) {
                    mediaBlock.player.pause().catch(error => {
                        console.error('Error attempting to pause video:', error);
                    });
                }
            }
        });
    }

    /* Function to Inject Vimeo Iframe */
    function injectVimeoIframe(mediaBlock, vimeoUrl) {
        const iframe = document.createElement('iframe');
        iframe.src = vimeoUrl;
        iframe.frameBorder = '0';
        iframe.allow = 'autoplay; fullscreen';
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
        player.on('play', function() {
            iframe.classList.add('loaded');
            const placeholder = mediaBlock.querySelector('.placeholder');
            if (placeholder) {
                // Optionally, add a slight delay before hiding the placeholder
                setTimeout(() => {
                    placeholder.classList.add('hide');
                }, 100); // Adjust delay as needed (in milliseconds)
            }
        });

        // Automatically play the video
        player.play().catch(error => {
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
