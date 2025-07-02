<?php
$servername = "localhost";
$username = "hotproje_dhtuser";
$password = "Alert@2025";
$dbname = "hotproje_dht22";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

$sql = "SELECT * FROM dht22_data ORDER BY timestamp DESC LIMIT 50";
$result = $conn->query($sql);
?>
<!DOCTYPE html>
<html>
<head>
  <title>DHT22 Sensor Readings</title>
  <style>
    body { font-family: Arial; padding: 20px; }
    h2 { font-size: 24px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { padding: 10px; border: 1px solid #ddd; text-align: center; }
    th { background-color: #f2f2f2; }
  </style>
</head>
<body>
  <h2>DHT22 Sensor Readings (Last 50)</h2>
  <table>
    <tr>
      <th>Timestamp</th>
      <th>Temperature (°C)</th>
      <th>Humidity (%)</th>
    </tr>
    <?php
    if ($result->num_rows > 0) {
      while($row = $result->fetch_assoc()) {
        echo "<tr>
                <td>{$row['timestamp']}</td>
                <td>{$row['temperature']}</td>
                <td>{$row['humidity']}</td>
              </tr>";
      }
    } else {
      echo "<tr><td colspan='3'>No data</td></tr>";
    }
    ?>
  </table>
</body>
</html>
<?php $conn->close(); ?>
