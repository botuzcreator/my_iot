const express = require('express');
const path = require('path');
const WebSocket = require('ws');
const mysql = require('mysql2');
const devices = new Map();

const app = express();

// Middleware to ensure HTTPS
app.use((req, res, next) => {
  if (req.headers['x-forwarded-proto'] !== 'https') {
    const statusCode = req.method === 'POST' ? 307 : 301;
    return res.redirect(statusCode, `https://${req.headers.host}${req.url}`);
  }
  next();
});

// Connect to MySQL database
const db = mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
    return;
  }
  console.log('Connected to MySQL database.');
});

// Ensure the sensor_data table exists
db.query(`
  CREATE TABLE IF NOT EXISTS sensor_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sanaVaVaqt DATETIME,
    harorat FLOAT,
    namlik FLOAT,
    yoritilganlik FLOAT,
    nurlanish FLOAT,
    yoniqRang VARCHAR(50),
    ultHolati VARCHAR(50)
  )
`, err => {
  if (err) {
    console.error('Error creating table:', err.message);
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/src', express.static(path.join(__dirname, 'src')));

// Start HTTP server
const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`HTTP server running on port ${port}`);
});

// Setup WebSocket server
const wss = new WebSocket.Server({ server });

wss.on('connection', ws => {
  ws.on('message', message => {
    console.log('Received:', message);
    processMessage(ws, message);
  });

  ws.on('close', () => {
    console.log('Connection closed');
    devices.forEach((value, key) => {
      if (value === ws) {
        devices.delete(key);
        console.log(`Device ${key} disconnected`);
      }
    });
  });
});

function processMessage(ws, message) {
  try {
    const msg = JSON.parse(message);
    switch (msg.type) {
      case 'request-data':
        handleRequestData(ws);
        break;
      case 'control-data':
        handleControlData(msg);
        break;
      default:
        console.log('Unknown message type:', msg.type);
    }
  } catch (e) {
    console.error('Error parsing message:', e.message);
  }
}

function handleRequestData(ws) {
  const sql = 'SELECT DATE(sanaVaVaqt) as sana, AVG(harorat) as avgHarorat, AVG(nurlanish) as avgNurlanish FROM sensor_data GROUP BY DATE(sanaVaVaqt) ORDER BY DATE(sanaVaVaqt) DESC LIMIT 5';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error querying database:', err.message);
      ws.send(JSON.stringify({ error: err.message }));
      return;
    }
    ws.send(JSON.stringify(results));
  });
}

function handleControlData(msg) {
  if (devices.has(msg.deviceId)) {
    const deviceWs = devices.get(msg.deviceId);
    deviceWs.send(msg.data);
    console.log(`Sent message to device ${msg.deviceId}:`, msg.data);
  } else {
    console.log(`Device ${msg.deviceId} not found`);
  }
}

// Close the database connection when the server shuts down
process.on('exit', () => {
  db.end();
});
