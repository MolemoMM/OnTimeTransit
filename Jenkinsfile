pipeline {
    agent any

    stages {
        stage('Update Code') {
            steps {
                bat 'git clone --branch main https://github.com/MolemoMM/OnTimeTransit.git .'
            }
        }
        stage('Build Backend JARs') {
            steps {
                dir('backend/user-service/user-service') {
                    bat 'mvn clean package -DskipTests'
                }
                dir('backend/notification-service/notification-service') {
                    bat 'mvn clean package -DskipTests'
                }
                dir('backend/analytics-service/analytics-service') {
                    bat 'mvn clean package -DskipTests'
                }
                dir('backend/ticket-service/ticket-service') {
                    bat 'mvn clean package -DskipTests'
                }
                dir('backend/route-service/route-service') {
                    bat 'mvn clean package -DskipTests'
                }
                dir('backend/schedule-service/schedule-service') {
                    bat 'mvn clean package -DskipTests'
                }
            }
        }
        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    bat 'npm install'
                    bat 'npm run build'
                }
            }
        }
        stage('Build & Deploy Services') {
            steps {
                bat 'docker-compose down --remove-orphans'
                bat 'docker container prune -f'
                // Remove all possible conflicting containers by name
                bat 'docker rm -f user-service notification-service analytics-service ticket-service route-service schedule-service frontend pgadmin || exit 0'
                bat 'docker-compose build'
                bat 'docker-compose up -d'
            }
        }
    }

    post {
        always {
            bat 'docker-compose ps'
        }
    }
}