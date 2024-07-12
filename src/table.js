const wss = new WebSocket('wss://myiot-production.up.railway.app:443');

wss.onopen = function() {
  // Ma'lumotlarni so'rash
  wss.send(JSON.stringify({ type: 'request-data' }));
};

wss.onmessage = function(event) {
  console.log('Qabul qilingan xabar (Text yoki JSON):', event.data);

  try {
    // JSON formatida bo'lsa, parse qilamiz
    const data = JSON.parse(event.data);
    updateHaroratTable(data);
    updateNurlanishTable(data);
  } catch (e) {
    // JSON bo'lmasa, text deb qabul qilamiz va split qilamiz
    console.log('JSON formatida emas, text deb qabul qilindi');
    const data = event.data.split(';');
    console.log('Split qilingan ma\'lumotlar:', data);

    // Ma'lumotlarni web sahifada ko'rsatish
    document.getElementById('param1').textContent = data[0] + ' ' + '°C';
    document.getElementById('param2').textContent = data[1] + ' ' + '%';
    document.getElementById('param3').textContent = data[2] + ' ' + 'lx';
    document.getElementById('param4').textContent = data[3] + ' ' + 'W/m?';
    document.getElementById('param5').textContent = data[4];
    document.getElementById('param6').textContent = data[5];
  }
};

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
