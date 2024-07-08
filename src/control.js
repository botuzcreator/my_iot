document.addEventListener('DOMContentLoaded', () => {
    const setButton = document.querySelector('button'); // SET tugmasini tanlash
    const inputs = document.querySelectorAll('input'); // Barcha inputlarni tanlash
  
    setButton.addEventListener('click', () => {
      const values = Array.from(inputs).map(input => input.value); // Input qiymatlarini o'qib olish
      const message = { type: 'control-data', data: values.join(';'), deviceId: 'esp8266' }; // "control-data" va qiymatlarni birlashtirish

      //konsolga chiqarish
      console.log('Brauzerdan qabul qilindi:', message);
      
  
      // WebSockets orqali serverga yuborish
      const socket = new WebSocket('ws://192.168.190.21:8080'); // WebSocket server manzili
      socket.onopen = () => {
        // Serverga xabar yuborish
        socket.send(JSON.stringify(message));
        console.log('Yuborilgan xabar:', JSON.stringify(message));
      };
  
      
  
      socket.onerror = (error) => {
        console.error('WebSocket xatosi:', error);
      };
    });
  });
  