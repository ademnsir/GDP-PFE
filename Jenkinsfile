pipeline {
    agent any

    tools {
        nodejs 'nodejs-18'
        sonarScanner 'sonar-scanner'  // ici tu dois avoir nommé l'installation "sonar-scanner" dans Jenkins Global Tool Configuration
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
                        "%SONARSCANNER_HOME%\\bin\\sonar-scanner.bat" ^
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
                        "%SONARSCANNER_HOME%\\bin\\sonar-scanner.bat" ^
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
