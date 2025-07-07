<?php
// Show errors for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo "Only POST method allowed.";
    exit;
}

$host = "localhost";
$user = "hotproje_gasuser";
$pass = "Alert@2025";
$db   = "hotproje_gas_data";

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    http_response_code(500);
    echo "Connection failed: " . $conn->connect_error;
    exit;
}

$digital = $_POST['digital'] ?? null;
$analog  = $_POST['analog'] ?? null;

if ($digital === null || $analog === null) {
    http_response_code(400);
    echo "Missing parameters: digital or analog";
    exit;
}

$sql = "INSERT INTO readings (gas_state, gas_value, timestamp) VALUES ('$digital', '$analog', NOW())";

if ($conn->query($sql) === TRUE) {
    echo "OK";
} else {
    http_response_code(500);
    echo "SQL Error: " . $conn->error;
}
$conn->close();
?>
