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
        withSonarQubeEnv("${SONARQUBE_ENV}") {
            bat '''
                sonar-scanner.bat ^
                  -Dsonar.projectKey=pfe-gdp ^
                  -Dsonar.projectName=PFE-GDP ^
                  -Dsonar.projectVersion=1.0 ^
                  -Dsonar.sources=. ^
                  -Dsonar.sourceEncoding=UTF-8 ^
                  -Dsonar.exclusions=node_modules/**,build/**,dist/**
            '''
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
