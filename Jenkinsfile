pipeline {
    agent any

    tools {
        nodejs 'nodejs-18'
        sonar 'sonar-cli'  // nom config SonarQube Scanner dans Jenkins
    }

    environment {
        SONARQUBE_ENV = 'sq_env'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('SonarQube Analysis Frontend') {
            steps {
                withSonarQubeEnv("${SONARQUBE_ENV}") {
                    dir('gdp-frontend') {
                        bat '''
                        where sonar-scanner
                        sonar-scanner ^
                          -Dsonar.projectKey=GDPFrontend ^
                          -Dsonar.projectName=GDP-Frontend ^
                          -Dsonar.sources=. ^
                          -Dsonar.sourceEncoding=UTF-8 ^
                          -Dsonar.exclusions=node_modules/**,out/**,build/**
                        '''
                    }
                }
            }
        }

        stage('SonarQube Analysis Backend') {
            steps {
                withSonarQubeEnv("${SONARQUBE_ENV}") {
                    dir('gdp-backend') {
                        bat '''
                        where sonar-scanner
                        sonar-scanner ^
                          -Dsonar.projectKey=GDPBackend ^
                          -Dsonar.projectName=GDP-Backend ^
                          -Dsonar.sources=src ^
                          -Dsonar.sourceEncoding=UTF-8 ^
                          -Dsonar.exclusions=node_modules/**,dist/**
                        '''
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline terminé avec succès!'
        }
        failure {
            echo 'Pipeline échoué.'
        }
    }
}
