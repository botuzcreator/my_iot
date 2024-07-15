const wss = new WebSocket('wss:myiot-production.up.railway.app:443');

wss.onopen = function() {
  // Ma'lumotlarni so'rash
  wss.send(JSON.stringify({ type: 'request-data' }));
};

wss.onmessage = function(event) {
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
      console.error('Ma\'lumotlarni matn ko\'rinishida qabul qilindi:', event.data);
      // Matn formatida kelgan ma'lumotni ishlov berish
      processTextData(event.data);
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

// Matnli ma'lumotlarni qayta ishlash funksiyasi
function processTextData(text) {
  // Ma'lumotlarni parsing qilish
  const data = text.split(';');
  console.log('Split qilingan ma\'lumotlar:', data);

  // Ma'lumotlarni web sahifada ko'rsatish
  document.getElementById('param1').textContent = data[0] + ' ' + '°C';
  document.getElementById('param2').textContent = data[1] + ' ' + '%';
  document.getElementById('param3').textContent = data[2] + ' ' + 'lx';
  document.getElementById('param4').textContent = data[3] + ' ' + 'W/m²';
  document.getElementById('param5').textContent = data[4];
  document.getElementById('param6').textContent = data[5];

  // Grafikni yaratish uchun boshlang'ich ma'lumotlar va konfiguratsiya
  const options = {
    series: [{
      name: 'Harorat (°C)',
      data: []
    }, {
      name: 'Namlik (%)',
      data: []
    }, {
      name: 'Nurlanish (lx)',
      data: []
    }, {
      name: 'Yoritilganlik (W/m²)',
      data: []
    }],
    chart: {
      id: 'area-datetime',
      type: 'area',
      height: 240,
      zoom: {
        type: 'x',
        enabled: true,
        autoScaleYaxis: true
      },
      animations: {
        enabled: true,
        easing: 'linear',
        dynamicAnimation: {
          speed: 1000
        }
      },
      toolbar: {
        show: true
      }
    },
    stroke: {
      curve: 'straight'
    },
    xaxis: {
      type: 'datetime',
      categories: []
    },
    tooltip: {
      x: {
        format: 'dd/MM/yy HH:mm'
      },
      y: {
        formatter: function(value) {
          return `${value.toFixed(2)}`;  // Y o'qi qiymatlari uchun formatter
        }
      }
    }
  };

  // ApexCharts bilan grafikni yaratish
  const chart = new ApexCharts(document.querySelector("#chart"), options);
  chart.render();

  // Grafik uchun yangi ma'lumotlarni va vaqt yorlig'ini qo'shish
  const now = new Date().getTime();
  options.xaxis.categories.push(now);
  options.series[0].data.push([now, parseFloat(data[0])]);
  options.series[1].data.push([now, parseFloat(data[1])]);
  options.series[2].data.push([now, parseFloat(data[2])]);
  options.series[3].data.push([now, parseFloat(data[3])]);

  // Grafikni yangilash
  chart.updateOptions(options);
}
