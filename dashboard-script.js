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
    const aiChatButton = document.getElementById('aiChatButton');
    const logoutButton = document.getElementById('logoutButton');
    const customCameraThumbnailDiv = document.getElementById('customCameraThumbnail');
    const cameraFeedsDiv = document.getElementById('cameraFeeds');
    // initialize chat UI
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');
    const chatUI = document.getElementById('chatUi');
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
                    table.innerHTML = '<tr><td colspan="3" style="color: white">No sensor data detected</td></tr>';
                    return;
                }

                // display latest 3 readings from sensor
                // i < 4 because the first row might be the table header/metadata
                for (let i = 0; i < 4 && i < rows.length; i++) {
                    const cells = rows[i].querySelectorAll('td');
                    // only process table rows that have 3 cells (time, measurement1, measurement2)
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
                // if gas is detected, css will color the output red based on class
                const statusClass = cells[1].classList.contains('gas') ? 'gas' : 'no-gas';
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
        // connect close full screen functionality with the X button
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

    // list of functions to be updated every 60s and on initializing dashboard
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

    /**************************** genai testing code block ****************************/
    // function to send and receive messages (placeholder, to be filled)
    aiChatButton.addEventListener('click', () => {
        const sidebar = document.querySelector('.sidebar');
        const allSidebarChildren = sidebar.children;
        
        // show all other sidebar content and hide chat
        if (chatUI.classList.contains('active')) {
            chatUI.classList.remove('active');
            for (let child of allSidebarChildren) {
                if (child.id !== 'chatUi') {
                    child.style.display = 'block';
                }
            }
        } else { // hide all other sidebar content and show chat
            for (let child of allSidebarChildren) {
                if (child.id !== 'chatUi') {
                    child.style.display = 'none';
                }
            }
            chatUI.classList.add('active');
            
            // if chat empty, give welcome message
            if (chatMessages.children.length === 0) {
                displayMessage('Hello! I am an AI assistant that can provide insights on sensor & camera data!', 'ai');
            }
            
            setTimeout(() => {
                chatInput.focus();
            }, 100);
        }
    });

	// when user presses enter on text input box update chat UI and send prompt to LLM
    chatInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && chatInput.value.trim()) {
            const userMessage = chatInput.value.trim();
            displayMessage(userMessage, 'user');
            sendChatMessage(userMessage);
            chatInput.value = '';
        }
    });

    function displayMessage(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${sender}`;
        
        // format and color output for readability
        const senderStyles = {
            user: { label: 'You', color: 'lightgreen' },
            ai: { label: 'AI Assistant', color: 'deepskyblue' },
            system: { label: 'System', color: 'white' }
        };
        const senderInfo = senderStyles[sender] || senderStyles.system;
        const senderLabel = `<span style="color: ${senderInfo.color};">${senderInfo.label}</span>`;
        messageElement.innerHTML = `<strong>${senderLabel}:</strong> ${message}`;
        chatMessages.appendChild(messageElement);
        
        // blank line for spacing
        const spacerElement = document.createElement('div');
        spacerElement.style.height = '5px';
        chatMessages.appendChild(spacerElement);
        // scroll as new chat messages are added
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function sendChatMessage(message) {
        try {
            displayMessage('Thinking...', 'system');
            // ollama API endpoint
            const response = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: "granite3.1-moe:1b",
                    prompt: `You are a wildfire prevention AI assistant.
                    You help analyze sensor data, camera feeds, and provide guidance on fire prevention.
                    Current context: The user is monitoring wildfire conditions through various sensors and camera feeds.

User question: ${message}

Response:`,
                    stream: false,
                    // can reduce num_predict or adjust temperature for faster or more focused responses
                    options: {
                        temperature: 0.7,
                        num_predict: 200
                    }
                })
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            // remove thinking indicator and output response
            const systemMessages = chatMessages.querySelectorAll('.chat-message.system');
            const lastSystemMessage = systemMessages[systemMessages.length - 1];
            if (lastSystemMessage && lastSystemMessage.textContent.includes('Thinking...')) {
                lastSystemMessage.remove();
            }
            displayMessage(data.response || 'No response received', 'ai');
            
        } catch (error) {
            // remove thinking indicator
            const systemMessages = chatMessages.querySelectorAll('.chat-message.system');
            const lastSystemMessage = systemMessages[systemMessages.length - 1];
            if (lastSystemMessage && lastSystemMessage.textContent.includes('Thinking...')) {
                lastSystemMessage.remove();
            }
            // check if message failed to reach llm due to CORS error
            if (error.message.includes('fetch')) {
                displayMessage('Connection error: Make sure Ollama is running and CORS is enabled.', 'system');
            } else {
                displayMessage('Sorry, im having trouble connecting to the AI service. Please try again.', 'system');
            }
        }
    }
    /**************************** genai testing code block ****************************/
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
