document.addEventListener('DOMContentLoaded', () => {
    const socket = window.socket;

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
                    return `${value.toFixed(2)}`;
                }
            }
        }
    };

    const chart = new ApexCharts(document.querySelector("#chart"), options);
    chart.render();

    socket.onmessage = function(event) {
        if (event.data instanceof Blob) {
            const reader = new FileReader();
            reader.onload = function() {
                const message = reader.result;
                console.log('graphic: ' + message);
                const data = message.split(';');
                const now = new Date().getTime();
                options.xaxis.categories.push(now);
                options.series[0].data.push([now, parseFloat(data[0])]);
                options.series[1].data.push([now, parseFloat(data[1])]);
                options.series[2].data.push([now, parseFloat(data[2])]);
                options.series[3].data.push([now, parseFloat(data[3])]);
                chart.updateOptions(options);
            };
            reader.readAsText(event.data);
        }
    };
});
