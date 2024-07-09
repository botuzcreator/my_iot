document.addEventListener('DOMContentLoaded', () => {
    const socket = window.socket;

    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'request-data' }));
    } else {
        socket.onopen = function(event) {
            socket.send(JSON.stringify({ type: 'request-data' }));
        };
    }

    socket.onmessage = function(event) {
        if (event.data instanceof Blob) {
            event.data.text().then(function(text) {
                console.log('Qabul qilingan xabar (Blob matni):', text);
            });
        } else {
            console.log('Qabul qilingan xabar (Text yoki JSON):', event.data);
            try {
                const data = JSON.parse(event.data);
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
