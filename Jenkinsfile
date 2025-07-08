pipeline {
    agent any

    tools {
        nodejs 'nodejs-18'
    }

    environment {
        SONARQUBE_ENV = 'sq_env' // Nom de ta config SonarQube
        PATH = "C:\\Users\\Mqi Katan\\Desktop\\sonar-scanner-7.1.0.4889-windows-x64\\bin;%PATH%"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies Frontend') {
            steps {
                dir('gdp-frontend') {
                    bat 'npm install --legacy-peer-deps'
                }
            }
        }

        stage('Unit Tests Frontend') {
            steps {
                dir('gdp-frontend') {
                    bat 'npm test -- --testPathPattern=authService.test.ts --passWithNoTests'
                }
            }
            post {
                always {
                    dir('gdp-frontend') {
                        publishHTML([
                            allowMissing: false,
                            alwaysLinkToLastBuild: true,
                            keepAll: true,
                            reportDir: 'coverage/lcov-report',
                            reportFiles: 'index.html',
                            reportName: 'Frontend Test Coverage'
                        ])
                    }
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
            echo '✅ Pipeline terminé avec succès!'
        }
        failure {
            echo '❌ Pipeline échoué.'
        }
    }
}
