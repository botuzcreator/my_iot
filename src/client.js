// WebSocket serverining URL manzilini kiriting
const socketUrl = 'ws://iotmuz-production.up.railway.app:8080';
let socket;

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
        setTimeout(connectWebSocket, 5000); // 5 soniyadan keyin qayta urinish
    };

    socket.onmessage = function(event) {
        if (event.data instanceof Blob) {
            const reader = new FileReader();
            reader.onload = function() {
                const message = reader.result;
                console.log('Qabul qilingan xabar: ' + message);
                const data = message.split(';');
                console.log('Split qilingan ma\'lumotlar:', data);
                document.getElementById('param1').textContent = data[0] + ' ' + '°C';
                document.getElementById('param2').textContent = data[1] + ' ' + '%';
                document.getElementById('param3').textContent = data[2] + ' ' + 'lx';
                document.getElementById('param4').textContent = data[3] + ' ' + 'W/m²';
                document.getElementById('param5').textContent = data[4];
                document.getElementById('param6').textContent = data[5];
            };
            reader.readAsText(event.data);
        } else {
            const message = event.data.toString();
            console.log('Qabul qilingan xabar: ' + message);
            const data = message.split(';');
            console.log('Split qilingan ma\'lumotlar:', data);
            document.getElementById('param1').textContent = data[0] + ' ' + '°C';
            document.getElementById('param2').textContent = data[1] + ' ' + '%';
            document.getElementById('param3').textContent = data[2] + ' ' + 'lx';
            document.getElementById('param4').textContent = data[3] + ' ' + 'W/m²';
            document.getElementById('param5').textContent = data[4];
            document.getElementById('param6').textContent = data[5];
        }
    };
}

connectWebSocket(); // WebSocketga ulanish funksiyasini chaqiramiz

window.socket = socket; // Ulashni global o'zgaruvchiga saqlash
