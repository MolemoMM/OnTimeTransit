pipeline {
    agent any
    
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
                bat 'copy "C:\\Users\\mamas\\OneDrive\\Documents\\wipro\\OnTimeTransit\\.env" .'
                bat 'dir .env'
                bat 'type .env'
            }
        }

        stage('Cleanup Previous Deployment') {
            steps {
                script {
                    // Stop containers with correct names (ontimetransit- prefix)
                    bat '''
                        @echo off
                        echo Stopping containers with ontimetransit prefix...
                        docker stop ontimetransit-user-service ontimetransit-notification-service ontimetransit-analytics-service ontimetransit-ticket-service ontimetransit-route-service ontimetransit-schedule-service frontend pgadmin ontimetransit-postgres-db >nul 2>&1
                        if %errorlevel% neq 0 echo Some containers were not running
                        
                        echo Removing containers with ontimetransit prefix...
                        docker rm -f ontimetransit-user-service ontimetransit-notification-service ontimetransit-analytics-service ontimetransit-ticket-service ontimetransit-route-service ontimetransit-schedule-service frontend pgadmin ontimetransit-postgres-db >nul 2>&1
                        if %errorlevel% neq 0 echo Some containers were not found
                        
                        exit /b 0
                    '''
                    
                    // Also try old names for compatibility
                    bat '''
                        @echo off
                        echo Stopping containers with old names...
                        docker stop user-service notification-service analytics-service ticket-service route-service schedule-service frontend pgadmin postgres-db >nul 2>&1
                        if %errorlevel% neq 0 echo Old container names not found
                        
                        echo Removing containers with old names...
                        docker rm -f user-service notification-service analytics-service ticket-service route-service schedule-service frontend pgadmin postgres-db >nul 2>&1
                        if %errorlevel% neq 0 echo Old container names not found
                        
                        exit /b 0
                    '''
                    
                    // Stop using project name
                    bat '''
                        @echo off
                        echo Running docker-compose down...
                        docker-compose -p ontimetransit down --remove-orphans --volumes >nul 2>&1
                        if %errorlevel% neq 0 echo Docker compose down completed with warnings
                        exit /b 0
                    '''
                    
                    // Clean up any remaining containers with project prefix
                    bat '''
                        @echo off
                        echo Cleaning up remaining containers...
                        for /f "tokens=*" %%i in ('docker ps -aq --filter "name=ontimetransit" 2^>nul') do (
                            docker stop %%i >nul 2>&1
                            docker rm -f %%i >nul 2>&1
                        )
                        exit /b 0
                    '''
                    
                    // Remove images with project prefix
                    bat '''
                        @echo off
                        echo Removing images with ontimetransit prefix...
                        for /f "tokens=*" %%i in ('docker images -q --filter "reference=ontimetransit*" 2^>nul') do (
                            docker rmi -f %%i >nul 2>&1
                        )
                        exit /b 0
                    '''
                    
                    // System cleanup
                    bat '''
                        @echo off
                        echo System cleanup...
                        docker container prune -f >nul 2>&1
                        docker image prune -f >nul 2>&1
                        docker network prune -f >nul 2>&1
                        docker volume prune -f >nul 2>&1
                        echo Cleanup completed
                        exit /b 0
                    '''
                }
            }
        }

        stage('Verify Cleanup') {
            steps {
                bat '''
                    @echo off
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
                '''
            }
        }

        stage('Fix Configuration Files') {
            steps {
                script {
                    def services = [
                        'user-service',
                        'notification-service', 
                        'analytics-service',
                        'ticket-service',
                        'route-service',
                        'schedule-service'
                    ]
                    
                    for (service in services) {
                        echo "Checking configuration files for ${service}..."
                        bat """
                            @echo off
                            cd /d "%WORKSPACE%\\backend\\${service}\\${service}\\src\\main\\resources"
                            
                            if exist applications.properties (
                                echo Fixing filename: applications.properties -> application.properties for ${service}
                                ren applications.properties application.properties
                            ) else (
                                echo Configuration file OK for ${service}
                            )
                        """
                    }
                }
            }
        }

        stage('Build Java Services') {
            steps {
                script {
                    def services = [
                        'user-service',
                        'notification-service', 
                        'analytics-service',
                        'ticket-service',
                        'route-service',
                        'schedule-service'
                    ]
                    
                    for (service in services) {
                        echo "Building ${service}..."
                        bat """
                            @echo off
                            echo ===== Building ${service} =====
                            cd /d "%WORKSPACE%\\backend\\${service}\\${service}"
                            echo Current directory: %CD%
                            
                            if exist mvnw.cmd (
                                echo Using Maven Wrapper...
                                call mvnw.cmd clean package -DskipTests
                            ) else (
                                echo Maven Wrapper not found, using Maven...
                                call mvn clean package -DskipTests
                            )
                            
                            if %errorlevel% neq 0 (
                                echo ERROR: Build failed for ${service}
                                exit /b 1
                            )
                            
                            if exist target\\${service}-0.0.1-SNAPSHOT.jar (
                                echo SUCCESS: ${service} JAR created successfully
                            ) else (
                                echo ERROR: ${service} JAR not found after build!
                                exit /b 1
                            )
                        """
                    }
                    echo "All services built successfully"
                }
            }
        }

        stage('Deploy Services') {
            steps {
                script {
                    bat '''
                        @echo off
                        echo Building Docker images...
                        docker-compose -p ontimetransit build --no-cache
                        
                        echo Starting services...
                        docker-compose -p ontimetransit up -d
                        
                        echo Waiting for services to start...
                        timeout /t 30 /nobreak
                        
                        echo Verifying deployment...
                        docker-compose -p ontimetransit ps
                    '''
                }
            }
        }

        stage('Debug All Service Workspaces') {
            steps {
                bat '''
                    @echo off
                    echo Checking service directories...
                    dir backend\\user-service\\user-service
                    dir backend\\notification-service\\notification-service
                    dir backend\\analytics-service\\analytics-service
                    dir backend\\ticket-service\\ticket-service
                    dir backend\\route-service\\route-service
                    dir backend\\schedule-service\\schedule-service
                '''
            }
        }

        stage('Docker Info') {
            steps {
                bat '''
                    @echo off
                    echo Docker system information:
                    docker info
                    echo.
                    echo Project containers:
                    docker-compose -p ontimetransit ps
                    echo.
                    echo All containers:
                    docker ps -a
                '''
            }
        }
    }

    post {
        always {
            script {
                try {
                    bat '''
                        @echo off
                        echo Final status check:
                        docker-compose -p ontimetransit ps
                        echo.
                        docker ps -a
                        echo.
                        docker images
                    '''
                } catch (Exception e) {
                    echo "Docker status check failed: ${e.getMessage()}"
                }
            }
        }
        failure {
            echo 'Pipeline failed! Check logs for details.'
            script {
                try {
                    bat '''
                        @echo off
                        echo Getting container logs...
                        docker-compose -p ontimetransit logs --tail=50
                    '''
                } catch (Exception e) {
                    echo "Could not get docker logs: ${e.getMessage()}"
                }
            }
        }
        success {
            echo 'Pipeline completed successfully!'
        }
    }
}