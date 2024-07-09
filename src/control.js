document.addEventListener('DOMContentLoaded', () => {
  const setButton = document.querySelector('#setButton');
  const inputs = document.querySelectorAll('input');

  setButton.addEventListener('click', () => {
    const values = Array.from(inputs).map(input => input.value);
    const message = { type: 'control-data', data: values.join(';'), deviceId: 'esp8266' };
    console.log('Brauzerdan qabul qilindi:', message);
    socket.send(JSON.stringify(message));
    console.log('Yuborilgan xabar:', JSON.stringify(message));
  });
});
