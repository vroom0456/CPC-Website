import PhotoSwipeLightbox from 'https://unpkg.com/photoswipe@5/dist/photoswipe-lightbox.esm.js';

let lightbox;

export function initLightbox(photos) {
    if (lightbox) {
        lightbox.destroy();
    }

    // Map your API photos to PhotoSwipe format
    const pswpItems = photos.map(photo => ({
        src: photo.url, // High-res URL
        w: photo.width || 1920, // EXIF width from backend
        h: photo.height || 1080, // EXIF height from backend
        alt: photo.name,
        // Custom data for EXIF and Share
        camera: photo.cameraModel || 'Unknown Camera',
        shareUrl: photo.url
    }));

    lightbox = new PhotoSwipeLightbox({
        dataSource: pswpItems,
        pswpModule: () => import('https://unpkg.com/photoswipe@5/dist/photoswipe.esm.js'),
        zoom: true, // Enables pinch-to-zoom
        wheelToZoom: true,
        bgOpacity: 0.95,
    });

    // Add Custom "Share Image" Button to Lightbox Toolbar
    lightbox.on('uiRegister', function() {
        lightbox.pswp.ui.registerElement({
            name: 'share-button',
            order: 9,
            isButton: true,
            html: '<svg aria-hidden="true" class="pswp__icn" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>',
            onClick: (event, el) => {
                const currentPhoto = lightbox.pswp.currSlide.data;
                if (navigator.share) {
                    navigator.share({
                        title: 'College Photography Club',
                        text: 'Check out this photo!',
                        url: currentPhoto.shareUrl
                    }).catch(console.error);
                } else {
                    // Fallback to clipboard
                    navigator.clipboard.writeText(currentPhoto.shareUrl);
                    alert('Image link copied to clipboard!');
                }
            }
        });
    });

    // Add EXIF Data display at the bottom of the image
    lightbox.on('uiRegister', function() {
        lightbox.pswp.ui.registerElement({
            name: 'exif-indicator',
            order: 9,
            isButton: false,
            appendTo: 'wrapper',
            html: '',
            onInit: (el, pswp) => {
                pswp.on('change', () => {
                    const camera = pswp.currSlide.data.camera;
                    el.innerHTML = `<div style="position:absolute; bottom:20px; left:50%; transform:translateX(-50%); color:white; font-family:sans-serif; font-size:12px; background:rgba(0,0,0,0.6); padding:4px 12px; border-radius:20px;">📸 ${camera}</div>`;
                });
            }
        });
    });

    lightbox.init();
}

export function openLightboxAtIndex(index) {
    if (lightbox) {
        lightbox.loadAndOpen(index);
    }
}
