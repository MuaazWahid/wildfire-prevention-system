// user credentials
const users = { 'user': 'pass', };
// save form elements to prevent repeated DOM queries
const loginForm = document.getElementById('loginForm');
const currentUser = document.getElementById('currentUser');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const errorMessageDiv = document.getElementById('errorMessage');
const successMessageDiv = document.getElementById('successMessage');
const loginContainerDiv = document.getElementById('loginContainer');
const mainAppDiv = document.getElementById('mainApp');

// handle form submission
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    
    // hide previous messages
    errorMessageDiv.style.display = 'none';
    successMessageDiv.style.display = 'none';
    
    // validate credentials
    if (users[username] && users[username] === password) {
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
    // using AllOrigins CORS proxy to accessing sensor data
    const PROXY_URL = 'https://api.allorigins.win/get?url=';
    const coordinatesDiv = document.getElementById('coordinates');
    
    const addIotButton = document.getElementById('addIotButton')
    const addCameraButton = document.getElementById('addCameraButton');
    const cameraFeedsButton = document.getElementById('cameraFeedsButton');
    const logoutButton = document.getElementById('logoutButton');

    const customCameraThumbnailDiv = document.getElementById('customCameraThumbnail');
    const cameraFeedsDiv = document.getElementById('cameraFeeds');
    
    // set leaflet map initial view (California, USA)
    const map = L.map('map').setView([37.3587, -121.9276], 11);
    // save current user action so that we can update GUI dashboard accordingly
    let currentAction = null;

    // intitialize leaflet and add OpenStreetMap tiles
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

    // logic for displaying coordinates when user wants to add custom camera/iot on map
    function updateCoordinates(latLng) {
        coordinatesDiv.style.left = (map.latLngToContainerPoint(latLng).x + 10) + 'px';
        coordinatesDiv.style.top = (map.latLngToContainerPoint(latLng).y + 10) + 'px';
        coordinatesDiv.innerText = 'Lat: ' + latLng.lat.toFixed(4) + ', Lon: ' + latLng.lng.toFixed(4);
        coordinatesDiv.style.display = 'block';
    }

    // fetch camera custom camera feed
    function fetchCustomCamera() {
        const timestamp = Date.now();
        customCameraThumbnailDiv.innerHTML = `
        <div class="camera-container">
            <img src="https://cameras.alertcalifornia.org/public-camera-data/Axis-Mission1/latest-thumb.jpg?t=${timestamp}" alt="Mission1">
            <div class="camera-name">Mission1</div>
        </div>
        `;
    }
    
    // fetch camera list and display feeds with fresh timestamps
    function fetchCameraFeeds() {
        const timestamp = Date.now();
        let imagesHtml = '';
        CAMERA_NAMES.forEach(cameraName => {
            imagesHtml += `
                <div class="camera-container">
                    <img src="https://cameras.alertcalifornia.org/public-camera-data/Axis-${cameraName}/latest-thumb.jpg?t=${timestamp}" alt="${cameraName}">
                    <div class="camera-name">${cameraName}</div>
                </div>
            `;
        });
        cameraFeedsDiv.innerHTML = imagesHtml;
    }

    // fetch and display sensor data
    function fetchSensorData(uri, tableId, parseRowFunction) {
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

    // call fetch sensor function with params for gas sensor and update GUI with gasSensor data
    function fetchGasSensorData() {
        fetchSensorData(
            // this website updates a mq2 (gas) sensor data every 60s in an html table format
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
    // and update GUI with temperature and humidity data
    function fetchTempHumidSensorData() {
        fetchSensorData(
            // this website updates a dht22 (temperature and humidity) sensor data every 60s in an html table format
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

    // logout functionality
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

    // Every 60 seconds update GUI with:
    // - custom camera thumbnail
    // - gas sensor data
    // - temperature and humidity sensor data
    // - camera feeds
    fetchCustomCamera();
    fetchGasSensorData();
    fetchTempHumidSensorData();
    fetchCameraFeeds();
    setInterval(fetchCustomCamera, 60000);
    setInterval(fetchGasSensorData, 60000);
    setInterval(fetchTempHumidSensorData, 60000);
    setInterval(fetchCameraFeeds, 60000);
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