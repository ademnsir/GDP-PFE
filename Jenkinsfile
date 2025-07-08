pipeline {
    agent any

    tools {
        nodejs 'nodejs-18' 
        sonarQubeScanner 'sonar-cli' 
    }

    environment {
        SONARQUBE_ENV = 'sq_env'
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
                withSonarQubeEnv("${SONARQUBE_ENV}") {
                     bat 'sonar-scanner.bat'
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
