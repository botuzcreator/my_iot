document.addEventListener('DOMContentLoaded', () => {
  socket.onmessage = function(event) {
    if (event.data instanceof Blob) {
      const reader = new FileReader();
      reader.onload = function() {
        const message = reader.result;
        console.log('Qabul qilingan xabar: ' + message);
        const data = message.split(';');
        console.log('Split qilingan ma\'lumotlar:', data);
        updateHaroratTable(data);
        updateNurlanishTable(data);
      };
      reader.readAsText(event.data);
    } else {
      const message = event.data.toString();
      console.log('Qabul qilingan xabar: ' + message);
      const data = message.split(';');
      console.log('Split qilingan ma\'lumotlar:', data);
      updateHaroratTable(data);
      updateNurlanishTable(data);
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
    while (tableBody.rows.length > 5) {
      tableBody.deleteRow(0);
    }
    data.forEach(row => {
      if (tableBody.rows.length >= 5) {
        tableBody.deleteRow(0);
      }
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${row.sana}</td><td>${parseFloat(row[key]).toFixed(2)}</td>`;
      tableBody.appendChild(tr);
    });
  }
});
