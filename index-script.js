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

// fetch camera list and display feeds with fresh timestamps
function fetchCameraFeeds() {
    let imagesHtml = '';
    CAMERA_NAMES.forEach(cameraName => {
        imagesHtml += `
            <div class="camera-container">
                <img src="https://cameras.alertcalifornia.org/public-camera-data/Axis-${cameraName}/latest-thumb.jpg" alt="${cameraName}">
                <div class="camera-name">${cameraName}</div>
            </div>
        `;
    });
    cameraFeedsDiv.innerHTML = imagesHtml;
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

// every 60 seconds update GUI with camera feeds
fetchCameraFeeds();
setInterval(fetchCameraFeeds, 60000);

// click on the cameraFeedsButton when the page loads so camera feeds displays by default when loading in
document.addEventListener('DOMContentLoaded', function() {
    cameraFeedsButton.click();
});