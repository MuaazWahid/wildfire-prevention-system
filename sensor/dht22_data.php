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

$temperature = $_GET['temperature'] ?? null;
$humidity = $_GET['humidity'] ?? null;

if ($temperature && $humidity) {
  $sql = "INSERT INTO dht22_data (temperature, humidity) VALUES ('$temperature', '$humidity')";
  if ($conn->query($sql) === TRUE) {
    echo "Data inserted successfully";
  } else {
    echo "Error: " . $conn->error;
  }
} else {
  echo "Invalid data";
}

$conn->close();
?>
