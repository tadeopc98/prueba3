var script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
document.head.appendChild(script);

function GRAFICAS(datos)
      var ctx = document.getElementById('myChart').getContext('2d');
      var datos = datos;
  
      
  
      var chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Enero', 'Febrero'],
          datasets: [{
            label: 'Mostrador',
            data: datos,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    