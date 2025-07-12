// this script handles the main dashboard of the wildfire prevention system
// it should start on a login screen and transition to the main dashboard

// save form elements to prevent repeated DOM queries
const loginForm = document.getElementById('loginForm');
const currentUser = document.getElementById('currentUser');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const errorMessageDiv = document.getElementById('errorMessage');
const successMessageDiv = document.getElementById('successMessage');
const loginContainerDiv = document.getElementById('loginContainer');
const mainAppDiv = document.getElementById('mainApp');

// display the login screen
loginForm.addEventListener('submit', function(e) {
    // dont reload page after sending login data
    e.preventDefault();
    const username = usernameInput.value.trim().toLowerCase();
    const password = passwordInput.value.trim();
    // hide previous messages (if there were any)
    errorMessageDiv.style.display = 'none';
    successMessageDiv.style.display = 'none';
    
    // validate credentials
    // check if username is valid, then check if password valid
    if (username === 'user' && password === 'pass' ) {
        successMessageDiv.textContent = 'Welcome, ' + username + '! Loading dashboard...';
        successMessageDiv.style.display = 'block';
        
        // save user session
        sessionStorage.setItem('currentUser', username);
        sessionStorage.setItem('loginTime', new Date().toISOString());
        
        // log into main app after 1 second
        setTimeout(() => {
            loginContainerDiv.style.display = 'none';
            mainAppDiv.style.display = 'block';
            currentUser.textContent = username;
            initializeMainApplication();
        }, 1000);
        
    } else {
        // login failed, so clear password text box and try again
        errorMessageDiv.textContent = 'Invalid username or password. Please try again.';
        errorMessageDiv.style.display = 'block';
        passwordInput.value = '';
        passwordInput.focus();
    }
});

// setup main dashboard GUI for user
function initializeMainApplication() {
    // save form elements to prevent repeated DOM queries
    const coordinatesDiv = document.getElementById('coordinates');
    const addIotButton = document.getElementById('addIotButton')
    const addCameraButton = document.getElementById('addCameraButton');
    const cameraFeedsButton = document.getElementById('cameraFeedsButton');
    const logoutButton = document.getElementById('logoutButton');
    const customCameraThumbnailDiv = document.getElementById('customCameraThumbnail');
    const cameraFeedsDiv = document.getElementById('cameraFeeds');
    
    // save current user action so that we can update GUI dashboard accordingly
    let currentAction = null;
    let isFullscreen = false;
    let currentFullscreenCamera = null;

    // intitialize leaflet and add OpenStreetMap tiles
    // set initial view to California, USA
    const map = L.map('map').setView([37.3587, -121.9276], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: `
        &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors,
        <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a> |
        <a href="https://cameras.alertcalifornia.org">ALERTCalifornia</a> |
        <a href="https://alertcalifornia.org/terms-of-use/">UC San Diego</a>`
    }).addTo(map);

    // function to add an IoT device to the map
    function addIotToMap(latLng) {
        var customIcon = L.icon({
            iconUrl: 'images/esp32.svg',
            iconSize: [40, 30],
            iconAnchor: [18, 25], // center iot relative to mouse
            popupAnchor: [2, -25] // center the popup if clicked
        });
        var iotMarker = L.marker(latLng, {icon: customIcon}).addTo(map);
        iotMarker.bindPopup('IoT @ ' + latLng.lat.toFixed(4) + ', ' + latLng.lng.toFixed(4)).openPopup();
    }
    
    // function to add a custom user installed camera to the map
    function addCameraToMap(latLng) {
        var customIcon = L.icon({
            iconUrl: 'images/red-camera.png',
            iconSize: [25, 25],
            iconAnchor: [15, 25], // center camera relative to mouse
            popupAnchor: [-2, -25] // center the popup if clicked
        });
        var cameraMarker = L.marker(latLng, {icon: customIcon}).addTo(map);
        cameraMarker.bindPopup('Camera @ ' + latLng.lat.toFixed(4) + ', ' + latLng.lng.toFixed(4)).openPopup();
    }

    // fetch and display sensor data on dashboard
    function fetchSensorData(uri, tableId, parseRowFunction) {
        // we are using a CORS proxy since browser will enforce CORS policy when executing javascript
        const PROXY_URL = 'https://api.allorigins.win/get?url=';
        fetch(PROXY_URL + encodeURIComponent(uri))
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(data.contents, 'text/html');
                // grab all sensor table rows
                const rows = doc.querySelectorAll('table tbody tr');
                const table = document.getElementById(tableId);
                // clear table
                table.innerHTML = '';

                if (rows.length === 0) {
                    console.error(`No sensor data detected for ${tableId}`);
                    table.innerHTML = '<tr><td colspan="3" style="color: white">No sensor data detected</td></tr>';
                    return;
                }

                // display latest 3 readings from sensor
                // i < 4 because the first row might be the table header/metadata
                for (let i = 0; i < 4 && i < rows.length; i++) {
                    const row = rows[i];
                    const cells = row.querySelectorAll('td');
                    if (cells.length >= 2) {
                        const newRow = parseRowFunction(cells);
                        table.appendChild(newRow);
                    }
                }
            })
            .catch(error => console.error(`Error fetching ${tableId} data:`, error));
    }

    // call fetch sensor function with params for gas sensor
    function fetchGasSensorData() {
        fetchSensorData(
            // this website streams an mq2 sensor html table every 60s
            'https://hotprojects.cloud/sensor/index.php',
            'gasSensorData',
            (cells) => {
                const timestamp = cells[0].textContent.trim();
                const status = cells[1].textContent.trim();
                const statusClass = cells[1].classList.contains('alert') ? 'alert' : 'safe';
                const analogValue = cells[2].textContent.trim();

                const newRow = document.createElement('tr');
                newRow.innerHTML = `
                    <td style="color: white">${timestamp}</td>
                    <td class="${statusClass}">${status}</td>
                    <td style="color: white">${analogValue}</td>
                `;
                return newRow;
            }
        );
    }

    // call fetch sensor function with params for temperature & humidity sensor
    function fetchTempHumidSensorData() {
        fetchSensorData(
            // this website streams an dht22 sensor html table every 60s
            'https://hotprojects.cloud/sensor/dht22_dashboard.php',
            'tempHumidSensorData',
            (cells) => {
                const timestamp = cells[0].textContent.trim();
                const temperature = cells[1].textContent.trim();
                const humidity = cells[2].textContent.trim();

                const newRow = document.createElement('tr');
                newRow.innerHTML = `
                    <td style="color: white">${timestamp}</td>
                    <td style="color: white">${temperature}</td>
                    <td style="color: white">${humidity}</td>
                `;
                return newRow;
            }
        );
    }

    // displays coordinates while placing custom camera/iot on map
    function updateCoordinates(latLng) {
        coordinatesDiv.style.left = (map.latLngToContainerPoint(latLng).x + 10) + 'px';
        coordinatesDiv.style.top = (map.latLngToContainerPoint(latLng).y + 10) + 'px';
        coordinatesDiv.innerText = 'Lat: ' + latLng.lat.toFixed(4) + ', Lon: ' + latLng.lng.toFixed(4);
        coordinatesDiv.style.display = 'block';
    }

    // logic for clicking on add iot button
    addIotButton.addEventListener('click', function() {
        currentAction = 'iot';
        map.on('mousemove', function(e) {
            updateCoordinates(e.latlng);
        });
        map.on('click', function(e) {
            addIotToMap(e.latlng);
            map.off('mousemove');
            map.off('click');
            currentAction = null;
            coordinatesDiv.style.display = 'none';
        });
    });

    // logic for clicking on add camera button
    addCameraButton.addEventListener('click', function() {
        currentAction = 'camera';
        map.on('mousemove', function(e) {
            updateCoordinates(e.latlng);
        });
        map.on('click', function(e) {
            addCameraToMap(e.latlng);
            map.off('mousemove');
            map.off('click');
            currentAction = null;
            coordinatesDiv.style.display = 'none';
        });
    });

    // logic for clicking on camera feeds button
    cameraFeedsButton.addEventListener('click', function() {
        if (cameraFeedsDiv.style.display === 'none' || cameraFeedsDiv.style.display === '') {
            cameraFeedsDiv.style.display = 'block';
        } else {
            cameraFeedsDiv.style.display = 'none';
        }
    });

    // logic for clicking on logout button
    logoutButton.addEventListener('click', function() {
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('loginTime');
        mainAppDiv.style.display = 'none';
        loginContainerDiv.style.display = 'block';
        // reset form
        usernameInput.value = '';
        passwordInput.value = '';
        errorMessageDiv.style.display = 'none';
        successMessageDiv.style.display = 'none';
    });

    // function to handle expanding a camera thumbnail
    function openFullscreen(cameraName) {
        if (isFullscreen) return; // prevent multiple fullscreen instances

        isFullscreen = true;
        currentFullscreenCamera = cameraName;
        const fullscreenContainer = document.createElement('div');
        fullscreenContainer.className = 'fullscreen-camera';
        fullscreenContainer.innerHTML = `
            <div class="fullscreen-header">
                <span class="fullscreen-camera-name">${cameraName}</span>
                <button class="close-fullscreen">X</button>
            </div>
            <img src="https://cameras.alertcalifornia.org/public-camera-data/Axis-${cameraName}/latest-frame.jpg?t=${Date.now()}" 
                class="fullscreen-image">
        `;
        // link close full screen functionality with the X button
        fullscreenContainer.querySelector('.close-fullscreen').addEventListener('click', closeFullscreen);
        
        // hide thumbnail grid and show fullscreen
        const thumbnailContainers = document.querySelectorAll('.camera-container');
        thumbnailContainers.forEach(container => container.style.display = 'none');
        cameraFeedsDiv.appendChild(fullscreenContainer);
    }

    // function to handle closing a fullscreen camera stream
    function closeFullscreen() {
        if (!isFullscreen) return;

        isFullscreen = false;
        currentFullscreenCamera = null;
        // remove fullscreen container
        const fullscreenContainer = document.querySelector('.fullscreen-camera');
        if (fullscreenContainer) {
            fullscreenContainer.remove();
        }
        // display all camera feeds
        const thumbnailContainers = document.querySelectorAll('.camera-container');
        thumbnailContainers.forEach(container => container.style.display = 'inline-block');
    }

    // update camera feeds display
    function fetchCameraFeeds() {
        closeFullscreen();
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
    
    // fetch camera custom camera stream
    function fetchCustomCamera() {
        closeFullscreen();
        customCameraThumbnailDiv.innerHTML = `
        <div class="camera-container" data-camera-name="Mission1">
            <img src="https://cameras.alertcalifornia.org/public-camera-data/Axis-Mission1/latest-thumb.jpg?t=${Date.now()}">
            <div class="camera-name">Mission1</div>
        </div>
        `;
    }

    // logic to make a camera fullscreen if clicking on a camera thumbnail
    document.addEventListener('click', event => {
        const clicked = event.target;
        const cameraContainer = clicked.closest('.camera-container');
        if (cameraContainer && !isFullscreen) {
            openFullscreen(cameraContainer.dataset.cameraName);
        }
    });

    // list of functions to be updated every 60s
    // and on initializing dashboard
    const functionsToUpdate = [
        fetchCustomCamera,
        fetchGasSensorData,
        fetchTempHumidSensorData,
        fetchCameraFeeds
    ];
    functionsToUpdate.forEach(func => setInterval(func, 60000));
    // display camera feeds on loading dashboard
    functionsToUpdate.forEach(func => func());
    cameraFeedsButton.click();
}

// auto-focus on username field
usernameInput.focus();
// check if user is already logged in
const loggedInUser = sessionStorage.getItem('currentUser');
if (loggedInUser) {
    loginContainerDiv.style.display = 'none';
    mainAppDiv.style.display = 'block';
    document.getElementById('currentUser').textContent = loggedInUser;
    // delay initialization to ensure DOM is ready
    setTimeout(initializeMainApplication, 100);
}