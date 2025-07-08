pipeline {
    agent any

    tools {
        nodejs 'nodejs-18' 
       
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
                    bat 'npm sonar:sonar'
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
