document.addEventListener('DOMContentLoaded', () => {
  socket.onopen = function() {
    // Ma'lumotlarni so'rash
    socket.send(JSON.stringify({ type: 'request-data' }));
  };

  socket.onmessage = function(event) {
    if (event.data instanceof Blob) {
      // Blob obyektini matnga aylantirish va konsolga chiqarish
      event.data.text().then(function(text) {
        console.log('Qabul qilingan xabar (Blob matni):', text);
        // Agar Blob matnini ham ishlov berish kerak bo'lsa, shu yerda qo'shishingiz mumkin
      });
    } else {
      console.log('Qabul qilingan xabar (Text yoki JSON):', event.data);
      try {
        const data = JSON.parse(event.data);
        updateHaroratTable(data);
        updateNurlanishTable(data);
      } catch (e) {
        console.error('Malumotlarni tahlil qilishda xato yuz berdi:', e);
        // Agar matn formatida kelgan ma'lumotni ishlov berish kerak bo'lsa, bu yerda qo'shishingiz mumkin
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
      if (tableBody.rows.length >= 5) {
        // Agar jadvalda allaqachon 5 qator bo'lsa, eng qadimgisini o'chirish
        tableBody.deleteRow(0);
      }
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${row.sana}</td><td>${parseFloat(row[key]).toFixed(2)}</td>`;
      tableBody.appendChild(tr);
    });
  }
});
