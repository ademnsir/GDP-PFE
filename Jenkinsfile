pipeline {
    agent any
    tools {
        nodejs 'nodejs-18'
    }

    stages {
        stage('GitHub Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Install dependencies') {
            steps {
                bat 'npm install --legacy-peer-deps'
            }
        }
         stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('sq_env') {
                    bat 'sonar-scanner'
                }
            }
        }
    }
    post {
        always {
            echo 'Pipeline terminé.'
        }
        success {
            echo 'Pipeline réussi.'
        }
        failure {
            echo 'Pipeline échoué.'
        }
    }
}
