// socket.js
window.socket = new WebSocket('wss://myiot-production.up.railway.app:443');

socket.onopen = function() {
  console.log('WebSocketga ulanildi.');
};

socket.onerror = function(error) {
  console.error('WebSocket xatosi:', error);
};

socket.onclose = function() {
  console.log('WebSocket ulanish yopildi. Qayta urinish boshlanmoqda...');
  setTimeout(function() {
    window.socket = new WebSocket('wss://myiot-production.up.railway.app:443');
  }, 5000);
};
