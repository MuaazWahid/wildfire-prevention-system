<?php
$conn = new mysqli("localhost", "hotproje_gasuser", "Alert@2025", "hotproje_gas_data");
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
$result = $conn->query("SELECT * FROM readings ORDER BY timestamp DESC LIMIT 50");
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Gas Sensor Readings</title>
  <meta http-equiv="refresh" content="60">
  <style>
    body { font-family: Arial; background: #f9f9f9; padding: 20px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ccc; padding: 10px; text-align: center; }
    th { background-color: #eee; }
    .safe { color: green; }
    .alert { color: red; font-weight: bold; }
    .nav { margin-bottom: 20px; }
    .nav ul { list-style-type: none; padding: 0; }
    .nav li { display: inline; margin-right: 20px; }
    .nav a { text-decoration: none; font-weight: bold; }
  </style>
</head>
<body>

  <!-- 🔗 Navigation Links -->
  <div class="nav">
    <h1>Sensor Dashboards</h1>
    <ul>
      <li><a href="/sensor/index.php">Gas Sensor Dashboard</a></li>
      <li><a href="/sensor/dht22_dashboard.php">DHT22 Sensor Dashboard</a></li>
    </ul>
  </div>

  <hr>

  <!-- 🧪 Gas Sensor Table -->
  <h2>Gas Sensor Readings (Last 50)</h2>
  <table>
    <tr><th>Timestamp</th><th>Status</th></tr>
    <?php while($row = $result->fetch_assoc()): ?>
      <?php $status = $row['gas_state'] == 1 ? "No Gas" : "Gas Detected"; ?>
      <tr>
        <td><?= $row['timestamp'] ?></td>
        <td class="<?= $row['gas_state'] == 1 ? 'safe' : 'alert' ?>"><?= $status ?></td>
      </tr>
    <?php endwhile; ?>
  </table>

</body>
</html>
