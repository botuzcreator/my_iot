document.addEventListener('DOMContentLoaded', () => {
  socket.onopen = function() {
    // Ma'lumotlarni so'rash
    socket.send(JSON.stringify({ type: 'request-data' }));
    console.log('Request-data so\'rovi yuborildi.');
  };

  socket.onmessage = function(event) {
    console.log('Serverdan qabul qilingan xabar:', event);
    if (event.data instanceof Blob) {
      // Blob obyektini matnga aylantirish va konsolga chiqarish
      event.data.text().then(function(text) {
        console.log('Qabul qilingan xabar (Blob matni):', text);
      });
    } else {
      console.log('Qabul qilingan xabar (Text yoki JSON):', event.data);
      try {
        const data = JSON.parse(event.data);
        console.log('Parslangan ma\'lumotlar:', data); // Konsolda ma'lumotlarni ko'rsatish
        updateHaroratTable(data);
        updateNurlanishTable(data);
      } catch (e) {
        console.error('Malumotlarni tahlil qilishda xato yuz berdi:', e);
      }
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
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${new Date(row.sana).toLocaleDateString()}</td><td>${parseFloat(row[key]).toFixed(2)}</td>`;
      tableBody.appendChild(tr);
    });
    console.log('Jadval yangilandi:', tableBody);
  }
});
