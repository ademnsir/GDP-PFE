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
            environment {
                // Use the name of the SonarQube Scanner installation as configured in Jenkins
                SCANNER_HOME = tool 'sq_env'
            }
            steps {
                withSonarQubeEnv('sq_env') {
                    // Use the scanner from the configured tool
                    bat "${SCANNER_HOME}\\bin\\sonar-scanner.bat"
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
