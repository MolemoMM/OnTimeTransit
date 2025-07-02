import React, { useState, useEffect } from "react";
import { Bar, Pie, Line, Doughnut } from "react-chartjs-2";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  ArcElement, 
  Tooltip, 
  Legend, 
  LineElement, 
  PointElement,
  Filler
} from "chart.js";
import { ApiService } from "../services/ApiService";
import { toast } from "react-toastify";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, LineElement, PointElement, Filler);

function Analytics() {
  const [selectedChart, setSelectedChart] = useState('overview');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [realDataAvailable, setRealDataAvailable] = useState(false);

  useEffect(() => {
    fetchRealData();
  }, []);

  const fetchRealData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all the data from different services
      const [tickets, routes, users, schedules, analyticsSummary] = await Promise.all([
        ApiService.getTickets().catch(() => []),
        ApiService.getRoutes().catch(() => []),
        ApiService.getAllUsers().catch(() => []),
        ApiService.getSchedules().catch(() => []),
        ApiService.getAnalyticsSummary().catch(() => null)
      ]);

      // Check if we have real data
      if (tickets.length > 0 || routes.length > 0 || users.length > 0) {
        setRealDataAvailable(true);
        processRealAnalyticsData(tickets, routes, users, schedules, analyticsSummary);
      } else {
        setRealDataAvailable(false);
        generateSampleData();
      }
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      toast.error("Failed to load analytics data");
      setRealDataAvailable(false);
      generateSampleData();
    } finally {
      setIsLoading(false);
    }
  };

  const processRealAnalyticsData = (tickets, routes, users, schedules, analyticsSummary) => {
    // Status distribution from real tickets
    const statusCounts = tickets.reduce((acc, ticket) => {
      const status = ticket.status || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Route popularity from real tickets
    const routeCounts = tickets.reduce((acc, ticket) => {
      const route = ticket.routeName || 'Unknown Route';
      acc[route] = (acc[route] || 0) + 1;
      return acc;
    }, {});

    // Monthly trends from real tickets (last 6 months)
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

    // Calculate revenue (you might want to add actual price field to tickets)
    const confirmedTickets = tickets.filter(t => t.status === 'Confirmed');
    const totalRevenue = confirmedTickets.length * 150; // Default price, update with real ticket prices

    // User analytics
    const userRoles = users.reduce((acc, user) => {
      const role = user.role || 'user';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});

    // Route analytics
    const routesByStatus = routes.reduce((acc, route) => {
      const status = route.status || 'active';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    setAnalyticsData({
      statusCounts,
      routeCounts,
      monthlyData: last6Months.map(month => monthlyData[month]),
      monthLabels: last6Months,
      totalTickets: tickets.length,
      confirmedTickets: confirmedTickets.length,
      totalRevenue,
      activeRoutes: routes.length,
      totalUsers: users.length,
      userRoles,
      routesByStatus,
      totalSchedules: schedules.length,
      avgTicketsPerRoute: routes.length > 0 ? (tickets.length / routes.length).toFixed(1) : 0,
      successRate: tickets.length > 0 ? ((confirmedTickets.length / tickets.length) * 100).toFixed(1) : 0,
      // Include analytics summary if available from backend
      ...(analyticsSummary || {})
    });
  };

  const generateSampleData = () => {
    // Create sample data for demonstration when no real data is available
    const sampleTickets = [
      { id: 1, status: 'Confirmed', routeName: 'New York → Boston', travelDateTime: new Date('2024-11-15').toISOString() },
      { id: 2, status: 'Confirmed', routeName: 'Boston → New York', travelDateTime: new Date('2024-12-10').toISOString() },
      { id: 3, status: 'Pending', routeName: 'New York → Washington', travelDateTime: new Date('2024-12-20').toISOString() },
      { id: 4, status: 'Canceled', routeName: 'Washington → New York', travelDateTime: new Date('2024-11-25').toISOString() },
      { id: 5, status: 'Confirmed', routeName: 'New York → Boston', travelDateTime: new Date('2025-01-05').toISOString() },
      { id: 6, status: 'Confirmed', routeName: 'Boston → Philadelphia', travelDateTime: new Date('2025-01-10').toISOString() },
      { id: 7, status: 'Pending', routeName: 'Philadelphia → New York', travelDateTime: new Date('2024-10-15').toISOString() },
      { id: 8, status: 'Confirmed', routeName: 'New York → Boston', travelDateTime: new Date('2024-09-20').toISOString() },
    ];
    
    const sampleRoutes = [
      { id: 1, startPoint: 'New York', endPoint: 'Boston', status: 'active' },
      { id: 2, startPoint: 'Boston', endPoint: 'New York', status: 'active' },
      { id: 3, startPoint: 'New York', endPoint: 'Washington', status: 'active' },
    ];
    
    const sampleUsers = [
      { id: 1, username: 'admin', role: 'admin' },
      { id: 2, username: 'user1', role: 'user' },
      { id: 3, username: 'user2', role: 'user' },
    ];
    
    processRealAnalyticsData(sampleTickets, sampleRoutes, sampleUsers, [], null);
  };

  const processAnalyticsData = (tickets) => {
    // Legacy method for backward compatibility
    processRealAnalyticsData(tickets, [], [], [], null);
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
    interaction: {
      intersect: false,
    },
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
        beginAtZero: true,
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
    interaction: {
      intersect: false,
    },
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
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
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
            {!realDataAvailable && (
              <span style={{ 
                fontSize: '12px', 
                fontWeight: 'normal', 
                color: '#f59e0b',
                marginLeft: '8px',
                padding: '4px 8px',
                background: 'rgba(245, 158, 11, 0.1)',
                borderRadius: '4px'
              }}>
                (Sample Data)
              </span>
            )}
          </h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="modern-btn modern-btn-success"
              onClick={fetchRealData}
              disabled={isLoading}
              style={{ padding: '8px 16px', fontSize: '12px' }}
            >
              <i className={`fas ${isLoading ? 'fa-spinner fa-spin' : 'fa-sync-alt'}`}></i>
              {isLoading ? 'Loading...' : 'Refresh Data'}
            </button>
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
            <p style={{ color: '#6b7280', fontSize: '16px' }}>Loading analytics data...</p>
            <p style={{ color: '#9ca3af', fontSize: '14px' }}>Please wait while we process the data</p>
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
                <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{analyticsData.successRate}%</div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>Success Rate</div>
              </div>
              <div style={{ 
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', 
                color: 'white',
                padding: '24px', 
                borderRadius: '16px', 
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(139, 92, 246, 0.3)'
              }}>
                <i className="fas fa-users" style={{ fontSize: '32px', marginBottom: '12px' }}></i>
                <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{analyticsData.totalUsers}</div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>Total Users</div>
              </div>
              <div style={{ 
                background: 'linear-gradient(135deg, #ec4899, #db2777)', 
                color: 'white',
                padding: '24px', 
                borderRadius: '16px', 
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(236, 72, 153, 0.3)'
              }}>
                <i className="fas fa-chart-line" style={{ fontSize: '32px', marginBottom: '12px' }}></i>
                <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{analyticsData.avgTicketsPerRoute}</div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>Avg Tickets/Route</div>
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