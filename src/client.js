// WebSocket serveringizning lokal IP manzilini kiriting
var socketUrl = 'wss://myiot-production.up.railway.app:443';
var socket = new WebSocket(socketUrl);

function connectWebSocket() {
  socket = new WebSocket(socketUrl);

  socket.onopen = function(event) {
    console.log('WebSocketga ulanildi.');
  };

  socket.onerror = function(error) {
    console.error('WebSocket xatosi:', error);
  };

  socket.onclose = function(event) {
    console.log('WebSocket ulanish yopildi. Qayta urinish boshlanmoqda...');
    // Ulanishni qayta tiklash uchun biroz vaqt kutamiz
    setTimeout(function() {
      connectWebSocket();
    }, 5000); // 5 soniyadan keyin qayta urinish
  };

  socket.onmessage = function(event) {
    console.log('Xabar turi:', typeof event.data);
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
        document.getElementById('param1').textContent = data[0] + ' '+'°C';
        document.getElementById('param2').textContent = data[1] + ' '+'%';
        document.getElementById('param3').textContent = data[2] + ' '+'lx';
        document.getElementById('param4').textContent = data[3] + ' '+'W/m²';
        document.getElementById('param5').textContent = data[4];
        document.getElementById('param6').textContent = data[5];
      };

      // Blob obyektini o'qishni boshlaymiz
      reader.readAsText(event.data);
    }
  };
}

connectWebSocket(); // WebSocketga ulanish funksiyasini chaqiramiz
