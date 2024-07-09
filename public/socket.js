const socket = new WebSocket('ws://myiot-production.up.railway.app:8080');

socket.onopen = function() {
  console.log('WebSocket connection established.');
};

socket.onerror = function(error) {
  console.error('WebSocket Error:', error);
};

socket.onclose = function() {
  console.log('WebSocket connection closed.');
};
