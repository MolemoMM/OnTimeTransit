// Updated API service with proper URL separation and retry logic
import axios from "axios";
import { toast } from "react-toastify";

const ROUTE_SERVICE_URL = "http://localhost:8084/api/routes";
const SCHEDULE_SERVICE_URL = "http://localhost:8085/api/schedules";
const TICKET_SERVICE_URL = "http://localhost:8087/api/tickets";
const AUTH_SERVICE_URL = "http://localhost:8089/api/auth";
const USER_SERVICE_URL = "http://localhost:8089/api/users";
const NOTIFICATION_SERVICE_URL = "http://localhost:8083/api/notifications";
const ANALYTICS_SERVICE_URL = "http://localhost:8086/api/analytics";

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Sleep function for retry delays
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Retry wrapper function
const withRetry = async (fn, retries = MAX_RETRIES) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      const isLastAttempt = i === retries - 1;
      const shouldRetry = error.code === 'ECONNRESET' || 
                          error.code === 'ECONNABORTED' || 
                          error.code === 'ENOTFOUND' ||
                          (error.response && error.response.status >= 500);
      
      if (shouldRetry && !isLastAttempt) {
        console.log(`Attempt ${i + 1} failed, retrying in ${RETRY_DELAY}ms...`);
        await sleep(RETRY_DELAY * (i + 1)); // Exponential backoff
        continue;
      }
      throw error;
    }
  }
};

// Create axios instance with timeout
const axiosInstance = axios.create({
  timeout: 15000, // 15 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
    } else if (error.code === 'ECONNRESET') {
      console.error('Connection reset by server');
    } else if (error.response?.status >= 500) {
      console.error('Server error:', error.response.status);
    } else if (error.response?.status === 404) {
      console.error('Resource not found');
    } else if (!error.response) {
      console.error('Network error - no response received');
    }
    return Promise.reject(error);
  }
);

// Retry function for failed requests
const retryRequest = async (fn, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      console.log(`Attempt ${i + 1} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
};

const handleApiError = (error) => {
  if (error.response) {
    // Server responded with a status other than 2xx
    const message = error.response.data?.message || `Server error: ${error.response.status}`;
    console.error("API Error:", message);
  } else if (error.request) {
    // Request was made but no response received
    console.error("No response from server:", error.message);
  } else {
    // Something else happened
    console.error("Request setup error:", error.message);
  }
  throw error; // Re-throw the error for further handling if needed
};

const ApiService = {
  getRoutes: async () => {
    try {
      console.log("Fetching routes from:", ROUTE_SERVICE_URL);
      return await withRetry(async () => {
        const response = await axiosInstance.get(ROUTE_SERVICE_URL);
        console.log("Routes response:", response.data);
        return response.data || [];
      });
    } catch (error) {
      console.error("Failed to fetch routes:", error);
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      }
      return []; // Return empty array as fallback
    }
  },
  getRouteById: (id) => axiosInstance.get(`${ROUTE_SERVICE_URL}/${id}`).then((response) => response.data).catch(handleApiError),
  addRoute: async (route) => {
    try {
      const response = await axios.post("http://localhost:8084/api/routes", route);
      return response.data;
    } catch (error) {
      console.error("Failed to add route:", error);
      throw new Error("Failed to add route. Please try again.");
    }
  },
  updateRoute: (id, route) =>
     axiosInstance
  .put(`${ROUTE_SERVICE_URL}/${id}`, route)
  .then((res) => res.data)
  .catch(handleApiError),

  

  deleteRoute: async (id) => {
    try {
      await axios.delete(`http://localhost:8084/api/routes/${id}`);
    } catch (error) {
      console.error("Failed to delete route:", error);
      throw new Error("Failed to delete route. Please try again.");
    }
  },
    // Re-throw to allow proper handling in the component
    deleteTicket: async (id) => {
        try {
            const response = await axiosInstance.delete(`${TICKET_SERVICE_URL}/${id}`);
            return response.data;
        } catch (error) {
            handleApiError(error);
            throw error; 
        }
    },

  // Schedules
  getSchedules: async () => {
    try {
      console.log("Fetching schedules from:", SCHEDULE_SERVICE_URL);
      const response = await withRetry(() => axiosInstance.get(SCHEDULE_SERVICE_URL));
      console.log("Schedules response:", response.data);
      return response.data || [];
    } catch (error) {
      console.error("Failed to fetch schedules:", error);
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      }
      return [];
    }
  },
  addSchedule: (schedule) => axiosInstance.post(`${SCHEDULE_SERVICE_URL}`, schedule).then((res) => res.data).catch(handleApiError),
  deleteSchedule: (id) => axiosInstance.delete(`${SCHEDULE_SERVICE_URL}/${id}`).then((res) => res.data).catch(handleApiError),
  getSchedulesByRoute: (routeId) =>
    axiosInstance
      .get(`${SCHEDULE_SERVICE_URL}/route/${routeId}`)
      .then((res) => res.data)
      .catch(handleApiError),
  assignScheduleToRoute: (scheduleId, routeId) =>
    axiosInstance
      .put(`${SCHEDULE_SERVICE_URL}/${scheduleId}/assign-route/${routeId}`)
      .then((res) => res.data)
      .catch(handleApiError),

  // Tickets
  getTickets: (routeName, travelDateTime) =>
    axiosInstance
      .get(`${TICKET_SERVICE_URL}`, {
        params: { routeName, travelDateTime },
      })
      .then((res) => res.data)
      .catch(handleApiError),
  getAllTickets: async () => {
    try {
      console.log("Fetching tickets from:", `${TICKET_SERVICE_URL}`);
      const response = await withRetry(() => axiosInstance.get(`${TICKET_SERVICE_URL}`));
      console.log("Tickets response:", response.data);
      return response.data || [];
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      }
      return [];
    }
  },
  createTicket: async (ticket) => {
    try {
      const response = await axios.post(`${TICKET_SERVICE_URL}/book`, ticket);
      return response.data;
    } catch (error) {
      console.error("Failed to create ticket:", error);
      throw error;
    }
  },
  bookTicket: (ticket) =>
    axiosInstance.post(`${TICKET_SERVICE_URL}/book`, ticket).then((res) => res.data).catch(handleApiError),
  cancelTicket: (id) =>
    axiosInstance
      .put(`${TICKET_SERVICE_URL}/cancel/${id}`)
      .then((res) => res.data)
      .catch((error) => {
        console.error("API Error:", error);
        throw error;
      }),
  getAvailableSeats: (routeName, travelDateTime) =>
    axiosInstance
      .get(`${TICKET_SERVICE_URL}/available-seats`, {
        params: { routeName, travelDateTime },
      })
      .then((res) => res.data)
      .catch(handleApiError),

  // Authentication
  login: (credentials) => axiosInstance.post(`${AUTH_SERVICE_URL}/login`, credentials).then((res) => res.data).catch(handleApiError),
  register: (user) => axiosInstance.post(`${AUTH_SERVICE_URL}/register`, user).then((res) => res.data).catch(handleApiError),
  getAllUsers: async () => {
    try {
      console.log("Fetching users from:", `${USER_SERVICE_URL}`);
      const response = await withRetry(() => axiosInstance.get(`${USER_SERVICE_URL}`));
      console.log("Users response:", response.data);
      return response.data || [];
    } catch (error) {
      console.error("Failed to fetch users:", error);
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      }
      return [];
    }
  },
  deleteUser: (id) =>
  axiosInstance
    .delete(`${USER_SERVICE_URL}/${id}`)
    .then((res) => res.data)
    .catch(handleApiError),

  // Notifications
  sendNotification: (message) =>
    axiosInstance.post(`${NOTIFICATION_SERVICE_URL}/send`, { message }).then((res) => res.data).catch(handleApiError),

  // Analytics - keep existing method
  getAnalyticsSummary: () =>
    axiosInstance.get(`${ANALYTICS_SERVICE_URL}/summary`).then((res) => res.data).catch(handleApiError),
  
  getTicketAnalytics: () =>
    axiosInstance.get(`${TICKET_SERVICE_URL}/analytics`).then((res) => res.data).catch(() => []),
  
  getRouteAnalytics: () =>
    axiosInstance.get(`${ROUTE_SERVICE_URL}/analytics`).then((res) => res.data).catch(() => []),
  
  getUserAnalytics: () =>
    axiosInstance.get(`${USER_SERVICE_URL}/analytics`).then((res) => res.data).catch(() => []),
  
  getRevenueAnalytics: () =>
    axiosInstance.get(`${TICKET_SERVICE_URL}/revenue`).then((res) => res.data).catch(() => ({ totalRevenue: 0, monthlyRevenue: [] })),
  
  getDashboardStats: async () => {
    try {
      const [tickets, routes, users, schedules] = await Promise.all([
        axiosInstance.get(`${TICKET_SERVICE_URL}/count`).then(res => res.data).catch(() => 0),
        axiosInstance.get(`${ROUTE_SERVICE_URL}/count`).then(res => res.data).catch(() => 0),
        axiosInstance.get(`${USER_SERVICE_URL}/count`).then(res => res.data).catch(() => 0),
        axiosInstance.get(`${SCHEDULE_SERVICE_URL}/count`).then(res => res.data).catch(() => 0),
      ]);
      
      return {
        totalTickets: tickets,
        totalRoutes: routes,
        totalUsers: users,
        totalSchedules: schedules
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      return {
        totalTickets: 0,
        totalRoutes: 0,
        totalUsers: 0,
        totalSchedules: 0
      };
    }
  },
};

export { ApiService };