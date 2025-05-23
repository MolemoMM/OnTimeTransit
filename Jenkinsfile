pipeline {
    agent any

    stages {
        stage('Update Code') {
            steps {
                bat 'git pull origin main'
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
                bat 'docker-compose down'
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