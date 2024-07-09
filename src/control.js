document.addEventListener('DOMContentLoaded', () => {
    const setButton = document.querySelector('button');
    const inputs = document.querySelectorAll('input');

    setButton.addEventListener('click', () => {
        const values = Array.from(inputs).map(input => input.value);
        const message = { type: 'control-data', data: values.join(';'), deviceId: 'esp8266' };

        console.log('Brauzerdan qabul qilindi:', message);

        const socket = window.socket;

        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(message));
            console.log('Yuborilgan xabar:', JSON.stringify(message));
        } else {
            socket.onopen = () => {
                socket.send(JSON.stringify(message));
                console.log('Yuborilgan xabar:', JSON.stringify(message));
            };

            socket.onerror = (error) => {
                console.error('WebSocket xatosi:', error);
            };
        }
    });
});
