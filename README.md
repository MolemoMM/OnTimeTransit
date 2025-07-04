# OnTimeTransit - Bus Transit Management System

A comprehensive microservices-based bus transit management system built with Spring Boot, React, and PostgreSQL.

## 🚀 Quick Start

### Prerequisites
- Docker Desktop (required)
- Node.js 16+ (for frontend development)
- Java 17+ (for backend development)
- Maven 3.6+ (for building backend services)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/MolemoMM/OnTimeTransit.git
   cd OnTimeTransit
   ```

2. **Set up environment variables**
   - The `.env` file is already configured with default values
   - Review and modify if needed for your environment

3. **Start the development environment**
   ```powershell
   # For Windows PowerShell
   .\start-dev.ps1
   
   # Alternative: Use Docker Compose directly
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - PgAdmin: http://localhost:5050 (admin@admin.com / admin)
   - Database: localhost:5432 (postgres / 27711678)

## 🏗️ Architecture

### Microservices
- **User Service** (Port 8089): Authentication and user management
- **Route Service** (Port 8084): Route management and CRUD operations
- **Schedule Service** (Port 8085): Bus schedule management
- **Ticket Service** (Port 8087): Ticket booking and management
- **Notification Service** (Port 8083): Notification system
- **Analytics Service** (Port 8086): Analytics and reporting

### Frontend
- **React Application** (Port 3000): User interface
- **Admin Dashboard**: Administrative functions
- **User Portal**: Passenger booking system

### Database
- **PostgreSQL** (Port 5432): Primary database
- **PgAdmin** (Port 5050): Database management interface

## 🔧 Troubleshooting

### Common Issues

1. **Docker not running**
   ```powershell
   # Check if Docker is running
   docker info
   
   # Start Docker Desktop if needed
   ```

2. **Port conflicts**
   ```powershell
   # Check which ports are in use
   netstat -an | findstr :8089
   
   # Stop conflicting services
   docker-compose down
   ```

3. **Database connection issues**
   ```powershell
   # Check database health
   docker exec postgres-db-dev pg_isready -U postgres -d ontimetransit
   
   # Connect to database
   docker exec -it postgres-db-dev psql -U postgres -d ontimetransit
   ```

4. **Build failures**
   ```powershell
   # Clean and rebuild
   docker-compose down
   docker system prune -f
   docker-compose build --no-cache
   docker-compose up -d
   ```

5. **Service health checks**
   ```powershell
   # Run comprehensive diagnostics
   .\troubleshoot.ps1
   ```

### Fixed Issues

✅ **Registration 400 Bad Request**: Fixed validation and entity mapping
✅ **Login 401 Unauthorized**: Corrected authentication flow and password encoding
✅ **Route addition from admin**: Updated security configuration and validation
✅ **Database connection**: Fixed connection strings and environment variables
✅ **Entity mapping**: Corrected JPA annotations and table naming

## 🧪 Testing

### API Endpoints

**User Authentication:**
```bash
# Register a new user
curl -X POST http://localhost:8089/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass","email":"test@example.com"}'

# Login as user
curl -X POST http://localhost:8089/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass"}'

# Login as admin
curl -X POST http://localhost:8089/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

**Route Management:**
```bash
# Add a new route
curl -X POST http://localhost:8084/api/routes \
  -H "Content-Type: application/json" \
  -d '{"startPoint":"City A","endPoint":"City B","distance":100,"estimatedTravelTime":"2 hours"}'

# Get all routes
curl -X GET http://localhost:8084/api/routes

# Delete a route
curl -X DELETE http://localhost:8084/api/routes/1
```

## 🛠️ Development

### Backend Development
```bash
# Navigate to service directory
cd backend/user-service/user-service

# Build the service
./mvnw clean package

# Run tests
./mvnw test

# Run locally (requires database)
./mvnw spring-boot:run
```

### Frontend Development
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

### Database Management
```bash
# Access PostgreSQL container
docker exec -it postgres-db-dev psql -U postgres -d ontimetransit

# View all tables
\dt

# View users table
SELECT * FROM users;

# View routes table
SELECT * FROM routes;
```

## 📂 Project Structure

```
OnTimeTransit/
├── backend/
│   ├── user-service/
│   ├── route-service/
│   ├── schedule-service/
│   ├── ticket-service/
│   ├── notification-service/
│   └── analytics-service/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   └── pages/
│   └── public/
├── docker-compose.yml
├── docker-compose.dev.yml
├── .env
├── init-db.sql
└── README.md
```

## 🔐 Security

- JWT token-based authentication
- Role-based access control (USER/ADMIN)
- BCrypt password hashing
- CORS configuration for frontend access
- Input validation and sanitization

## 🚦 CI/CD

The project includes Jenkins pipeline configuration:
- Automated building and testing
- Docker image creation
- Container deployment
- Health check monitoring

## 📊 Monitoring

- Spring Boot Actuator endpoints
- Docker health checks
- Application logs
- Database connection monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📧 Support

For issues and questions:
- Check the troubleshooting guide
- Run `.\troubleshoot.ps1` for diagnostics
- Review Docker logs: `docker-compose logs -f`
- Create an issue in the repository

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.
