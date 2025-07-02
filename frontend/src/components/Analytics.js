import React, { useState, useEffect } from "react";
import { Bar, Pie, Line, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, LineElement, PointElement } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, LineElement, PointElement);

function Analytics({ data }) {
  const [selectedChart, setSelectedChart] = useState('overview');
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    // Process and enhance the data for better analytics
    if (data && data.length > 0) {
      processAnalyticsData(data);
    }
  }, [data]);

  const processAnalyticsData = (tickets) => {
    // Status distribution
    const statusCounts = tickets.reduce((acc, ticket) => {
      const status = ticket.status || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Route popularity
    const routeCounts = tickets.reduce((acc, ticket) => {
      const route = ticket.routeName || 'Unknown Route';
      acc[route] = (acc[route] || 0) + 1;
      return acc;
    }, {});

    // Monthly trends (last 6 months)
    const monthlyData = {};
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      last6Months.push(monthKey);
      monthlyData[monthKey] = 0;
    }

    tickets.forEach(ticket => {
      if (ticket.travelDateTime) {
        const ticketDate = new Date(ticket.travelDateTime);
        const monthKey = ticketDate.toLocaleString('default', { month: 'short', year: 'numeric' });
        if (monthlyData.hasOwnProperty(monthKey)) {
          monthlyData[monthKey]++;
        }
      }
    });

    setAnalyticsData({
      statusCounts,
      routeCounts,
      monthlyData: last6Months.map(month => monthlyData[month]),
      monthLabels: last6Months,
      totalTickets: tickets.length,
      totalRevenue: tickets.length * 150, // Assuming average ticket price
      activeRoutes: Object.keys(routeCounts).length
    });
  };

  const getChartColors = (count) => {
    const colors = [
      '#667eea', '#764ba2', '#f093fb', '#f5576c',
      '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
      '#ffecd2', '#fcb69f', '#a8edea', '#fed6e3'
    ];
    return colors.slice(0, count);
  };

  const statusChartData = analyticsData ? {
    labels: Object.keys(analyticsData.statusCounts),
    datasets: [{
      data: Object.values(analyticsData.statusCounts),
      backgroundColor: getChartColors(Object.keys(analyticsData.statusCounts).length),
      borderWidth: 0,
      hoverBorderWidth: 2,
      hoverBorderColor: '#fff'
    }]
  } : null;

  const routeChartData = analyticsData ? {
    labels: Object.keys(analyticsData.routeCounts).slice(0, 10),
    datasets: [{
      label: 'Tickets Sold',
      data: Object.values(analyticsData.routeCounts).slice(0, 10),
      backgroundColor: 'rgba(102, 126, 234, 0.8)',
      borderColor: 'rgba(102, 126, 234, 1)',
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
    }]
  } : null;

  const trendChartData = analyticsData ? {
    labels: analyticsData.monthLabels,
    datasets: [{
      label: 'Tickets Sold',
      data: analyticsData.monthlyData,
      borderColor: 'rgba(102, 126, 234, 1)',
      backgroundColor: 'rgba(102, 126, 234, 0.1)',
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: 'rgba(102, 126, 234, 1)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 8,
    }]
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
            weight: '600'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(102, 126, 234, 0.8)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11,
            weight: '600'
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          font: {
            size: 11,
            weight: '600'
          }
        }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
            weight: '600'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(102, 126, 234, 0.8)',
        borderWidth: 1,
        cornerRadius: 8
      }
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <div className="modern-card">
        <div className="modern-card-header">
          <h2 className="modern-card-title">
            <i className="fas fa-chart-bar" style={{ marginRight: '12px', color: '#667eea' }}></i>
            Analytics Dashboard
          </h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className={`modern-btn ${selectedChart === 'overview' ? 'modern-btn-primary' : 'modern-btn'}`}
              onClick={() => setSelectedChart('overview')}
              style={{ padding: '8px 16px', fontSize: '12px' }}
            >
              Overview
            </button>
            <button 
              className={`modern-btn ${selectedChart === 'routes' ? 'modern-btn-primary' : 'modern-btn'}`}
              onClick={() => setSelectedChart('routes')}
              style={{ padding: '8px 16px', fontSize: '12px' }}
            >
              Routes
            </button>
            <button 
              className={`modern-btn ${selectedChart === 'trends' ? 'modern-btn-primary' : 'modern-btn'}`}
              onClick={() => setSelectedChart('trends')}
              style={{ padding: '8px 16px', fontSize: '12px' }}
            >
              Trends
            </button>
          </div>
        </div>

        {!analyticsData ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <i className="fas fa-chart-pie" style={{ fontSize: '48px', color: '#6b7280', opacity: 0.3, marginBottom: '16px' }}></i>
            <p style={{ color: '#6b7280', fontSize: '16px' }}>No data available for analytics</p>
            <p style={{ color: '#9ca3af', fontSize: '14px' }}>Analytics will appear here once ticket data is loaded</p>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '20px', 
              marginBottom: '32px' 
            }}>
              <div style={{ 
                background: 'linear-gradient(135deg, #667eea, #764ba2)', 
                color: 'white',
                padding: '24px', 
                borderRadius: '16px', 
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
              }}>
                <i className="fas fa-ticket-alt" style={{ fontSize: '32px', marginBottom: '12px' }}></i>
                <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{analyticsData.totalTickets}</div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>Total Tickets</div>
              </div>
              <div style={{ 
                background: 'linear-gradient(135deg, #10b981, #059669)', 
                color: 'white',
                padding: '24px', 
                borderRadius: '16px', 
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)'
              }}>
                <i className="fas fa-dollar-sign" style={{ fontSize: '32px', marginBottom: '12px' }}></i>
                <div style={{ fontSize: '28px', fontWeight: 'bold' }}>${analyticsData.totalRevenue.toLocaleString()}</div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>Total Revenue</div>
              </div>
              <div style={{ 
                background: 'linear-gradient(135deg, #f59e0b, #d97706)', 
                color: 'white',
                padding: '24px', 
                borderRadius: '16px', 
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(245, 158, 11, 0.3)'
              }}>
                <i className="fas fa-route" style={{ fontSize: '32px', marginBottom: '12px' }}></i>
                <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{analyticsData.activeRoutes}</div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>Active Routes</div>
              </div>
              <div style={{ 
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', 
                color: 'white',
                padding: '24px', 
                borderRadius: '16px', 
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)'
              }}>
                <i className="fas fa-percentage" style={{ fontSize: '32px', marginBottom: '12px' }}></i>
                <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
                  {analyticsData.statusCounts.Confirmed ? 
                    Math.round((analyticsData.statusCounts.Confirmed / analyticsData.totalTickets) * 100) : 0}%
                </div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>Success Rate</div>
              </div>
            </div>

            {/* Charts */}
            {selectedChart === 'overview' && statusChartData && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                <div className="modern-card" style={{ background: 'white' }}>
                  <h3 style={{ marginBottom: '20px', color: '#2d3748', textAlign: 'center' }}>
                    <i className="fas fa-chart-pie" style={{ marginRight: '8px' }}></i>
                    Ticket Status Distribution
                  </h3>
                  <div style={{ height: '300px' }}>
                    <Doughnut data={statusChartData} options={pieOptions} />
                  </div>
                </div>
                <div className="modern-card" style={{ background: 'white' }}>
                  <h3 style={{ marginBottom: '20px', color: '#2d3748', textAlign: 'center' }}>
                    <i className="fas fa-chart-pie" style={{ marginRight: '8px' }}></i>
                    Status Breakdown
                  </h3>
                  <div style={{ height: '300px' }}>
                    <Pie data={statusChartData} options={pieOptions} />
                  </div>
                </div>
              </div>
            )}

            {selectedChart === 'routes' && routeChartData && (
              <div className="modern-card" style={{ background: 'white' }}>
                <h3 style={{ marginBottom: '20px', color: '#2d3748', textAlign: 'center' }}>
                  <i className="fas fa-chart-bar" style={{ marginRight: '8px' }}></i>
                  Top 10 Popular Routes
                </h3>
                <div style={{ height: '400px' }}>
                  <Bar data={routeChartData} options={chartOptions} />
                </div>
              </div>
            )}

            {selectedChart === 'trends' && trendChartData && (
              <div className="modern-card" style={{ background: 'white' }}>
                <h3 style={{ marginBottom: '20px', color: '#2d3748', textAlign: 'center' }}>
                  <i className="fas fa-chart-line" style={{ marginRight: '8px' }}></i>
                  Ticket Sales Trend (Last 6 Months)
                </h3>
                <div style={{ height: '400px' }}>
                  <Line data={trendChartData} options={chartOptions} />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Analytics;