const express = require('express');
const path = require('path');
const WebSocket = require('ws');
const mysql = require('mysql2');
const devices = new Map();

const app = express();

// Middleware to redirect HTTP to HTTPS
app.use((req, res, next) => {
  if (req.headers['x-forwarded-proto'] !== 'https') {
    const redirectUrl = `https://${req.headers.host}${req.url}`;
    if (req.method === 'POST') {
      return res.redirect(307, redirectUrl);
    } else {
      return res.redirect(301, redirectUrl);
    }
  }
  next();
});

// MySQL connection
const db = mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT
});

db.connect((err) => {
  if (err) {
    return console.error('Error connecting to MySQL:', err.message);
  }
  console.log('Connected to MySQL.');
});

// Create sensor_data table
const createTableQuery = `
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
`;
db.query(createTableQuery, (err) => {
  if (err) {
    console.error('Error creating table:', err.message);
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/src', express.static(path.join(__dirname, 'src')));

// Create HTTP server
const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`HTTP server running on port ${port}`);
});

// Create WebSocket server
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
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
}

function handleRequestData(ws) {
  const sql = `
    SELECT DATE(sanaVaVaqt) as sana, AVG(harorat) as avgHarorat, AVG(nurlanish) as avgNurlanish 
    FROM sensor_data 
    GROUP BY DATE(sanaVaVaqt) 
    ORDER BY DATE(sanaVaVaqt) DESC 
    LIMIT 5
  `;
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

function getLocalDateTime() {
  const now = new Date();
  const offset = 5 * 60 * 60000; // GMT+5
  const localDateTime = new Date(now.getTime() + offset);

  const year = localDateTime.getUTCFullYear();
  const month = (localDateTime.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = localDateTime.getUTCDate().toString().padStart(2, '0');
  const hour = localDateTime.getUTCHours().toString().padStart(2, '0');
  const minute = localDateTime.getUTCMinutes().toString().padStart(2, '0');
  const second = localDateTime.getUTCSeconds().toString().padStart(2, '0');

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

wss.on('connection', ws => {
  ws.on('message', message => {
    const messageText = message.toString();
    const data = messageText.split(';');
    if (data.length === 7) {
      const [harorat, namlik, yoritilganlik, nurlanish, yoniqRang, ultHolati, deviceId] = data;
      console.log(`Device ID: ${deviceId}`);

      if (!devices.has(deviceId)) {
        devices.set(deviceId, ws);
        console.log(`Device registered: ${deviceId}`);
      } else {
        console.log(`Device ${deviceId} is already registered.`);
      }

      const sanaVaVaqt = getLocalDateTime();
      console.log(sanaVaVaqt);

      const sql = `
        INSERT INTO sensor_data (sanaVaVaqt, harorat, namlik, yoritilganlik, nurlanish, yoniqRang, ultHolati) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      db.query(sql, [sanaVaVaqt, harorat, namlik, yoritilganlik, nurlanish, yoniqRang, ultHolati], (err) => {
        if (err) {
          return console.error('Error inserting data:', err.message);
        }
        console.log('Sensor data saved to the database.');
      });
    }
  });
});

// Close database connection on server exit
process.on('exit', () => {
  db.end();
});
