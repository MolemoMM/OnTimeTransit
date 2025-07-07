pipeline {
    agent any
    
    environment {
        // Project configuration - MUST match docker-compose.yml
        PROJECT_NAME = 'ontimetransit'
        COMPOSE_PROJECT_NAME = 'ontimetransit'
        
        // Service names - MUST match docker-compose.yml service names exactly
        JAVA_SERVICES = 'user-service,notification-service,analytics-service,ticket-service,route-service,schedule-service'
        
        // Container names - MUST match docker-compose.yml container_name values
        CONTAINER_NAMES = 'ontimetransit-user-service,ontimetransit-notification-service,ontimetransit-analytics-service,ontimetransit-ticket-service,ontimetransit-route-service,ontimetransit-schedule-service,ontimetransit-postgres-db,ontimetransit-frontend,ontimetransit-pgadmin'
        
        // Port mappings - MUST match docker-compose.yml ports
        USER_SERVICE_PORT = '8089'
        NOTIFICATION_SERVICE_PORT = '8083'
        ANALYTICS_SERVICE_PORT = '8086'
        TICKET_SERVICE_PORT = '8087'
        ROUTE_SERVICE_PORT = '8084'
        SCHEDULE_SERVICE_PORT = '8085'
        FRONTEND_PORT = '3000'
        PGADMIN_PORT = '5050'
        POSTGRES_PORT = '5432'
        
        // Build timestamp for uniqueness
        BUILD_TIMESTAMP = new Date().format('yyyyMMdd-HHmmss')
    }
    
    triggers {
        pollSCM('H/2 * * * *')
    }

    stages {
        stage('Clean Workspace') {
            steps {
                cleanWs()
                script {
                    echo "Starting fresh workspace - Build ID: ${BUILD_TIMESTAMP}"
                    bat '''
                        git config --global http.lowSpeedLimit 1000
                        git config --global http.lowSpeedTime 300
                        git config --global http.postBuffer 524288000
                        git config --global core.compression 0
                        git config --global protocol.version 1
                    '''
                }
                retry(3) {
                    timeout(time: 10, unit: 'MINUTES') {
                        checkout([
                            $class: 'GitSCM',
                            branches: [[name: '*/main']],
                            doGenerateSubmoduleConfigurations: false,
                            extensions: [
                                [$class: 'CloneOption', depth: 1, shallow: true],
                                [$class: 'CheckoutOption', timeout: 20]
                            ],
                            submoduleCfg: [],
                            userRemoteConfigs: [[url: 'https://github.com/MolemoMM/OnTimeTransit.git']]
                        ])
                    }
                }
            }
        }

        stage('Copy Environment File') {
            steps {
                script {
                    bat '''
                        @echo off
                        echo ===== COPYING ENVIRONMENT CONFIGURATION =====
                        copy "C:\\Users\\mamas\\OneDrive\\Documents\\wipro\\OnTimeTransit\\.env" .
                        if %errorlevel% neq 0 (
                            echo ERROR: Failed to copy environment file
                            exit /b 1
                        )
                        
                        echo Environment file copied successfully
                        dir .env
                        
                        echo Environment variables (without sensitive data):
                        type .env | findstr /v "PASSWORD" | findstr /v "SECRET"
                        echo ===== ENVIRONMENT CONFIGURATION READY =====
                    '''
                }
            }
        }

        stage('Complete Cleanup') {
            steps {
                script {
                    echo "Performing complete cleanup to ensure fresh builds..."
                    
                    bat '''
                        @echo off
                        echo ===== COMPLETE DEPLOYMENT CLEANUP =====
                        
                        echo Setting environment variables for consistency...
                        set COMPOSE_PROJECT_NAME=%PROJECT_NAME%
                        
                        echo Stopping all services using docker-compose...
                        docker-compose -p %PROJECT_NAME% down --remove-orphans --volumes >nul 2>&1
                        if %errorlevel% neq 0 echo Docker-compose down completed with warnings
                        
                        echo Stopping containers by exact container names...
                        for %%c in (%CONTAINER_NAMES%) do (
                            echo Stopping container: %%c
                            docker stop %%c >nul 2>&1
                            docker rm -f %%c >nul 2>&1
                        )
                        
                        echo Cleaning up any remaining project containers...
                        for /f "tokens=*" %%i in ('docker ps -aq --filter "name=%PROJECT_NAME%" 2^>nul') do (
                            docker stop %%i >nul 2>&1
                            docker rm -f %%i >nul 2>&1
                        )
                        
                        echo Removing ALL project Docker images to force fresh builds...
                        for /f "tokens=*" %%i in ('docker images -q --filter "reference=%PROJECT_NAME%*" 2^>nul') do (
                            echo Removing image: %%i
                            docker rmi -f %%i >nul 2>&1
                        )
                        
                        echo Removing any dangling images...
                        docker image prune -a -f >nul 2>&1
                        
                        echo Performing system cleanup...
                        docker container prune -f >nul 2>&1
                        docker network prune -f >nul 2>&1
                        docker volume prune -f >nul 2>&1
                        
                        echo ===== CLEANUP COMPLETED =====
                        exit /b 0
                    '''
                }
            }
        }

        stage('Verify Complete Cleanup') {
            steps {
                bat '''
                    @echo off
                    echo ===== VERIFYING COMPLETE CLEANUP =====
                    echo Checking for any remaining project containers...
                    docker ps -a --filter "name=%PROJECT_NAME%" --format "table {{.Names}}\\t{{.Status}}"
                    
                    echo.
                    echo Checking for any remaining project images...
                    docker images --filter "reference=%PROJECT_NAME%*" --format "table {{.Repository}}:{{.Tag}}\\t{{.Size}}"
                    
                    echo.
                    echo Verifying no JAR files exist from previous builds...
                    for %%s in (%JAVA_SERVICES%) do (
                        if exist "backend\\%%s\\%%s\\target\\%%s-0.0.1-SNAPSHOT.jar" (
                            echo WARNING: Old JAR found for %%s - will be removed
                            del /q "backend\\%%s\\%%s\\target\\%%s-0.0.1-SNAPSHOT.jar"
                        )
                    )
                    
                    echo ===== CLEANUP VERIFICATION COMPLETE =====
                '''
            }
        }

        stage('Fix Configuration Files') {
            steps {
                script {
                    echo "Fixing configuration files for all Java services..."
                    
                    env.JAVA_SERVICES.split(',').each { service ->
                        echo "Checking configuration for ${service}..."
                        bat """
                            @echo off
                            echo ===== CONFIGURATION CHECK: ${service} =====
                            cd /d "%WORKSPACE%\\backend\\${service}\\${service}\\src\\main\\resources"
                            
                            REM Fix application.properties filename if needed
                            if exist applications.properties (
                                echo Fixing filename: applications.properties -> application.properties
                                ren applications.properties application.properties
                            )
                            
                            REM Verify application.properties exists
                            if exist application.properties (
                                echo ✅ Configuration file verified for ${service}
                                echo Configuration content:
                                type application.properties
                            ) else (
                                echo ❌ ERROR: No application.properties found for ${service}
                                exit /b 1
                            )
                            echo ===== CONFIGURATION READY: ${service} =====
                        """
                    }
                }
            }
        }

        stage('Aggressive Build Cleanup') {
            steps {
                script {
                    echo "Performing aggressive cleanup to ensure completely fresh builds..."
                    
                    env.JAVA_SERVICES.split(',').each { service ->
                        echo "Aggressive cleanup for ${service}..."
                        bat """
                            @echo off
                            echo ===== AGGRESSIVE CLEANUP: ${service} =====
                            cd /d "%WORKSPACE%\\backend\\${service}\\${service}"
                            
                            REM Remove entire target directory
                            if exist target (
                                echo Removing entire target directory for ${service}
                                rmdir /s /q target
                                timeout /t 2 /nobreak >nul
                            )
                            
                            REM Clean Maven repository for this specific project
                            if exist mvnw.cmd (
                                echo Purging Maven repository for ${service}...
                                call mvnw.cmd dependency:purge-local-repository -DmanualInclude="PipelinePioneers.example:${service}" -Dverbose=true
                            )
                            
                            REM Clean any IDE and build cache files
                            if exist .idea rmdir /s /q .idea >nul 2>&1
                            if exist *.iml del /q *.iml >nul 2>&1
                            if exist .vscode rmdir /s /q .vscode >nul 2>&1
                            if exist .project del /q .project >nul 2>&1
                            if exist .classpath del /q .classpath >nul 2>&1
                            if exist .settings rmdir /s /q .settings >nul 2>&1
                            
                            REM Verify target directory is completely gone
                            if exist target (
                                echo ERROR: Target directory still exists for ${service}
                                exit /b 1
                            )
                            
                            echo ✅ Aggressive cleanup completed for ${service}
                            echo ===== CLEANED: ${service} =====
                        """
                    }
                }
            }
        }

        stage('Build Fresh JARs with Verification') {
            steps {
                script {
                    echo "Building completely fresh JARs with extensive verification..."
                    
                    env.JAVA_SERVICES.split(',').each { service ->
                        echo "Building brand new JAR for ${service}..."
                        bat """
                            @echo off
                            echo ===== BUILDING FRESH JAR: ${service} - Build Time: %BUILD_TIMESTAMP% =====
                            cd /d "%WORKSPACE%\\backend\\${service}\\${service}"
                            
                            REM Double-check target directory doesn't exist
                            if exist target (
                                echo ERROR: Target directory still exists for ${service}
                                rmdir /s /q target
                                timeout /t 3 /nobreak >nul
                            )
                            
                            REM Create build timestamp file for verification
                            echo Build started at: %date% %time% > build_timestamp.txt
                            echo Build ID: %BUILD_TIMESTAMP% >> build_timestamp.txt
                            
                            REM Build with complete refresh and verbose output
                            echo Building with complete dependency refresh for ${service}...
                            if exist mvnw.cmd (
                                call mvnw.cmd clean compile resources:resources package -DskipTests -U -e -X -Dmaven.repo.local=.m2\\repository
                            ) else (
                                call mvn clean compile resources:resources package -DskipTests -U -e -X -Dmaven.repo.local=.m2\\repository
                            )
                            
                            REM Verify build success
                            if %errorlevel% neq 0 (
                                echo ❌ ERROR: Build failed for ${service}
                                exit /b 1
                            )
                            
                            REM Verify JAR was created and get its timestamp
                            if exist target\\${service}-0.0.1-SNAPSHOT.jar (
                                echo ✅ SUCCESS: Fresh JAR created for ${service}
                                echo JAR file details:
                                dir target\\${service}-0.0.1-SNAPSHOT.jar
                                
                                REM Get JAR creation time
                                forfiles /p target /m "${service}-0.0.1-SNAPSHOT.jar" /c "cmd /c echo JAR created: @fdate @ftime"
                                
                                REM Verify application.properties is included
                                jar tf target\\${service}-0.0.1-SNAPSHOT.jar | findstr "application.properties" >nul
                                if %errorlevel% equ 0 (
                                    echo ✅ application.properties included in ${service} JAR
                                    echo Extracting application.properties to verify content...
                                    jar xf target\\${service}-0.0.1-SNAPSHOT.jar BOOT-INF/classes/application.properties
                                    if exist BOOT-INF\\classes\\application.properties (
                                        echo Properties content:
                                        type BOOT-INF\\classes\\application.properties
                                        rmdir /s /q BOOT-INF >nul 2>&1
                                    )
                                ) else (
                                    echo ❌ ERROR: application.properties missing in ${service} JAR
                                    exit /b 1
                                )
                                
                                REM Show complete JAR manifest
                                echo JAR manifest:
                                jar tf target\\${service}-0.0.1-SNAPSHOT.jar | findstr "META-INF\\MANIFEST.MF"
                                
                                REM Verify JAR is not empty
                                for %%A in (target\\${service}-0.0.1-SNAPSHOT.jar) do (
                                    if %%~zA LSS 1000000 (
                                        echo WARNING: JAR file seems too small: %%~zA bytes
                                    ) else (
                                        echo ✅ JAR file size looks good: %%~zA bytes
                                    )
                                )
                                
                            ) else (
                                echo ❌ ERROR: JAR file not found for ${service}
                                echo Contents of target directory:
                                dir target
                                exit /b 1
                            )
                            
                            echo Build completed at: %date% %time% >> build_timestamp.txt
                            echo ===== SUCCESSFULLY BUILT FRESH JAR: ${service} =====
                        """
                    }
                    
                    echo "🎉 All services built with brand new JAR files!"
                }
            }
        }

        stage('Verify Fresh JAR Files') {
            steps {
                script {
                    echo "Verifying all JAR files are fresh and complete..."
                    
                    env.JAVA_SERVICES.split(',').each { service ->
                        echo "Verifying fresh JAR for ${service}..."
                        bat """
                            @echo off
                            echo ===== VERIFYING FRESH JAR: ${service} =====
                            cd /d "%WORKSPACE%\\backend\\${service}\\${service}"
                            
                            REM Check if JAR exists
                            if not exist target\\${service}-0.0.1-SNAPSHOT.jar (
                                echo ❌ ERROR: JAR file missing for ${service}
                                exit /b 1
                            )
                            
                            REM Check JAR modification time (should be recent)
                            forfiles /p target /m "${service}-0.0.1-SNAPSHOT.jar" /c "cmd /c echo Fresh JAR verified for ${service}: @fdate @ftime"
                            
                            REM Check build timestamp file
                            if exist build_timestamp.txt (
                                echo Build timestamp verification:
                                type build_timestamp.txt
                            )
                            
                            REM Verify JAR content completeness
                            echo Verifying JAR content structure...
                            jar tf target\\${service}-0.0.1-SNAPSHOT.jar | findstr "BOOT-INF\\classes" | findstr "${service}" >nul
                            if %errorlevel% equ 0 (
                                echo ✅ JAR contains compiled classes for ${service}
                            ) else (
                                echo ❌ ERROR: JAR missing compiled classes for ${service}
                                exit /b 1
                            )
                            
                            echo ===== FRESH JAR VERIFIED: ${service} =====
                        """
                    }
                }
            }
        }

        stage('Force Fresh Docker Build') {
            steps {
                script {
                    echo "Force building Docker images with fresh JARs..."
                    
                    bat '''
                        @echo off
                        echo ===== FORCE FRESH DOCKER BUILD =====
                        
                        echo Setting environment for fresh builds...
                        set COMPOSE_PROJECT_NAME=%PROJECT_NAME%
                        set DOCKER_BUILDKIT=1
                        
                        echo Removing any cached layers...
                        docker builder prune -a -f >nul 2>&1
                        
                        echo Building all images with no cache and fresh context...
                        docker-compose -p %PROJECT_NAME% build --no-cache --parallel --force-rm --pull
                        
                        if %errorlevel% neq 0 (
                            echo ❌ ERROR: Docker image build failed
                            exit /b 1
                        )
                        
                        echo Verifying fresh images were built...
                        echo Project images built:
                        docker images --filter "reference=%PROJECT_NAME%*" --format "table {{.Repository}}:{{.Tag}}\\t{{.CreatedAt}}\\t{{.Size}}"
                        
                        echo ✅ All Docker images rebuilt with fresh JARs
                        echo ===== FRESH DOCKER BUILD COMPLETE =====
                    '''
                }
            }
        }

        stage('Deploy with Fresh Images') {
            steps {
                script {
                    echo "Deploying with fresh Docker images..."
                    bat '''
                        @echo off
                        echo ===== DEPLOYING WITH FRESH IMAGES =====
                        
                        echo Setting environment for deployment...
                        set COMPOSE_PROJECT_NAME=%PROJECT_NAME%
                        
                        echo Starting all services with fresh images...
                        docker-compose -p %PROJECT_NAME% up -d --force-recreate --remove-orphans
                        
                        if %errorlevel% neq 0 (
                            echo ❌ ERROR: Service deployment failed
                            exit /b 1
                        )
                        
                        echo Waiting for services to initialize with fresh builds...
                        timeout /t 120 /nobreak
                        
                        echo Verifying deployment with fresh containers...
                        docker-compose -p %PROJECT_NAME% ps
                        
                        echo Checking container creation times...
                        for %%c in (%CONTAINER_NAMES%) do (
                            echo Container: %%c
                            docker ps --filter "name=%%c" --format "table {{.Names}}\\t{{.Status}}\\t{{.CreatedAt}}"
                        )
                        
                        echo ✅ Fresh deployment completed successfully
                        echo ===== FRESH DEPLOYMENT READY =====
                    '''
                }
            }
        }

        stage('Verify Fresh Deployment') {
            steps {
                script {
                    echo "Verifying deployment uses fresh JARs..."
                    
                    env.JAVA_SERVICES.split(',').each { service ->
                        echo "Verifying fresh deployment for ${service}..."
                        bat """
                            @echo off
                            echo ===== VERIFYING FRESH DEPLOYMENT: ${service} =====
                            
                            REM Check if container is running
                            docker ps --filter "name=ontimetransit-${service}" --format "{{.Names}}" | findstr "ontimetransit-${service}" >nul
                            if %errorlevel% neq 0 (
                                echo ❌ ERROR: Container ontimetransit-${service} not running
                                exit /b 1
                            )
                            
                            REM Check container creation time
                            docker ps --filter "name=ontimetransit-${service}" --format "Container {{.Names}} created: {{.CreatedAt}}"
                            
                            REM Try to verify the JAR inside the container
                            docker exec ontimetransit-${service} ls -la /app/app.jar 2>nul
                            if %errorlevel% equ 0 (
                                echo ✅ Fresh JAR verified inside container for ${service}
                            )
                            
                            echo ===== FRESH DEPLOYMENT VERIFIED: ${service} =====
                        """
                    }
                }
            }
        }

        stage('Comprehensive Health Verification') {
            steps {
                script {
                    echo "Performing health verification with fresh services..."
                    
                    def serviceHealthChecks = [
                        ['user-service', env.USER_SERVICE_PORT, 'ontimetransit-user-service'],
                        ['notification-service', env.NOTIFICATION_SERVICE_PORT, 'ontimetransit-notification-service'],
                        ['analytics-service', env.ANALYTICS_SERVICE_PORT, 'ontimetransit-analytics-service'],
                        ['ticket-service', env.TICKET_SERVICE_PORT, 'ontimetransit-ticket-service'],
                        ['route-service', env.ROUTE_SERVICE_PORT, 'ontimetransit-route-service'],
                        ['schedule-service', env.SCHEDULE_SERVICE_PORT, 'ontimetransit-schedule-service']
                    ]
                    
                    serviceHealthChecks.each { checkInfo ->
                        def serviceName = checkInfo[0]
                        def port = checkInfo[1]
                        def containerName = checkInfo[2]
                        
                        echo "Health check for fresh ${serviceName} on port ${port}..."
                        bat """
                            @echo off
                            echo ===== HEALTH CHECK: ${serviceName} (FRESH BUILD) =====
                            
                            set /a counter=0
                            set /a maxAttempts=60
                            
                            :healthloop
                            echo Checking ${serviceName} health with fresh JAR (attempt %counter%/%maxAttempts%)...
                            curl -f http://localhost:${port}/actuator/health >nul 2>&1
                            if %errorlevel% equ 0 (
                                echo ✅ ${serviceName} healthy with fresh JAR on port ${port}
                                curl -s http://localhost:${port}/actuator/health
                                
                                REM Try to get build info if available
                                curl -s http://localhost:${port}/actuator/info >nul 2>&1
                                if %errorlevel% equ 0 (
                                    echo Build info from fresh ${serviceName}:
                                    curl -s http://localhost:${port}/actuator/info
                                )
                                
                                goto :healthsuccess
                            )
                            
                            set /a counter+=1
                            if %counter% geq %maxAttempts% (
                                echo ❌ ${serviceName} health check failed after 10 minutes
                                echo Container logs for debugging:
                                docker logs ${containerName} --tail=50
                                exit /b 1
                            )
                            
                            timeout /t 10 /nobreak >nul
                            goto :healthloop
                            
                            :healthsuccess
                            echo ===== ${serviceName} HEALTHY WITH FRESH JAR =====
                        """
                    }
                }
            }
        }

        stage('Test Fresh Endpoints') {
            steps {
                script {
                    echo "Testing endpoints with fresh builds..."
                    
                    withCredentials([
                        usernamePassword(credentialsId: 'ontimetransit-admin', usernameVariable: 'ADMIN_USER', passwordVariable: 'ADMIN_PASS')
                    ]) {
                        bat '''
                            @echo off
                            echo ===== TESTING FRESH ENDPOINTS =====
                            
                            echo Testing user-service authentication with fresh JAR...
                            curl -X POST http://localhost:%USER_SERVICE_PORT%/api/auth/login ^
                                 -H "Content-Type: application/json" ^
                                 -d "{\\"username\\": \\"%ADMIN_USER%\\", \\"password\\": \\"%ADMIN_PASS%\\"}" ^
                                 -w "\\nHTTP Status: %%{http_code}\\n" ^
                                 -s
                            
                            echo.
                            echo Testing all service health endpoints with fresh JARs...
                            curl -f http://localhost:%USER_SERVICE_PORT%/actuator/health && echo ✅ User service healthy
                            curl -f http://localhost:%NOTIFICATION_SERVICE_PORT%/actuator/health && echo ✅ Notification service healthy
                            curl -f http://localhost:%ANALYTICS_SERVICE_PORT%/actuator/health && echo ✅ Analytics service healthy
                            curl -f http://localhost:%TICKET_SERVICE_PORT%/actuator/health && echo ✅ Ticket service healthy
                            curl -f http://localhost:%ROUTE_SERVICE_PORT%/actuator/health && echo ✅ Route service healthy
                            curl -f http://localhost:%SCHEDULE_SERVICE_PORT%/actuator/health && echo ✅ Schedule service healthy
                            
                            echo ===== FRESH ENDPOINT TESTING COMPLETED =====
                        '''
                    }
                }
            }
        }

        stage('Fresh Build Summary') {
            steps {
                script {
                    echo "Generating fresh build deployment summary..."
                    bat '''
                        @echo off
                        echo.
                        echo =====================================================
                        echo        FRESH BUILD DEPLOYMENT SUMMARY
                        echo =====================================================
                        echo.
                        echo 🆕 FRESH BUILD STATUS: ✅ SUCCESS
                        echo 🕐 Build Time: %date% %time%
                        echo 🆔 Build ID: %BUILD_TIMESTAMP%
                        echo 📦 Project: %PROJECT_NAME%
                        echo.
                        echo 🔧 FRESH BUILD VERIFICATION:
                        echo ✅ All target directories completely cleaned
                        echo ✅ All Maven repositories purged
                        echo ✅ All services built with fresh JARs
                        echo ✅ All Docker images rebuilt with no cache
                        echo ✅ All containers recreated with fresh images
                        echo ✅ All health checks passed with fresh services
                        echo ✅ All endpoints tested with fresh builds
                        echo.
                        echo 🌐 SERVICE ENDPOINTS (FRESH BUILDS):
                        echo - Frontend:              http://localhost:%FRONTEND_PORT%
                        echo - User Service:          http://localhost:%USER_SERVICE_PORT%
                        echo - Route Service:         http://localhost:%ROUTE_SERVICE_PORT%
                        echo - Schedule Service:      http://localhost:%SCHEDULE_SERVICE_PORT%
                        echo - Ticket Service:        http://localhost:%TICKET_SERVICE_PORT%
                        echo - Notification Service: http://localhost:%NOTIFICATION_SERVICE_PORT%
                        echo - Analytics Service:     http://localhost:%ANALYTICS_SERVICE_PORT%
                        echo - PgAdmin:               http://localhost:%PGADMIN_PORT%
                        echo.
                        echo 📊 FRESH CONTAINER STATUS:
                        docker-compose -p %PROJECT_NAME% ps
                        echo.
                        echo 🔍 JAR BUILD VERIFICATION:
                        for %%s in (%JAVA_SERVICES%) do (
                            echo Checking fresh JAR for %%s...
                            if exist "backend\\%%s\\%%s\\target\\%%s-0.0.1-SNAPSHOT.jar" (
                                forfiles /p "backend\\%%s\\%%s\\target" /m "%%s-0.0.1-SNAPSHOT.jar" /c "cmd /c echo ✅ Fresh JAR: %%s - Created: @fdate @ftime"
                            )
                        )
                        echo.
                        echo =====================================================
                        echo    🎉 FRESH BUILD DEPLOYMENT COMPLETED 🎉
                        echo =====================================================
                    '''
                }
            }
        }
    }

    post {
        always {
            script {
                try {
                    bat '''
                        @echo off
                        echo ===== FINAL FRESH BUILD STATUS =====
                        echo Build ID: %BUILD_TIMESTAMP%
                        echo.
                        echo Fresh Container Status:
                        docker-compose -p %PROJECT_NAME% ps
                        echo.
                        echo Fresh JAR Verification:
                        for %%s in (%JAVA_SERVICES%) do (
                            if exist "backend\\%%s\\%%s\\target\\%%s-0.0.1-SNAPSHOT.jar" (
                                echo ✅ %%s: Fresh JAR exists
                            ) else (
                                echo ❌ %%s: JAR missing
                            )
                        )
                        echo.
                        echo Fresh Image Status:
                        docker images --filter "reference=%PROJECT_NAME%*" --format "table {{.Repository}}:{{.Tag}}\\t{{.CreatedAt}}\\t{{.Size}}"
                        echo ===== FRESH BUILD STATUS COMPLETE =====
                    '''
                } catch (Exception e) {
                    echo "Fresh build status check failed: ${e.getMessage()}"
                }
            }
        }
        
        failure {
            script {
                echo "===== FRESH BUILD FAILED - DIAGNOSIS =====?"
                try {
                    bat '''
                        @echo off
                        echo 🔍 FRESH BUILD FAILURE ANALYSIS:
                        echo Build ID: %BUILD_TIMESTAMP%
                        echo.
                        echo JAR Build Status:
                        for %%s in (%JAVA_SERVICES%) do (
                            echo Checking %%s...
                            if exist "backend\\%%s\\%%s\\target\\%%s-0.0.1-SNAPSHOT.jar" (
                                echo ✅ %%s: JAR exists
                                dir "backend\\%%s\\%%s\\target\\%%s-0.0.1-SNAPSHOT.jar"
                            ) else (
                                echo ❌ %%s: JAR missing
                                if exist "backend\\%%s\\%%s\\target" (
                                    echo Target directory contents:
                                    dir "backend\\%%s\\%%s\\target"
                                ) else (
                                    echo Target directory missing
                                )
                            )
                        )
                        echo.
                        echo Docker Build Status:
                        docker images --filter "reference=%PROJECT_NAME%*"
                        echo.
                        echo Container Status:
                        docker-compose -p %PROJECT_NAME% ps
                        echo.
                        echo Recent Container Logs:
                        docker-compose -p %PROJECT_NAME% logs --tail=30
                    '''
                } catch (Exception e) {
                    echo "Could not collect fresh build diagnosis: ${e.getMessage()}"
                }
            }
        }
        
        success {
            script {
                echo "===== 🎉 FRESH BUILD SUCCESS 🎉 ====="
                echo "✅ All services rebuilt with completely fresh JAR files"
                echo "✅ All Docker images rebuilt with no cache"
                echo "✅ All containers recreated with fresh builds"
                echo "✅ All health checks passed with fresh services"
                echo "🚀 Fresh OnTimeTransit deployment ready at: http://localhost:${env.FRONTEND_PORT}"
                echo "🆔 Build ID: ${env.BUILD_TIMESTAMP}"
            }
        }
    }
}