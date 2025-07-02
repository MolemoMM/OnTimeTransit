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
        stage('Copy .env to Workspace') {
            steps {
                // Copy .env from your project root to the Jenkins workspace
                bat 'copy C:\\Users\\mamas\\OneDrive\\Documents\\wipro\\OnTimeTransit\\.env .env'
                bat 'dir'
                bat 'type .env'
            }
        }
        stage('Build Java Services') {
            steps {
                bat 'cd backend\\user-service\\user-service && mvnw clean package -DskipTests'
                bat 'cd backend\\notification-service\\notification-service && mvnw clean package -DskipTests'
                bat 'cd backend\\analytics-service\\analytics-service && mvnw clean package -DskipTests'
                bat 'cd backend\\ticket-service\\ticket-service && mvnw clean package -DskipTests'
                bat 'cd backend\\route-service\\route-service && mvnw clean package -DskipTests'
                bat 'cd backend\\schedule-service\\schedule-service && mvnw clean package -DskipTests'
            }
        }
        stage('Deploy Services') {
            steps {
                bat 'docker-compose down --remove-orphans'
                bat 'docker container prune -f'
                bat 'docker image prune -f'
                // Remove all possible conflicting containers by name
                bat 'docker rm -f user-service notification-service analytics-service ticket-service route-service schedule-service frontend pgadmin || exit 0'
                bat 'docker-compose pull'
                // Force rebuild all images without cache
                bat 'docker-compose build --no-cache'
                bat 'docker-compose up -d'
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
            }
        }
    }

    post {
        always {
            script {
                try {
                    bat 'docker-compose ps'
                } catch (Exception e) {
                    echo "Docker compose ps failed: ${e.getMessage()}"
                }
            }
        }
        failure {
            echo 'Pipeline failed! Check logs for details.'
        }
        success {
            echo 'Pipeline completed successfully!'
        }
    }
}