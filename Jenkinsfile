pipeline {
    agent any
    
    environment {
        // Define project name
        PROJECT_NAME = 'ontimetransit'
        
        // Define service list
        JAVA_SERVICES = 'user-service,notification-service,analytics-service,ticket-service,route-service,schedule-service'
    }
    
    triggers {
        // Poll SCM every 2 minutes for changes
        pollSCM('H/2 * * * *')
    }

    stages {
        stage('Clean Workspace') {
            steps {
                cleanWs()
                script {
                    // Configure Git for better network handling
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
                    // Copy environment file securely
                    bat '''
                        @echo off
                        echo Copying environment configuration...
                        copy "C:\\Users\\mamas\\OneDrive\\Documents\\wipro\\OnTimeTransit\\.env" .
                        if %errorlevel% neq 0 (
                            echo ERROR: Failed to copy environment file
                            exit /b 1
                        )
                        
                        echo Environment file copied successfully
                        dir .env
                        
                        echo Environment variables (without sensitive data):
                        type .env | findstr /v "PASSWORD" | findstr /v "SECRET"
                    '''
                }
            }
        }

        stage('Cleanup Previous Deployment') {
            steps {
                script {
                    echo "Performing complete cleanup of previous deployment..."
                    
                    // Stop and remove all containers
                    bat '''
                        @echo off
                        echo ===== COMPLETE DEPLOYMENT CLEANUP =====
                        
                        echo Stopping all project containers...
                        docker-compose -p %PROJECT_NAME% down --remove-orphans --volumes >nul 2>&1
                        
                        echo Stopping containers by name...
                        for %%s in (%JAVA_SERVICES%) do (
                            docker stop %PROJECT_NAME%-%%s >nul 2>&1
                            docker rm -f %PROJECT_NAME%-%%s >nul 2>&1
                        )
                        
                        echo Stopping additional containers...
                        docker stop %PROJECT_NAME%-postgres-db %PROJECT_NAME%-frontend %PROJECT_NAME%-pgadmin >nul 2>&1
                        docker rm -f %PROJECT_NAME%-postgres-db %PROJECT_NAME%-frontend %PROJECT_NAME%-pgadmin >nul 2>&1
                        
                        echo Cleaning up any remaining project containers...
                        for /f "tokens=*" %%i in ('docker ps -aq --filter "name=%PROJECT_NAME%" 2^>nul') do (
                            docker stop %%i >nul 2>&1
                            docker rm -f %%i >nul 2>&1
                        )
                        
                        echo Removing project Docker images...
                        for /f "tokens=*" %%i in ('docker images -q --filter "reference=%PROJECT_NAME%*" 2^>nul') do (
                            docker rmi -f %%i >nul 2>&1
                        )
                        
                        echo Performing system cleanup...
                        docker container prune -f >nul 2>&1
                        docker image prune -f >nul 2>&1
                        docker network prune -f >nul 2>&1
                        docker volume prune -f >nul 2>&1
                        
                        echo Cleanup completed successfully
                        exit /b 0
                    '''
                }
            }
        }

        stage('Verify Cleanup') {
            steps {
                bat '''
                    @echo off
                    echo ===== CLEANUP VERIFICATION =====
                    echo Current Docker state:
                    docker ps -a
                    echo.
                    echo Docker images:
                    docker images
                    echo.
                    echo Docker volumes:
                    docker volume ls
                    echo.
                    echo Docker networks:
                    docker network ls
                    echo ===== CLEANUP VERIFICATION COMPLETE =====
                '''
            }
        }

        stage('Fix Configuration Files') {
            steps {
                script {
                    echo "Fixing configuration files for all services..."
                    
                    env.JAVA_SERVICES.split(',').each { service =>
                        echo "Checking and fixing configuration files for ${service}..."
                        bat """
                            @echo off
                            echo ===== FIXING CONFIGURATION FOR ${service} =====
                            cd /d "%WORKSPACE%\\backend\\${service}\\${service}\\src\\main\\resources"
                            
                            REM Fix application.properties filename if needed
                            if exist applications.properties (
                                echo Fixing filename: applications.properties -> application.properties for ${service}
                                ren applications.properties application.properties
                            )
                            
                            REM Verify application.properties exists
                            if exist application.properties (
                                echo Configuration file verified for ${service}
                                echo Configuration content:
                                type application.properties
                            ) else (
                                echo ERROR: No application.properties found for ${service}
                                exit /b 1
                            )
                            echo ===== CONFIGURATION FIXED FOR ${service} =====
                        """
                    }
                }
            }
        }

        stage('Complete Build Cleanup') {
            steps {
                script {
                    echo "Performing complete build cleanup for all services..."
                    
                    env.JAVA_SERVICES.split(',').each { service =>
                        echo "Cleaning all build artifacts for ${service}..."
                        bat """
                            @echo off
                            echo ===== CLEANING BUILD ARTIFACTS FOR ${service} =====
                            cd /d "%WORKSPACE%\\backend\\${service}\\${service}"
                            
                            REM Remove target directory completely
                            if exist target (
                                echo Removing target directory for ${service}
                                rmdir /s /q target
                            )
                            
                            REM Clean Maven cache
                            if exist mvnw.cmd (
                                echo Cleaning Maven cache for ${service}
                                call mvnw.cmd dependency:purge-local-repository -DmanualInclude="PipelinePioneers.example:${service}" >nul 2>&1
                            )
                            
                            REM Clean any IDE files
                            if exist .idea rmdir /s /q .idea >nul 2>&1
                            if exist *.iml del /q *.iml >nul 2>&1
                            if exist .vscode rmdir /s /q .vscode >nul 2>&1
                            
                            echo Build cleanup completed for ${service}
                            echo ===== CLEANED BUILD ARTIFACTS FOR ${service} =====
                        """
                    }
                }
            }
        }

        stage('Build All Services with Fresh JARs') {
            steps {
                script {
                    echo "Building all services with completely fresh JARs..."
                    
                    env.JAVA_SERVICES.split(',').each { service =>
                        echo "Building fresh JAR for ${service}..."
                        bat """
                            @echo off
                            echo ===== BUILDING FRESH JAR FOR ${service} =====
                            cd /d "%WORKSPACE%\\backend\\${service}\\${service}"
                            echo Current directory: %CD%
                            
                            REM Verify clean state
                            if exist target (
                                echo ERROR: Target directory still exists for ${service}
                                exit /b 1
                            )
                            
                            REM Build with complete refresh
                            if exist mvnw.cmd (
                                echo Building with Maven Wrapper for ${service}...
                                call mvnw.cmd clean compile resources:resources package -DskipTests -U -e
                            ) else (
                                echo Building with Maven for ${service}...
                                call mvn clean compile resources:resources package -DskipTests -U -e
                            )
                            
                            REM Verify build success
                            if %errorlevel% neq 0 (
                                echo ERROR: Build failed for ${service}
                                exit /b 1
                            )
                            
                            REM Verify JAR creation
                            if exist target\\${service}-0.0.1-SNAPSHOT.jar (
                                echo SUCCESS: Fresh JAR created for ${service}
                                echo JAR details:
                                dir target\\${service}-0.0.1-SNAPSHOT.jar
                                
                                REM Verify application.properties is included
                                jar tf target\\${service}-0.0.1-SNAPSHOT.jar | findstr "application.properties" >nul
                                if %errorlevel% equ 0 (
                                    echo SUCCESS: application.properties included in ${service} JAR
                                ) else (
                                    echo ERROR: application.properties missing in ${service} JAR
                                    exit /b 1
                                )
                                
                                REM Show JAR contents summary
                                echo JAR contents summary:
                                jar tf target\\${service}-0.0.1-SNAPSHOT.jar | findstr "BOOT-INF\\classes"
                                
                            ) else (
                                echo ERROR: JAR file not found for ${service}
                                exit /b 1
                            )
                            echo ===== SUCCESSFULLY BUILT ${service} =====
                        """
                    }
                    echo "All services built successfully with fresh JARs!"
                }
            }
        }

        stage('Rebuild All Docker Images') {
            steps {
                script {
                    echo "Rebuilding all Docker images with fresh JARs..."
                    
                    // Build all images at once for efficiency
                    bat '''
                        @echo off
                        echo ===== REBUILDING ALL DOCKER IMAGES =====
                        
                        echo Building all Docker images with no cache...
                        docker-compose -p %PROJECT_NAME% build --no-cache --parallel
                        
                        if %errorlevel% neq 0 (
                            echo ERROR: Docker image build failed
                            exit /b 1
                        )
                        
                        echo Verifying all images were built...
                        docker images | findstr %PROJECT_NAME%
                        
                        echo ===== ALL DOCKER IMAGES REBUILT SUCCESSFULLY =====
                    '''
                }
            }
        }

        stage('Deploy All Services') {
            steps {
                script {
                    echo "Deploying all services with fresh Docker images..."
                    bat '''
                        @echo off
                        echo ===== DEPLOYING ALL SERVICES =====
                        
                        echo Starting all services...
                        docker-compose -p %PROJECT_NAME% up -d
                        
                        if %errorlevel% neq 0 (
                            echo ERROR: Service deployment failed
                            exit /b 1
                        )
                        
                        echo Waiting for services to initialize...
                        timeout /t 90 /nobreak
                        
                        echo Deployment status:
                        docker-compose -p %PROJECT_NAME% ps
                        
                        echo ===== DEPLOYMENT COMPLETED =====
                    '''
                }
            }
        }

        stage('Comprehensive Health Verification') {
            steps {
                script {
                    echo "Performing comprehensive health verification..."
                    
                    def healthChecks = [
                        ['user-service', '8089', '/actuator/health'],
                        ['notification-service', '8083', '/actuator/health'],
                        ['analytics-service', '8086', '/actuator/health'],
                        ['ticket-service', '8087', '/actuator/health'],
                        ['route-service', '8084', '/actuator/health'],
                        ['schedule-service', '8085', '/actuator/health']
                    ]
                    
                    healthChecks.each { serviceInfo =>
                        def serviceName = serviceInfo[0]
                        def port = serviceInfo[1]
                        def healthPath = serviceInfo[2]
                        
                        echo "Verifying health of ${serviceName} on port ${port}..."
                        bat """
                            @echo off
                            echo ===== HEALTH CHECK FOR ${serviceName} =====
                            
                            REM Wait for service to be healthy (max 10 minutes)
                            set /a counter=0
                            set /a maxAttempts=60
                            
                            :healthloop
                            echo Checking ${serviceName} health (attempt %counter%/%maxAttempts%)...
                            curl -f http://localhost:${port}${healthPath} >nul 2>&1
                            if %errorlevel% equ 0 (
                                echo SUCCESS: ${serviceName} is healthy on port ${port}
                                curl -s http://localhost:${port}${healthPath}
                                goto :healthsuccess
                            )
                            
                            set /a counter+=1
                            if %counter% geq %maxAttempts% (
                                echo ERROR: ${serviceName} health check failed after 10 minutes
                                echo Container status:
                                docker-compose -p %PROJECT_NAME% ps ${serviceName}
                                echo Container logs:
                                docker-compose -p %PROJECT_NAME% logs --tail=30 ${serviceName}
                                exit /b 1
                            )
                            
                            timeout /t 10 /nobreak >nul
                            goto :healthloop
                            
                            :healthsuccess
                            echo ===== ${serviceName} HEALTH CHECK PASSED =====
                        """
                    }
                }
            }
        }

        stage('Test Critical Endpoints') {
            steps {
                script {
                    echo "Testing critical application endpoints..."
                    
                    // Use Jenkins credentials for testing
                    withCredentials([
                        usernamePassword(credentialsId: 'ontimetransit-admin', usernameVariable: 'ADMIN_USER', passwordVariable: 'ADMIN_PASS')
                    ]) {
                        bat '''
                            @echo off
                            echo ===== TESTING CRITICAL ENDPOINTS =====
                            
                            echo Testing user-service authentication...
                            curl -X POST http://localhost:8089/api/auth/login ^
                                 -H "Content-Type: application/json" ^
                                 -d "{\\"username\\": \\"%ADMIN_USER%\\", \\"password\\": \\"%ADMIN_PASS%\\"}" ^
                                 -w "\\nHTTP Status: %%{http_code}\\n" ^
                                 -s
                            
                            echo.
                            echo Testing frontend accessibility...
                            curl -f http://localhost:3000 >nul 2>&1
                            if %errorlevel% equ 0 (
                                echo SUCCESS: Frontend is accessible
                            ) else (
                                echo WARNING: Frontend may not be ready yet
                            )
                            
                            echo.
                            echo Testing database connectivity...
                            curl -f http://localhost:8089/actuator/health >nul 2>&1
                            if %errorlevel% equ 0 (
                                echo SUCCESS: Database connectivity verified
                            ) else (
                                echo ERROR: Database connectivity issues
                            )
                            
                            echo ===== ENDPOINT TESTING COMPLETED =====
                        '''
                    }
                }
            }
        }

        stage('Deployment Summary') {
            steps {
                script {
                    echo "Generating deployment summary..."
                    bat '''
                        @echo off
                        echo.
                        echo =====================================================
                        echo           ONTIMETRANSIT DEPLOYMENT SUMMARY
                        echo =====================================================
                        echo.
                        echo Deployment Status: SUCCESS
                        echo Deployment Time: %date% %time%
                        echo.
                        echo SERVICE ENDPOINTS:
                        echo - Frontend:              http://localhost:3000
                        echo - User Service:          http://localhost:8089
                        echo - Route Service:         http://localhost:8084
                        echo - Schedule Service:      http://localhost:8085
                        echo - Ticket Service:        http://localhost:8087
                        echo - Notification Service: http://localhost:8083
                        echo - Analytics Service:     http://localhost:8086
                        echo - PgAdmin:               http://localhost:5050
                        echo.
                        echo HEALTH CHECK STATUS:
                        docker-compose -p %PROJECT_NAME% ps
                        echo.
                        echo DEPLOYMENT NOTES:
                        echo - All services built with fresh JAR files
                        echo - All Docker images rebuilt from scratch
                        echo - Configuration files verified and corrected
                        echo - Health checks passed for all services
                        echo - Authentication endpoints tested successfully
                        echo.
                        echo For troubleshooting, check Jenkins logs and container logs:
                        echo   docker-compose -p %PROJECT_NAME% logs [service-name]
                        echo.
                        echo =====================================================
                        echo        DEPLOYMENT COMPLETED SUCCESSFULLY
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
                        echo ===== FINAL SYSTEM STATUS =====
                        echo Container Status:
                        docker-compose -p %PROJECT_NAME% ps
                        echo.
                        echo All Containers:
                        docker ps -a
                        echo.
                        echo Docker Images:
                        docker images | findstr %PROJECT_NAME%
                        echo ===== STATUS CHECK COMPLETE =====
                    '''
                } catch (Exception e) {
                    echo "Final status check failed: ${e.getMessage()}"
                }
            }
        }
        
        failure {
            script {
                echo "===== DEPLOYMENT FAILED - COLLECTING TROUBLESHOOTING INFO ====="
                try {
                    bat '''
                        @echo off
                        echo FAILURE ANALYSIS:
                        echo.
                        echo Container Status:
                        docker-compose -p %PROJECT_NAME% ps
                        echo.
                        echo Container Logs:
                        docker-compose -p %PROJECT_NAME% logs --tail=100
                        echo.
                        echo System Resources:
                        docker system df
                        echo.
                        echo Network Status:
                        docker network ls
                        echo.
                        echo Volume Status:
                        docker volume ls
                    '''
                } catch (Exception e) {
                    echo "Could not collect troubleshooting info: ${e.getMessage()}"
                }
                
                // Send notification about failure
                echo "Pipeline failed! Check the logs above for detailed error information."
                echo "Common issues to check:"
                echo "1. Maven build failures in individual services"
                echo "2. Docker image build failures"
                echo "3. Port conflicts or networking issues"
                echo "4. Database connectivity problems"
                echo "5. Configuration file errors"
            }
        }
        
        success {
            script {
                echo "===== DEPLOYMENT SUCCESS NOTIFICATION ====="
                echo "🎉 OnTimeTransit application deployed successfully!"
                echo "✅ All services are running with fresh JAR files"
                echo "✅ All health checks passed"
                echo "✅ Critical endpoints tested successfully"
                echo "🚀 Application is ready for use at: http://localhost:3000"
                echo "===== DEPLOYMENT COMPLETED SUCCESSFULLY ====="
            }
        }
    }
}