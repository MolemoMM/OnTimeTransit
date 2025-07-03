#!/bin/bash

echo "🔍 Checking Backend Service Health..."

services=("route-service:8084" "schedule-service:8085" "ticket-service:8087" "user-service:8089")

for service in "${services[@]}"; do
    IFS=':' read -ra ADDR <<< "$service"
    name="${ADDR[0]}"
    port="${ADDR[1]}"
    
    echo "Testing $name on port $port..."
    
    # Check if service responds
    if curl -s --max-time 5 "http://localhost:$port/actuator/health" > /dev/null 2>&1; then
        echo "✅ $name is healthy"
    else
        echo "❌ $name is not responding"
        echo "🔄 Restarting $name..."
        docker-compose restart "$name"
        echo "⏱️  Waiting 30 seconds for $name to start..."
        sleep 30
    fi
done

echo "✅ Health check complete!"
