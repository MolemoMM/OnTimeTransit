Write-Host "🔍 Checking Backend Service Health..." -ForegroundColor Cyan

$services = @(
    @{Name="route-service"; Port=8084},
    @{Name="schedule-service"; Port=8085}, 
    @{Name="ticket-service"; Port=8087},
    @{Name="user-service"; Port=8089}
)

foreach ($service in $services) {
    Write-Host "Testing $($service.Name) on port $($service.Port)..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$($service.Port)/actuator/health" -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $($service.Name) is healthy" -ForegroundColor Green
        } else {
            throw "Unhealthy response"
        }
    } catch {
        Write-Host "❌ $($service.Name) is not responding" -ForegroundColor Red
        Write-Host "🔄 Restarting $($service.Name)..." -ForegroundColor Yellow
        
        docker-compose restart $service.Name
        
        Write-Host "⏱️  Waiting 30 seconds for $($service.Name) to start..." -ForegroundColor Yellow
        Start-Sleep -Seconds 30
    }
}

Write-Host "✅ Health check complete!" -ForegroundColor Green
