pipeline {
    agent any

    stages {
        stage('Clean Workspace') {
            steps {
                cleanWs()
                checkout scm
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
        stage('Deploy Services') {
            steps {
                bat 'docker-compose down --remove-orphans'
                bat 'docker container prune -f'
                // Remove all possible conflicting containers by name
                bat 'docker rm -f user-service notification-service analytics-service ticket-service route-service schedule-service frontend pgadmin || exit 0'
                bat 'docker-compose pull'
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
            bat 'docker-compose ps'
        }
    }
}