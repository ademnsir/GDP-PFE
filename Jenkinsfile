pipeline {
    agent any

    tools {
        nodejs 'nodejs-18'
    }

    environment {
        SONARQUBE_ENV = 'sq_env'  // nom de ton SonarQube config dans Jenkins
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install and Build Frontend') {
            steps {
                dir('gdp-frontend') {
                    bat 'npm install --legacy-peer-deps'
                    bat 'npm run build'
                }
            }
        }

        stage('Install and Build Backend') {
            steps {
                dir('gdp-backend') {
                    bat 'npm install --legacy-peer-deps'
                    bat 'npm run build'
                }
            }
        }

        stage('SonarQube Analysis Frontend') {
            steps {
                withSonarQubeEnv("${SONARQUBE_ENV}") {
                    dir('gdp-frontend') {
                        bat '''
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
            echo 'SonarQube analysis completed successfully!'
        }
        failure {
            echo 'SonarQube analysis failed.'
        }
    }
}
