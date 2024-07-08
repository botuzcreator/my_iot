const WebSocket = require('ws');

// WebSocket serverining URL manzilini kiriting
const socketUrl = 'ws://iotmuz-production.up.railway.app:8080';
let socket;

function connectWebSocket() {
  socket = new WebSocket(socketUrl);

  socket.on('open', function open() {
    console.log('WebSocketga ulanildi.');
  });

  socket.on('error', function error(err) {
    console.error('WebSocket xatosi:', err);
  });

  socket.on('close', function close() {
    console.log('WebSocket ulanish yopildi. Qayta urinish boshlanmoqda...');
    // Ulanishni qayta tiklash uchun biroz vaqt kutamiz
    setTimeout(connectWebSocket, 5000); // 5 soniyadan keyin qayta urinish
  });

  socket.on('message', function incoming(event) {
    // Agar xabar Blob obyekti bo'lsa, uni o'qish kerak
    if (event.data instanceof Blob) {
      // Blob obyektini o'qish uchun FileReader yaratamiz
      const reader = new FileReader();

      // FileReader o'qishni tugatganda ishga tushadigan hodisa
      reader.onload = function() {
        // O'qilgan ma'lumotni string sifatida olish
        const message = reader.result;
        console.log('Qabul qilingan xabar: ' + message);

        // Ma'lumotlarni parsing qilish
        const data = message.split(';');
        console.log('Split qilingan ma\'lumotlar:', data);

        // Ma'lumotlarni web sahifada ko'rsatish
        document.getElementById('param1').textContent = data[0] + ' ' + '°C';
        document.getElementById('param2').textContent = data[1] + ' ' + '%';
        document.getElementById('param3').textContent = data[2] + ' ' + 'lx';
        document.getElementById('param4').textContent = data[3] + ' ' + 'W/m²';
        document.getElementById('param5').textContent = data[4];
        document.getElementById('param6').textContent = data[5];
      };

      // Blob obyektini o'qishni boshlaymiz
      reader.readAsText(event.data);
    } else {
      const message = event.data.toString();
      console.log('Qabul qilingan xabar: ' + message);

      // Ma'lumotlarni parsing qilish
      const data = message.split(';');
      console.log('Split qilingan ma\'lumotlar:', data);

      // Ma'lumotlarni web sahifada ko'rsatish
      document.getElementById('param1').textContent = data[0] + ' ' + '°C';
      document.getElementById('param2').textContent = data[1] + ' ' + '%';
      document.getElementById('param3').textContent = data[2] + ' ' + 'lx';
      document.getElementById('param4').textContent = data[3] + ' ' + 'W/m²';
      document.getElementById('param5').textContent = data[4];
      document.getElementById('param6').textContent = data[5];
    }
  });
}

connectWebSocket(); // WebSocketga ulanish funksiyasini chaqiramiz
