// ==============================|| DASHBOARD - TOTAL GROWTH BAR CHART ||============================== //

const chartOptions = {
    chart: {
      type: 'bar',
      height: 480,
      stacked: true,
      toolbar: { show: true },
      zoom: { enabled: true },
      dropShadow: {
        enabled: true,
        top: 2,
        left: 0,
        blur: 4,
        opacity: 0.1
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 6,
        borderRadiusApplication: 'end',
        borderRadiusWhenStacked: 'all',
        colors: {
          ranges: [
            { from: 0, to: 0, color: '#f1f1f1' }
          ]
        }
      }
    },
    dataLabels: { enabled: false },
    xaxis: {
      type: 'category',
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          fontSize: '13px',
          fontWeight: 600
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '12px',
          fontWeight: 500
        },
        formatter: (val) => {
            if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
            if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
            return `₹${val}`;
        }
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: "vertical",
        shadeIntensity: 0.2,
        opacityFrom: 1,
        opacityTo: 0.85,
        stops: [0, 95, 100]
      }
    },
    legend: {
      show: true,
      position: 'bottom',
      horizontalAlign: 'center',
      fontSize: '14px',
      fontWeight: 600,
      itemMargin: { horizontal: 20, vertical: 10 },
      markers: {
        width: 12,
        height: 12,
        radius: 4
      }
    },
    grid: {
      show: true,
      borderColor: '#f1f1f1',
      strokeDashArray: 5,
      xaxis: {
        lines: { show: false }
      },
      yaxis: {
        lines: { show: true }
      }
    },
    tooltip: {
      theme: 'light',
      shared: true,
      intersect: false,
      style: {
        fontSize: '13px'
      },
      y: [{
          formatter: (val) => `₹${Number(val).toLocaleString('en-IN')}`
      }, {
          formatter: (val) => `${val} bookings`
      }]
    }
  };

export default chartOptions;
