import axios from "axios";

const USER_SERVICE_URL = "http://localhost:8089/api/auth";

const AuthService = {
  login: (credentials) => {
    console.log("Sending login request with credentials:", credentials);
    return axios
      .post(`${USER_SERVICE_URL}/login`, credentials)
      .then((response) => {
        const { role, token } = response.data; // Extract role and token from the response
        console.log("Login successful. Role:", role);
        localStorage.setItem("role", role); // Store the role in localStorage
        localStorage.setItem("token", token); // Store the token in localStorage
        localStorage.setItem("isAuthenticated", JSON.stringify(true)); // Store as JSON boolean
        return role; // Return the role for further processing
      })
      .catch((error) => {
        console.error("Error during login:", error);
        throw error;
      });
  },

  register: (user) => {
    console.log("Sending registration request with payload:", user);
    return axios
      .post(`${USER_SERVICE_URL}/register`, user)
      .then((response) => {
        console.log("Registration successful:", response.data);
        return response.data;
      })
      .catch((error) => {
        console.error("Error during registration:", error);
        throw error;
      });
  },

  logout: () => {
    console.log("Logging out...");
    localStorage.removeItem("role"); // Clear the role from localStorage
    localStorage.removeItem("token"); // Clear the token from localStorage
    localStorage.removeItem("isAuthenticated"); // Clear authentication status
    window.location.href = "/login"; // Redirect to the login page
  },

  getRole: () => localStorage.getItem("role"), // Retrieve the role from localStorage
};

export default AuthService;