$(document).ready(function () {
  loadBarChart();
  loadLineChart();
  loadPieChart();
});

function loadBarChart() {
  $.get(`${url}api/v1/charts/sales-by-category`, function (res) {
    const ctx = document.getElementById('barChart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: res.labels,
        datasets: [{
          label: 'Units Sold',
          data: res.data,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
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
  });
}

function loadLineChart() {
  $.get(`${url}api/v1/charts/monthly-sales`, function (res) {
    const ctx = document.getElementById('lineChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: res.labels,
        datasets: [{
          label: 'Revenue (₱)',
          data: res.data,
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          fill: true,
          tension: 0.3
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
  });
}

function loadPieChart() {
  $.get(`${url}api/v1/charts/revenue-distribution`, function (res) {
    const ctx = document.getElementById('pieChart').getContext('2d');
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: res.labels,
        datasets: [{
          label: 'Revenue',
          data: res.data,
          backgroundColor: generateRandomColors(res.data.length)
        }]
      },
      options: {
        responsive: true
      }
    });
  });
}

function generateRandomColors(count) {
  const colors = [];
  for (let i = 0; i < count; i++) {
    const r = Math.floor(Math.random() * 200 + 30);
    const g = Math.floor(Math.random() * 200 + 30);
    const b = Math.floor(Math.random() * 200 + 30);
    colors.push(`rgba(${r}, ${g}, ${b}, 0.7)`);
  }
  return colors;
}
