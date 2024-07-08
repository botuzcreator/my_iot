// WebSocket serveringizning lokal IP manzilini kiriting
//const socket = new WebSocket('ws://192.168.5.87:8080');
var socket = window.socket;
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
    type: 'line',
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

socket.onmessage = function(event) {
  if (event.data instanceof Blob) {
    const reader = new FileReader();
    
    reader.onload = function() {
      const message = reader.result;
      console.log('graphic: ' + message);
      const data = message.split(';');
      
      // Grafik uchun yangi ma'lumotlarni va vaqt yorlig'ini qo'shish
      const now = new Date().getTime();
      
      options.xaxis.categories.push(now);
      options.series[0].data.push([now, parseFloat(data[0])]);
      options.series[1].data.push([now, parseFloat(data[1])]);
      options.series[2].data.push([now, parseFloat(data[2])]);
      options.series[3].data.push([now, parseFloat(data[3])]);

      // Grafikni yangilash
      chart.updateOptions(options);
    };
    
    reader.readAsText(event.data);
  }
};
