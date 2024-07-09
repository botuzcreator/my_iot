﻿// socket.js
window.socket = new WebSocket('ws://myiot-production.up.railway.app:8080');

socket.onopen = function() {
  console.log('WebSocketga ulanildi.');
};

socket.onerror = function(error) {
  console.error('WebSocket xatosi:', error);
};

socket.onclose = function() {
  console.log('WebSocket ulanish yopildi. Qayta urinish boshlanmoqda...');
  setTimeout(function() {
    socket = new WebSocket('ws://myiot-production.up.railway.app:8080');
  }, 5000);
};
