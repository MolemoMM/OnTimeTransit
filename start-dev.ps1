# OnTimeTransit Development Build Script

# Check if Docker is installed
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "Docker is not installed. Please install Docker Desktop first." -ForegroundColor Red
    Write-Host "Download from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Check if Docker is running
try {
    docker info 2>$null | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Docker is not running. Please start Docker Desktop." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

Write-Host "Starting OnTimeTransit Development Environment..." -ForegroundColor Green

# Create logs directory if it doesn't exist
if (-not (Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs" -Force
}

# Step 1: Start database first
Write-Host "Starting PostgreSQL database..." -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml up -d postgres

# Wait for database to be ready
Write-Host "Waiting for database to be ready..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
do {
    $attempt++
    Start-Sleep -Seconds 2
    try {
        $result = docker exec postgres-db-dev pg_isready -U postgres -d ontimetransit 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Database is ready!" -ForegroundColor Green
            break
        }
    } catch {
        # Continue waiting
    }
    
    if ($attempt -ge $maxAttempts) {
        Write-Host "Database failed to start after $maxAttempts attempts" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Waiting for database... (attempt $attempt/$maxAttempts)" -ForegroundColor Yellow
} while ($true)

# Step 2: Start PgAdmin
Write-Host "Starting PgAdmin..." -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml up -d pgadmin

# Step 3: Build and run services individually for better debugging
Write-Host "Building backend services..." -ForegroundColor Yellow

# Build user-service
Write-Host "Building user-service..." -ForegroundColor Cyan
Push-Location "backend\user-service\user-service"
try {
    .\mvnw.cmd clean package -DskipTests
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to build user-service" -ForegroundColor Red
        exit 1
    }
} finally {
    Pop-Location
}

# Build route-service
Write-Host "Building route-service..." -ForegroundColor Cyan
Push-Location "backend\route-service\route-service"
try {
    .\mvnw.cmd clean package -DskipTests
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to build route-service" -ForegroundColor Red
        exit 1
    }
} finally {
    Pop-Location
}

# Build other services
$services = @("schedule-service", "ticket-service", "notification-service", "analytics-service")
foreach ($service in $services) {
    Write-Host "Building $service..." -ForegroundColor Cyan
    $servicePath = "backend\$service\$service"
    if (Test-Path $servicePath) {
        Push-Location $servicePath
        try {
            .\mvnw.cmd clean package -DskipTests
            if ($LASTEXITCODE -ne 0) {
                Write-Host "Failed to build $service" -ForegroundColor Red
                exit 1
            }
        } finally {
            Pop-Location
        }
    }
}

Write-Host "All services built successfully!" -ForegroundColor Green

# Step 4: Start services with Docker Compose
Write-Host "Starting all services..." -ForegroundColor Yellow
docker-compose up -d

# Step 5: Check service health
Write-Host "Checking service health..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

$services = @(
    @{Name="User Service"; URL="http://localhost:8089/actuator/health"},
    @{Name="Route Service"; URL="http://localhost:8084/actuator/health"},
    @{Name="Schedule Service"; URL="http://localhost:8085/actuator/health"},
    @{Name="Ticket Service"; URL="http://localhost:8087/actuator/health"},
    @{Name="Notification Service"; URL="http://localhost:8083/actuator/health"},
    @{Name="Analytics Service"; URL="http://localhost:8086/actuator/health"},
    @{Name="Frontend"; URL="http://localhost:3000"}
)

foreach ($service in $services) {
    try {
        $response = Invoke-WebRequest -Uri $service.URL -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host "$($service.Name): ✓ Running" -ForegroundColor Green
        } else {
            Write-Host "$($service.Name): ✗ Not responding" -ForegroundColor Red
        }
    } catch {
        Write-Host "$($service.Name): ✗ Not responding" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "OnTimeTransit Development Environment Started!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "PgAdmin: http://localhost:5050 (admin@admin.com / admin)" -ForegroundColor Cyan
Write-Host "Database: localhost:5432 (postgres / 27711678)" -ForegroundColor Cyan
Write-Host ""
Write-Host "To stop all services, run: docker-compose down" -ForegroundColor Yellow
Write-Host "To view logs, run: docker-compose logs -f [service-name]" -ForegroundColor Yellow
