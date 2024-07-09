// WebSocket serverining URL manzilini kiriting
const socketUrl = 'wss://myiot-production.up.railway.app:8080';
let socket;

function connectWebSocket() {
    if (!socket || socket.readyState === WebSocket.CLOSED) {
        socket = new WebSocket(socketUrl);
    
        socket.onopen = function(event) {
            console.log('WebSocketga ulanildi.');
        };
    
        socket.onerror = function(error) {
            console.error('WebSocket xatosi:', error);
        };
    
        socket.onclose = function(event) {
            console.log('WebSocket ulanish yopildi. Qayta urinish boshlanmoqda...');
            setTimeout(connectWebSocket, 5000); // 5 soniyadan keyin qayta urinish
        };
    
        socket.onmessage = function(event) {
            console.log('Qabul qilingan xabar: ' + event.data);
            const data = event.data.split(';');
            console.log('Split qilingan ma\'lumotlar:', data);
            updateParameters(data);
        };
    }
}

function updateParameters(data) {
    document.getElementById('param1').textContent = data[0] + ' ' + '°C';
    document.getElementById('param2').textContent = data[1] + ' ' + '%';
    document.getElementById('param3').textContent = data[2] + ' ' + 'lx';
    document.getElementById('param4').textContent = data[3] + ' ' + 'W/m²';
    document.getElementById('param5').textContent = data[4];
    document.getElementById('param6').textContent = data[5];
}

connectWebSocket(); // WebSocketga ulanish funksiyasini chaqiramiz
