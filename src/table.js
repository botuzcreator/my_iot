// WebSocket ulanishini yaratish
const wss = new WebSocket('wss:myiot-production.up.railway.app:443');

// WebSocket ochilganda ma'lumotlarni so'rash
wss.onopen = function() {
  wss.send(JSON.stringify({ type: 'request-data' }));
};

// Ma'lumotlar kelganda ularni qabul qilish va ishlov berish
wss.onmessage = function(event) {
  if (event.data instanceof Blob) {
    event.data.text().then(function(text) {
      console.log('Qabul qilingan xabar (Blob matni):', text);
    });
  } else {
    console.log('Qabul qilingan xabar (Text yoki JSON):', event.data);
    try {
      const data = JSON.parse(event.data);
      updateTables(data);
      processChartData(data);
    } catch (e) {
      console.error('Ma\'lumotlarni matn ko\'rinishida qabul qilindi:', event.data);
      processTextData(event.data);
    }
  }
};

// Jadvalni yangilash funksiyasi
function updateTables(data) {
  updateTable(document.getElementById('haroratTable').getElementsByTagName('tbody')[0], data, 'avgHarorat');
  updateTable(document.getElementById('nurlanishTable').getElementsByTagName('tbody')[0], data, 'avgNurlanish');
}

function updateTable(tableBody, data, key) {
  if (!tableBody) {
    console.error('Jadval tanasi topilmadi.');
    return;
  }

  // Jadvalni yangilash
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

// Grafikni boshqarish uchun global o'zgaruvchilar
const seriesData = {
  categories: [],
  harorat: [],
  namlik: [],
  nurlanish: [],
  yoruglik: []
};

// Grafik konfiguratsiyasi
const options = {
  series: [{
    name: 'Harorat (°C)',
    data: seriesData.harorat
  }, {
    name: 'Namlik (%)',
    data: seriesData.namlik
  }, {
    name: 'Nurlanish (lx)',
    data: seriesData.nurlanish
  }, {
    name: 'Yoritilganlik (W/m²)',
    data: seriesData.yoruglik
  }],
  chart: {
    type: 'area',
    height: 350,
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
    curve: 'smooth'
  },
  xaxis: {
    type: 'datetime',
    categories: seriesData.categories
  },
  tooltip: {
    x: {
      format: 'dd/MM/yy HH:mm'
    },
    y: {
      formatter: function(value) {
        return `${value.toFixed(2)}`;
      }
    }
  }
};

// Grafikni yaratish
const chart = new ApexCharts(document.querySelector("#chart"), options);
chart.render();

// Grafikni yangilash uchun ma'lumotlarni qayta ishlash
function processChartData(data) {
  const now = new Date().getTime();
  seriesData.categories.push(now);
  seriesData.harorat.push([now, parseFloat(data.avgHarorat)]);
  seriesData.namlik.push([now, parseFloat(data.avgNamlik)]);
  seriesData.nurlanish.push([now, parseFloat(data.avgNurlanish)]);
  seriesData.yoruglik.push([now, parseFloat(data.avgYoruglik)]);

  chart.updateOptions({
    xaxis: {
      categories: seriesData.categories
    }
  }, false);

  chart.updateSeries([{
    data: seriesData.harorat
  }, {
    data: seriesData.namlik
  }, {
    data: seriesData.nurlanish
  }, {
    data: seriesData.yoruglik
  }]);
}

// Matnli ma'lumotlarni qayta ishlash funksiyasi
function processTextData(text) {
  const data = text.split(';');
  console.log('Split qilingan ma\'lumotlar:', data);

  document.getElementById('param1').textContent = data[0] + ' ' + '°C';
  document.getElementById('param2').textContent = data[1] + ' ' + '%';
  document.getElementById('param3').textContent = data[2] + ' ' + 'lx';
  document.getElementById('param4').textContent = data[3] + ' ' + 'W/m²';
  document.getElementById('param5').textContent = data[4];
  document.getElementById('param6').textContent = data[5];
}
