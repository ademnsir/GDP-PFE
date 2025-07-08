pipeline {
    agent any

    environment {
        SONARQUBE_ENV = 'sq_env' // Doit être configuré dans Jenkins
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
