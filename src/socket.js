// socket.js
const socket = new WebSocket('wss://yourdomain.railway.app');

socket.onopen = function() {
  console.log('WebSocketga ulanildi.');
  // Ma'lumotlarni so'rash
  socket.send(JSON.stringify({ type: 'request-data' }));
};

socket.onerror = function(error) {
  console.error('WebSocket xatosi:', error);
};

socket.onclose = function() {
  console.log('WebSocket ulanish yopildi. Qayta urinish boshlanmoqda...');
  setTimeout(function() {
    const newSocket = new WebSocket('wss://yourdomain.railway.app');
    newSocket.onopen = socket.onopen;
    newSocket.onerror = socket.onerror;
    newSocket.onclose = socket.onclose;
    newSocket.onmessage = socket.onmessage;
    window.socket = newSocket;
  }, 5000);
};

socket.onmessage = function(event) {
  console.log('Qabul qilingan xabar:', event.data);
  try {
    const data = JSON.parse(event.data);
    console.log('Parsed data:', data);
    updateHaroratTable(data);
    updateNurlanishTable(data);
  } catch (e) {
    console.error('Malumotlarni tahlil qilishda xato yuz berdi:', e);
  }
};

window.socket = socket;

function updateHaroratTable(data) {
  const tableBody = document.getElementById('haroratTable').getElementsByTagName('tbody')[0];
  updateTable(tableBody, data, 'avgHarorat');
}

function updateNurlanishTable(data) {
  const tableBody = document.getElementById('nurlanishTable').getElementsByTagName('tbody')[0];
  updateTable(tableBody, data, 'avgNurlanish');
}

function updateTable(tableBody, data, key) {
  if (!tableBody) {
    console.error('Jadval tanasi topilmadi.');
    return;
  }

  // Jadvalda 5 qatordan ko'p bo'lsa, eng qadimgisini o'chirish
  while (tableBody.rows.length > 5) {
    tableBody.deleteRow(0);
  }

  // Yangi ma'lumotlar bilan jadvalni yangilash
  data.forEach(row => {
    if (tableBody.rows.length >= 5) {
      // Agar jadvalda allaqachon 5 qator bo'lsa, eng qadimgisini o'chirish
      tableBody.deleteRow(0);
    }
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${row.sana}</td><td>${parseFloat(row[key]).toFixed(2)}</td>`;
    tableBody.appendChild(tr);
  });
}
