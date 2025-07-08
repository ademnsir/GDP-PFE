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
                SCANNER_HOME = tool name: 'SonarQubeScanner', type: 'hudson.plugins.sonar.SonarRunnerInstallation'
            }
            steps {
                withSonarQubeEnv('sq_env') {
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
