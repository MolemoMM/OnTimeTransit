pipeline {
    agent any

    environment {
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    bat 'set CI= && npm install'
                    bat 'set CI= && npm run build'
                }
            }
        }
        stage('Build & Deploy Services') {
            steps {
                bat 'docker-compose -f %WORKSPACE%\\docker-compose.yml down'
                bat 'docker-compose -f %WORKSPACE%\\docker-compose.yml build'
                bat 'docker-compose -f %WORKSPACE%\\docker-compose.yml up -d'
            }
        }
    }

    post {
        always {
            bat 'docker-compose -f %WORKSPACE%\\docker-compose.yml ps'
        }
    }
}