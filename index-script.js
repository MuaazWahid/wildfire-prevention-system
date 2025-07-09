// save form elements to prevent repeated DOM queries
const cameraFeedsButton = document.getElementById('cameraFeedsButton');
const cameraFeedsDiv = document.getElementById('cameraFeeds');
let isFullscreen = false;
let currentFullscreenCamera = null;

// set leaflet map initial view (California, USA)
const map = L.map('map').setView([37.3587, -121.9276], 11);

// intitialize leaflet and add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: `
    &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors,
    <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a> |
    <a href="https://cameras.alertcalifornia.org">ALERTCalifornia</a> |
    <a href="https://alertcalifornia.org/terms-of-use/">UC San Diego</a>`
}).addTo(map);

// update camera feeds display
function fetchCameraFeeds() {
    let imagesHtml = '';
    CAMERA_NAMES.forEach(cameraName => {
        imagesHtml += `
        <div class="camera-container" data-camera-name="${cameraName}">
            <img src="https://cameras.alertcalifornia.org/public-camera-data/Axis-${cameraName}/latest-thumb.jpg?t=${Date.now()}">
            <div class="camera-name">${cameraName}</div>
        </div>
        `;
    });
    cameraFeedsDiv.innerHTML = imagesHtml;
}

function openFullscreen(cameraName) {
    if (isFullscreen) return; // prevent multiple fullscreen instances
    
    isFullscreen = true;
    currentFullscreenCamera = cameraName;
    
    // Create fullscreen container
    const fullscreenContainer = document.createElement('div');
    fullscreenContainer.className = 'fullscreen-camera';
    fullscreenContainer.innerHTML = `
        <div class="fullscreen-header">
            <span class="fullscreen-camera-name">${cameraName}</span>
            <button class="close-fullscreen" onclick="closeFullscreen()">×</button>
        </div>
        <img src="https://cameras.alertcalifornia.org/public-camera-data/Axis-${cameraName}/latest-thumb.jpg?t=${Date.now()}" 
             class="fullscreen-image" id="fullscreen-image">
    `;
    
    // Hide thumbnail grid and show fullscreen
    const thumbnailContainers = document.querySelectorAll('.camera-container');
    thumbnailContainers.forEach(container => container.style.display = 'none');
    
    cameraFeedsDiv.appendChild(fullscreenContainer);
    
    // Start updating the fullscreen image
    updateFullscreenImage();
}

function closeFullscreen() {
    if (!isFullscreen) return;
    
    isFullscreen = false;
    currentFullscreenCamera = null;
    
    // Remove fullscreen container
    const fullscreenContainer = document.querySelector('.fullscreen-camera');
    if (fullscreenContainer) {
        fullscreenContainer.remove();
    }
    
    // Show all thumbnails again
    const thumbnailContainers = document.querySelectorAll('.camera-container');
    thumbnailContainers.forEach(container => container.style.display = 'inline-block');
    
    // Refresh thumbnail feeds
    fetchCameraFeeds();
}

function updateFullscreenImage() {
    if (!isFullscreen || !currentFullscreenCamera) return;
    
    const fullscreenImage = document.getElementById('fullscreen-image');
    if (fullscreenImage) {
        const timestamp = Date.now();
        fullscreenImage.src = `https://cameras.alertcalifornia.org/public-camera-data/Axis-${currentFullscreenCamera}/latest-thumb.jpg?t=${timestamp}`;
    }
}

// logic for clicking on camera feeds button
cameraFeedsButton.addEventListener('click', function() {
    if (cameraFeedsDiv.style.display === 'none' || cameraFeedsDiv.style.display === '') {
        cameraFeedsDiv.style.display = 'block';
    } else {
        cameraFeedsDiv.style.display = 'none';
    }
});

// login button redirect functionality
document.getElementById('loginButton').addEventListener('click', function() {
    window.location.href = 'dashboard.html';
});

// click event listener for camera thumbnails
document.addEventListener('click', event => {
    const clicked = event.target;
    const cameraContainer = clicked.closest('.camera-container');
    
    if (cameraContainer && !isFullscreen) {
        const cameraName = cameraContainer.dataset.cameraName;
        openFullscreen(cameraName);
    }
});

// Escape key to close fullscreen
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && isFullscreen) {
        closeFullscreen();
    }
});

// Update images every 60 seconds
fetchCameraFeeds();
setInterval(() => {
    if (isFullscreen) {
        updateFullscreenImage();
    } else {
        fetchCameraFeeds();
    }
}, 60000);

// click on the cameraFeedsButton when the page loads so camera feeds are displayed by default when loading the site
document.addEventListener('DOMContentLoaded', function() {
    cameraFeedsButton.click();
});