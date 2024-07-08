document.addEventListener('DOMContentLoaded', () => {
    const setButton = document.querySelector('button'); // SET tugmasini tanlash
    const inputs = document.querySelectorAll('input'); // Barcha inputlarni tanlash

    // WebSocket ulanishini e'lon qilish
    const socket = new WebSocket('ws://myiot-production.up.railway.app:8080'); // WebSocket server manzili

    socket.onopen = () => {
        console.log('WebSocketga ulanildi.');
    };

    socket.onerror = (error) => {
        console.error('WebSocket xatosi:', error);
    };

    setButton.addEventListener('click', () => {
        const values = Array.from(inputs).map(input => input.value); // Input qiymatlarini o'qib olish
        const message = { type: 'control-data', data: values.join(';'), deviceId: 'esp8266' }; // "control-data" va qiymatlarni birlashtirish

        // Konsolga chiqarish
        console.log('Brauzerdan qabul qilindi:', message);

        // Serverga xabar yuborish
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(message));
            console.log('Yuborilgan xabar:', JSON.stringify(message));
        } else {
            console.error('WebSocket ulanishi ochiq emas.');
        }
    });
});
