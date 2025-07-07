pipeline {
    agent any
    
    triggers {
        // Poll SCM every 2 minutes for changes
        pollSCM('H/2 * * * *')
        // Alternative: Use GitHub webhook (requires GitHub plugin and webhook setup)
        // githubPush()
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
                        docker stop ontimetransit-user-service ontimetransit-notification-service ontimetransit-analytics-service ontimetransit-ticket-service ontimetransit-route-service ontimetransit-schedule-service frontend pgadmin ontimetransit-postgres-db 2>nul || echo "Some containers were not running"
                        docker rm -f ontimetransit-user-service ontimetransit-notification-service ontimetransit-analytics-service ontimetransit-ticket-service ontimetransit-route-service ontimetransit-schedule-service frontend pgadmin ontimetransit-postgres-db 2>nul || echo "Some containers were not found"
                    '''
                    
                    // Also try old names for compatibility
                    bat '''
                        docker stop user-service notification-service analytics-service ticket-service route-service schedule-service frontend pgadmin postgres-db 2>nul || echo "Old container names not found"
                        docker rm -f user-service notification-service analytics-service ticket-service route-service schedule-service frontend pgadmin postgres-db 2>nul || echo "Old container names not found"
                    '''
                    
                    // Stop using project name
                    bat 'docker-compose -p ontimetransit down --remove-orphans --volumes || echo "Docker compose down failed, continuing..."'
                    
                    // Clean up any remaining containers with project prefix
                    bat '''
                        for /f "tokens=*" %%i in ('docker ps -aq --filter "name=ontimetransit"') do docker stop %%i 2>nul || echo "Container already stopped"
                        for /f "tokens=*" %%i in ('docker ps -aq --filter "name=ontimetransit"') do docker rm -f %%i 2>nul || echo "Container already removed"
                    '''
                    
                    // Remove images with project prefix
                    bat '''
                        for /f "tokens=*" %%i in ('docker images -q --filter "reference=ontimetransit*"') do docker rmi -f %%i 2>nul || echo "Image already removed"
                    '''
                    
                    // System cleanup
                    bat 'docker container prune -f || echo "Container prune completed"'
                    bat 'docker image prune -f || echo "Image prune completed"'
                    bat 'docker network prune -f || echo "Network prune completed"'
                    bat 'docker volume prune -f || echo "Volume prune completed"'
                }
            }
        }

        stage('Verify Cleanup') {
            steps {
                bat 'docker ps -a'
                bat 'docker images'
                bat 'docker volume ls'
                bat 'docker network ls'
            }
        }

        stage('Build Java Services') {
            steps {
                script {
                    try {
                        bat 'cd backend\\user-service\\user-service && mvnw clean package -DskipTests'
                        bat 'cd backend\\notification-service\\notification-service && mvnw clean package -DskipTests'
                        bat 'cd backend\\analytics-service\\analytics-service && mvnw clean package -DskipTests'
                        bat 'cd backend\\ticket-service\\ticket-service && mvnw clean package -DskipTests'
                        bat 'cd backend\\route-service\\route-service && mvnw clean package -DskipTests'
                        bat 'cd backend\\schedule-service\\schedule-service && mvnw clean package -DskipTests'
                    } catch (Exception e) {
                        echo "Build failed: ${e.getMessage()}"
                        // Try with maven if mvnw fails
                        bat 'cd backend\\user-service\\user-service && mvn clean package -DskipTests'
                        bat 'cd backend\\notification-service\\notification-service && mvn clean package -DskipTests'
                        bat 'cd backend\\analytics-service\\analytics-service && mvn clean package -DskipTests'
                        bat 'cd backend\\ticket-service\\ticket-service && mvn clean package -DskipTests'
                        bat 'cd backend\\route-service\\route-service && mvn clean package -DskipTests'
                        bat 'cd backend\\schedule-service\\schedule-service && mvn clean package -DskipTests'
                    }
                }
            }
        }

        stage('Deploy Services') {
            steps {
                script {
                    // Build and deploy with consistent project name
                    bat 'docker-compose -p ontimetransit build --no-cache'
                    bat 'docker-compose -p ontimetransit up -d'
                    
                    // Wait for services to start
                    bat 'timeout /t 30 /nobreak'
                    
                    // Verify deployment
                    bat 'docker-compose -p ontimetransit ps'
                }
            }
        }

        stage('Health Check') {
            steps {
                script {
                    // Wait for services to be ready
                    bat 'timeout /t 60 /nobreak'
                    
                    // Check if services are responding
                    bat '''
                        curl -f http://localhost:8089/actuator/health || echo "User service not ready"
                        curl -f http://localhost:8084/actuator/health || echo "Route service not ready"
                        curl -f http://localhost:8085/actuator/health || echo "Schedule service not ready"
                        curl -f http://localhost:8087/actuator/health || echo "Ticket service not ready"
                        curl -f http://localhost:8083/actuator/health || echo "Notification service not ready"
                        curl -f http://localhost:8086/actuator/health || echo "Analytics service not ready"
                    '''
                }
            }
        }

        stage('Debug All Service Workspaces') {
            steps {
                bat 'dir backend\\user-service\\user-service'
                bat 'dir backend\\notification-service\\notification-service'
                bat 'dir backend\\analytics-service\\analytics-service'
                bat 'dir backend\\ticket-service\\ticket-service'
                bat 'dir backend\\route-service\\route-service'
                bat 'dir backend\\schedule-service\\schedule-service'
            }
        }

        stage('Docker Info') {
            steps {
                bat 'docker info'
                bat 'docker-compose -p ontimetransit ps'
                bat 'docker ps -a'
            }
        }
    }

    post {
        always {
            script {
                try {
                    bat 'docker-compose -p ontimetransit ps'
                    bat 'docker ps -a'
                    bat 'docker images'
                } catch (Exception e) {
                    echo "Docker status check failed: ${e.getMessage()}"
                }
            }
        }
        failure {
            echo 'Pipeline failed! Check logs for details.'
            script {
                try {
                    bat 'docker-compose -p ontimetransit logs --tail=50'
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