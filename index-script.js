// save form elements to prevent repeated DOM queries
const cameraFeedsButton = document.getElementById('cameraFeedsButton');
const cameraFeedsDiv = document.getElementById('cameraFeeds');
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

// // fetch camera list and display feeds with fresh timestamps
// function fetchCameraFeeds() {
//     const timestamp = Date.now();
//     let imagesHtml = '';
//     CAMERA_NAMES.forEach(cameraName => {
//         imagesHtml += `
//         <div class="camera-container">
//             <img src="https://cameras.alertcalifornia.org/public-camera-data/Axis-${cameraName}/latest-thumb.jpg?t=${timestamp}">
//             <div class="camera-name">${cameraName}</div>
//         </div>
//         `;
//     });
//     cameraFeedsDiv.innerHTML = imagesHtml;
// }

// fetch camera list and display feeds with fresh timestamps
function fetchCameraFeeds() {
    const timestamp = Date.now();
    let imagesHtml = '';
    CAMERA_NAMES.forEach(cameraName => {
        imagesHtml += `
        <div class="camera-container" data-camera-name="${cameraName}">
            <img src="https://cameras.alertcalifornia.org/public-camera-data/Axis-${cameraName}/latest-thumb.jpg?t=${timestamp}" onclick="openFullscreen(${cameraName})">
            <div class="camera-name">${cameraName}</div>
        </div>
        `;
    });
    cameraFeedsDiv.innerHTML = imagesHtml;
}

function openFullscreen(cameraName) {
    // Retrieve the thumbnail element by its cameraName data attribute
    const thumbnail = document.querySelector(`[data-camera-name="${cameraName}"]`);

    // Set style to take full sidebar width
    thumbnail.style.width = '100%';
    thumbnail.style.height = '100vh'; // Set to the full viewport height
    thumbnail.style.position = 'fixed';
    thumbnail.style.top = '0';
    thumbnail.style.left = '0';

    // Hide other thumbnail elements
    const thumbnails = document.querySelectorAll('.camera-container');
    thumbnails.forEach(thumb => {
        if (thumb !== thumbnail) {
            thumb.style.display = 'none';
        }
    });
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

document.addEventListener('click', function(event) {
    const clicked = event.target;
    if (clicked.classList.contains('camera-container') && !clicked.contains(event.target)) {
        const fullscreenImage = clicked;
        fullscreenImage.style.width = 'auto';
        fullscreenImage.style.height = 'auto';
        fullscreenImage.style.position = '';
        fullscreenImage.style.top = '';
        fullscreenImage.style.left = '';
        // Re-show other thumbnails
        const allThumbnails = document.querySelectorAll('.camera-container');
        allThumbnails.forEach(thumb => thumb.style.display = 'block');
    }
});

// every 60 seconds update GUI with camera feeds
fetchCameraFeeds();
setInterval(fetchCameraFeeds, 60000);

// click on the cameraFeedsButton when the page loads so camera feeds displays by default when loading in
document.addEventListener('DOMContentLoaded', function() {
    cameraFeedsButton.click();
});