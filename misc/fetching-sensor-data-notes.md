sensor data cant be accessed at link due to CORS limitations
workarounds:
- modify insert.php server request method, only POST?
- use CORS proxy
- modify CORS policy
- try and access data through the file instead of through link
- use curl command:
```
curl -i -X OPTIONS -H "Origin: http://127.0.0.1:3000" \
    -H 'Access-Control-Request-Method: POST' \
    -H 'Access-Control-Request-Headers: Content-Type, Authorization' \
    "https://hotprojects.cloud/sensor/index.php"
```
- use jsonp:
```
function jsonpRequest(url, callback) {
    const callbackName = 'jsonp_' + Math.random();
    window[callbackName] = function(data) {
        delete window[callbackName];
        console.log('Data received:', data);
        if (typeof callback === 'function') {
            callback(data);
        }
    };
    
    const script = document.createElement('script');
    script.src = `${url}?callback=${callbackName}`;
    document.body.appendChild(script);
}

// Usage
jsonpRequest('https://hotprojects.cloud/sensor/dht22_dashboard.php', function(data) {
    // Process the data received (data should be JSON-parsed)
    const dht22Data = JSON.parse(data);
    // dht22Data.rows now contains an array of sensor readings
    console.log(dht22Data.rows);
});
```