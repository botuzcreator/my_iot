const express = require('express');
const path = require('path');
const WebSocket = require('ws');
const mysql = require('mysql2');
const devices = new Map(); // Device'larni saqlash uchun Map

const app = express();

// MySQL bazasiga ulanish
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
  console.log('MySQL bazasiga ulandi.');
});

// sensor_data jadvalini yaratish
db.query(`CREATE TABLE IF NOT EXISTS sensor_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sanaVaVaqt DATETIME,
  harorat FLOAT,
  namlik FLOAT,
  yoritilganlik FLOAT,
  nurlanish FLOAT,
  yoniqRang VARCHAR(50),
  ultHolati VARCHAR(50)
)`, (err) => {
  if (err) {
    console.error('Error creating table:', err.message);
  }
});

// Statik fayllarni xizmat qilish uchun express.static'dan foydalanish
app.use(express.static(path.join(__dirname, 'public')));
app.use('/src', express.static(path.join(__dirname, 'src')));

// HTTP serverni yaratish
const server = app.listen(8080, () => {
  console.log('HTTP server 8080-portda ishga tushdi');
});

// WebSocket serverni yaratish va HTTP server bilan birgalikda ishlatish
const wss = new WebSocket.Server({ server });

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
    
    try {
        const msg = JSON.parse(message);
        
        // Agar xabar 'request-data' so'rovini o'z ichiga olsa va table.js dan kelgan bo'lsa
        if (msg.type === 'request-data') {
          // Ma'lumotlar bazasidan so'rov yuborish va natijalarni faqat so'rov yuborgan klientga qaytarish
          const sql = `SELECT DATE(sanaVaVaqt) as sana, AVG(harorat) as avgHarorat, AVG(nurlanish) as avgNurlanish FROM sensor_data GROUP BY DATE(sanaVaVaqt) ORDER BY DATE(sanaVaVaqt) DESC LIMIT 5`;
          db.query(sql, (err, results) => {
            if (err) {
              ws.send(JSON.stringify({ error: err.message }));
              return;
            }
            ws.send(JSON.stringify(results));
          });
        }
      } catch (e) {
        // Agar xabar JSON emas bo'lsa, uni barcha klientlarga yuborish
        wss.clients.forEach(function each(client) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(message);
          }
        });
      }

      try {
        const msg = JSON.parse(message);
    
        if (msg.type === 'control-data' && devices.has(msg.deviceId)) {
          console.log(`Qurilma ${msg.deviceId} uchun xabar : ${msg.data}`);
          const deviceWs = devices.get(msg.deviceId);
          if (deviceWs) {
            deviceWs.send(msg.data);  // Device'ga ma'lumot yuborish
            console.log(`Qurilma ${msg.deviceId} uchun xabar yuborildi.`);
          } else {
            console.log(`Device ${msg.deviceId} not found.`);
          }
        }
      } catch (e) {
        console.log('control data emas');
      }

    // Xabarni ajratish
    const messageText = message.toString();
    const data = messageText.split(';');
    if (data.length === 7) {
      const [harorat, namlik, yoritilganlik, nurlanish, yoniqRang, ultHolati, deviceId] = data;
      console.log(`Device ID: ${deviceId}`);
      // Device ID bilan bog'liq WebSocket'ni saqlab qo'yish
      // Agar device allaqachon ro'yxatdan o'tgan bo'lsa, uni qayta qo'shmaslik
      if (!devices.has(deviceId)) {
        // Device ID bilan bog'liq WebSocket'ni saqlab qo'yish
        devices.set(deviceId, ws);
        console.log(`Device registered: ${deviceId}`);
      } else {
        console.log(`Device ${deviceId} is already registered.`);
      }

      function getLocalDateTime() {
        const now = new Date();
        const offset = 5 * 60 * 60000; // GMT+5 uchun millisekundlarda vaqt farqi
        const localDateTime = new Date(now.getTime() + offset);
      
        const year = localDateTime.getUTCFullYear();
        const month = localDateTime.getUTCMonth() + 1; // Oylar 0 dan boshlanadi
        const day = localDateTime.getUTCDate();
        const hour = localDateTime.getUTCHours();
        const minute = localDateTime.getUTCMinutes();
        const second = localDateTime.getUTCSeconds();
      
        // Raqamlarni ikki xonali formatga olib kelish
        const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const formattedTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;
      
        return `${formattedDate} ${formattedTime}`;
      }
      
      const sanaVaVaqt = getLocalDateTime();
      console.log(sanaVaVaqt);

      // Qabul qilingan ma'lumotlarni ma'lumotlar bazasiga kiritish
      const sql = `INSERT INTO sensor_data (sanaVaVaqt, harorat, namlik, yoritilganlik, nurlanish, yoniqRang, ultHolati) VALUES (?, ?, ?, ?, ?, ?, ?)`;
      db.query(sql, [sanaVaVaqt, harorat, namlik, yoritilganlik, nurlanish, yoniqRang, ultHolati], (err, results) => {
        if (err) {
          return console.error('Error inserting data:', err.message);
        }
        console.log('Sensor ma\'lumotlari ma\'lumotlar bazasiga saqlandi.');
      });
    }
  });
});

// Server yopilganda ma'lumotlar bazasini yopish
process.on('exit', () => {
  db.end();
});
