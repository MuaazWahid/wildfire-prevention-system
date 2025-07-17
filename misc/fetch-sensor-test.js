let headers = new Headers();

headers.append('Content-Type', 'application/json');
headers.append('Accept', 'application/json');
headers.append('Access-Control-Allow-Origin', 'http://localhost:3000');
headers.append('Access-Control-Allow-Credentials', 'true');
headers.append('GET', 'POST', 'OPTIONS');

fetch('https://hotprojects.cloud/sensor/index.php', {
    mode: 'no-cors',
    credentials: 'include',
    method: 'POST',
    headers: headers
})
.then(response => response.json())
.then(json => console.log(json))
.catch(error => console.log('Failed: ' + error.message));
console.log("finished fetching")

fetch('https://hotprojects.cloud/sensor/index.php')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text(); // Fetch response as text
    })
    .then(html => {
        // Parse the HTML using DOMParser
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        // Select the table containing sensor data
        const sensorTable = doc.querySelector('table');
        if (!sensorTable) {
            console.error("Table with sensor data not found.");
            return;
        }
        // Function to convert a row to an object
        function rowToObject(row) {
            const cells = row.getElementsByTagName('td');
            return {
                timestamp: cells[0].textContent.trim(),
                status: cells[1].textContent.trim(),
            };
        }
        // Extract last 4 rows
        const sensorDataRows = Array.from(sensorTable.querySelectorAll('tbody tr')).slice(-4).map(rowToObject);
        console.log('Sensor Data (last 4 entries):', sensorDataRows);
    })
    .catch(error => console.error('Error fetching the page:', error));

// function jsonpRequest(url, callback) {
//     console.log("TESTING")
//     const callbackName = 'jsonp_' + Math.random();
//     window[callbackName] = function(data) {
//         delete window[callbackName];
//         console.log('Data received:', data);
//         if (typeof callback === 'function') {
//             callback(data);
//         }
//     };
    
//     const script = document.createElement('script');
//     script.src = `${url}?callback=${callbackName}`;
//     document.body.appendChild(script);
// }

// // Usage
// jsonpRequest('https://hotprojects.cloud/sensor/dht22_dashboard.php', function(data) {
//     // Process the data received (data should be JSON-parsed)
//     const dht22Data = JSON.parse(data);
//     // dht22Data.rows now contains an array of sensor readings
//     console.log("TESTING")
//     console.log(dht22Data.rows);
// });