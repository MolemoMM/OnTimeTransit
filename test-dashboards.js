// Comprehensive test script for admin and user dashboards
const axios = require('axios');

const BASE_URLS = {
  routes: 'http://localhost:8084/api/routes',
  schedules: 'http://localhost:8085/api/schedules',
  tickets: 'http://localhost:8087/api/tickets/book',
  ticketsGet: 'http://localhost:8087/api/tickets',
  users: 'http://localhost:8089/api/users',
  auth: 'http://localhost:8089/api/auth'
};

// Sample test tickets
const sampleTickets = [
  {
    passengerName: "John Doe",
    email: "john.doe@email.com",
    phoneNumber: "+1234567890",
    routeName: "Downtown Express",
    travelDateTime: "2025-07-05T08:00:00",
    seatNumber: 12,
    price: 25.00,
    status: "BOOKED"
  },
  {
    passengerName: "Jane Smith",
    email: "jane.smith@email.com",
    phoneNumber: "+1987654321",
    routeName: "Airport Shuttle",
    travelDateTime: "2025-07-06T12:30:00",
    seatNumber: 8,
    price: 45.00,
    status: "BOOKED"
  },
  {
    passengerName: "Mike Johnson",
    email: "mike.johnson@email.com",
    phoneNumber: "+1122334455",
    routeName: "University Line",
    travelDateTime: "2025-07-07T17:00:00",
    seatNumber: 15,
    price: 15.00,
    status: "BOOKED"
  }
];

async function testDashboards() {
  try {
    console.log('🎯 Testing Dashboard Data...');
    
    // Test routes endpoint
    console.log('\n📍 Testing Routes API...');
    try {
      const routesResponse = await axios.get(BASE_URLS.routes);
      console.log(`✅ Routes API: ${routesResponse.data.length} routes found`);
      if (routesResponse.data.length > 0) {
        console.log(`   📋 Sample route: ${routesResponse.data[0].routeName}`);
      }
    } catch (error) {
      console.log(`❌ Routes API failed:`, error.message);
    }
    
    // Test schedules endpoint
    console.log('\n🕒 Testing Schedules API...');
    try {
      const schedulesResponse = await axios.get(BASE_URLS.schedules);
      console.log(`✅ Schedules API: ${schedulesResponse.data.length} schedules found`);
    } catch (error) {
      console.log(`❌ Schedules API failed:`, error.message);
    }
    
    // Add sample tickets
    console.log('\n🎫 Adding Sample Tickets...');
    for (const ticket of sampleTickets) {
      try {
        const response = await axios.post(BASE_URLS.tickets, ticket);
        console.log(`✅ Added ticket for: ${ticket.passengerName}`);
      } catch (error) {
        console.log(`❌ Failed to add ticket for ${ticket.passengerName}:`, error.response?.data || error.message);
      }
    }
    
    // Test tickets endpoint
    console.log('\n🎫 Testing Tickets API...');
    try {
      const ticketsResponse = await axios.get(BASE_URLS.ticketsGet);
      console.log(`✅ Tickets API: ${ticketsResponse.data.length} tickets found`);
      if (ticketsResponse.data.length > 0) {
        console.log(`   🎟️ Sample ticket: ${ticketsResponse.data[0].passengerName} - ${ticketsResponse.data[0].routeName}`);
      }
    } catch (error) {
      console.log(`❌ Tickets API failed:`, error.message);
    }
    
    // Test users endpoint (might not work without auth)
    console.log('\n👥 Testing Users API...');
    try {
      const usersResponse = await axios.get(BASE_URLS.users);
      console.log(`✅ Users API: ${usersResponse.data.length} users found`);
    } catch (error) {
      console.log(`❌ Users API failed:`, error.message);
    }
    
    console.log('\n🎉 Dashboard testing completed!');
    console.log('\n📋 Summary for Testing:');
    console.log('   🌐 Admin Dashboard: http://localhost:3000/admin');
    console.log('   👤 User Dashboard: http://localhost:3000/user');
    console.log('   🎯 Expected data: Routes, Schedules, and Tickets should be visible');
    console.log('\n🔧 Test Steps:');
    console.log('   1. Open Admin Dashboard and check if stats show numbers > 0');
    console.log('   2. Navigate through Routes, Schedules, Tickets sections');
    console.log('   3. Open User Dashboard and check if routes are displayed');
    console.log('   4. Try booking a new ticket in User Dashboard');
    console.log('   5. Check "My Tickets" section for booked tickets');
    
  } catch (error) {
    console.error('💥 Error during testing:', error.message);
  }
}

// Run the comprehensive test
testDashboards();
