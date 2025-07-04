# OnTimeTransit Troubleshooting Script

Write-Host "OnTimeTransit System Diagnostics" -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Yellow

# Check Docker
Write-Host "`nChecking Docker..." -ForegroundColor Cyan
try {
    docker --version
    docker-compose --version
    Write-Host "✓ Docker is installed" -ForegroundColor Green
    
    docker info 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Docker is running" -ForegroundColor Green
    } else {
        Write-Host "✗ Docker is not running" -ForegroundColor Red
        Write-Host "Please start Docker Desktop" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Docker is not installed" -ForegroundColor Red
    Write-Host "Please install Docker Desktop from https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
}

# Check running containers
Write-Host "`nChecking running containers..." -ForegroundColor Cyan
try {
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
} catch {
    Write-Host "Cannot check containers - Docker may not be running" -ForegroundColor Red
}

# Check service health
Write-Host "`nChecking service health..." -ForegroundColor Cyan
$services = @(
    @{Name="PostgreSQL"; URL="http://localhost:5432"; Type="Database"},
    @{Name="User Service"; URL="http://localhost:8089/actuator/health"; Type="API"},
    @{Name="Route Service"; URL="http://localhost:8084/actuator/health"; Type="API"},
    @{Name="Schedule Service"; URL="http://localhost:8085/actuator/health"; Type="API"},
    @{Name="Ticket Service"; URL="http://localhost:8087/actuator/health"; Type="API"},
    @{Name="Notification Service"; URL="http://localhost:8083/actuator/health"; Type="API"},
    @{Name="Analytics Service"; URL="http://localhost:8086/actuator/health"; Type="API"},
    @{Name="Frontend"; URL="http://localhost:3000"; Type="Web"},
    @{Name="PgAdmin"; URL="http://localhost:5050"; Type="Web"}
)

foreach ($service in $services) {
    if ($service.Type -eq "Database") {
        # Check database connectivity
        try {
            $result = docker exec postgres-db-dev pg_isready -U postgres -d ontimetransit 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "$($service.Name): ✓ Running" -ForegroundColor Green
            } else {
                Write-Host "$($service.Name): ✗ Not responding" -ForegroundColor Red
            }
        } catch {
            Write-Host "$($service.Name): ✗ Not responding" -ForegroundColor Red
        }
    } else {
        try {
            $response = Invoke-WebRequest -Uri $service.URL -UseBasicParsing -TimeoutSec 5
            if ($response.StatusCode -eq 200) {
                Write-Host "$($service.Name): ✓ Running" -ForegroundColor Green
            } else {
                Write-Host "$($service.Name): ✗ Status Code: $($response.StatusCode)" -ForegroundColor Red
            }
        } catch {
            Write-Host "$($service.Name): ✗ Not responding ($($_.Exception.Message))" -ForegroundColor Red
        }
    }
}

# Check environment variables
Write-Host "`nChecking environment configuration..." -ForegroundColor Cyan
if (Test-Path ".env") {
    Write-Host "✓ .env file exists" -ForegroundColor Green
    $envContent = Get-Content ".env" | Where-Object { $_ -notmatch "^#" -and $_ -ne "" }
    Write-Host "Environment variables:" -ForegroundColor Yellow
    foreach ($line in $envContent) {
        if ($line -match "PASSWORD" -or $line -match "SECRET") {
            $parts = $line.Split("=", 2)
            Write-Host "  $($parts[0])=***" -ForegroundColor Gray
        } else {
            Write-Host "  $line" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "✗ .env file not found" -ForegroundColor Red
    Write-Host "Please create a .env file with the required environment variables" -ForegroundColor Yellow
}

# Check build artifacts
Write-Host "`nChecking build artifacts..." -ForegroundColor Cyan
$jarFiles = @(
    "backend/user-service/user-service/target/user-service-0.0.1-SNAPSHOT.jar",
    "backend/route-service/route-service/target/route-service-0.0.1-SNAPSHOT.jar",
    "backend/schedule-service/schedule-service/target/schedule-service-0.0.1-SNAPSHOT.jar",
    "backend/ticket-service/ticket-service/target/ticket-service-0.0.1-SNAPSHOT.jar",
    "backend/notification-service/notification-service/target/notification-service-0.0.1-SNAPSHOT.jar",
    "backend/analytics-service/analytics-service/target/analytics-service-0.0.1-SNAPSHOT.jar"
)

foreach ($jar in $jarFiles) {
    if (Test-Path $jar) {
        $size = (Get-Item $jar).Length / 1MB
        Write-Host "✓ $($jar) ($([math]::Round($size, 2)) MB)" -ForegroundColor Green
    } else {
        Write-Host "✗ $jar not found" -ForegroundColor Red
    }
}

# Check logs
Write-Host "`nRecent Docker logs..." -ForegroundColor Cyan
try {
    docker-compose logs --tail=20
} catch {
    Write-Host "Cannot retrieve logs - Docker may not be running" -ForegroundColor Red
}

# Common troubleshooting steps
Write-Host "`n=== Common Troubleshooting Steps ===" -ForegroundColor Yellow
Write-Host "1. Restart Docker Desktop" -ForegroundColor White
Write-Host "2. Run: docker-compose down && docker-compose up -d" -ForegroundColor White
Write-Host "3. Check logs: docker-compose logs -f [service-name]" -ForegroundColor White
Write-Host "4. Rebuild services: docker-compose build --no-cache" -ForegroundColor White
Write-Host "5. Clean Docker: docker system prune -f" -ForegroundColor White
Write-Host "6. Check port conflicts: netstat -an | findstr :8089" -ForegroundColor White
Write-Host "7. Verify database connection: docker exec -it postgres-db-dev psql -U postgres -d ontimetransit" -ForegroundColor White

Write-Host "`n=== Test API Endpoints ===" -ForegroundColor Yellow
Write-Host "User Registration: curl -X POST http://localhost:8089/api/auth/register -H 'Content-Type: application/json' -d '{\"username\":\"testuser\",\"password\":\"testpass\",\"email\":\"test@example.com\"}'" -ForegroundColor White
Write-Host "User Login: curl -X POST http://localhost:8089/api/auth/login -H 'Content-Type: application/json' -d '{\"username\":\"testuser\",\"password\":\"testpass\"}'" -ForegroundColor White
Write-Host "Admin Login: curl -X POST http://localhost:8089/api/auth/login -H 'Content-Type: application/json' -d '{\"username\":\"admin\",\"password\":\"admin123\"}'" -ForegroundColor White
Write-Host "Add Route: curl -X POST http://localhost:8084/api/routes -H 'Content-Type: application/json' -d '{\"startPoint\":\"City A\",\"endPoint\":\"City B\",\"distance\":100,\"estimatedTravelTime\":\"2 hours\"}'" -ForegroundColor White
