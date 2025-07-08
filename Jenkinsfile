pipeline {
    agent any

    tools {
        nodejs 'nodejs-18'
        sonarRunner 'sonar-scanner'  // nom exact du scanner SonarQube configuré dans Jenkins (à vérifier dans Manage Jenkins > Global Tool Configuration)
    }

    environment {
        SONARQUBE_ENV = 'sq_env'  // nom de ta configuration SonarQube dans Jenkins (Manage Jenkins > Configure System > SonarQube servers)
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        /*
        stage('Install and Build Frontend') {
            steps {
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                    dir('gdp-frontend') {
                        bat 'npm install --legacy-peer-deps'
                        bat 'npm run build'
                    }
                }
            }
        }

        stage('Install and Build Backend') {
            steps {
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                    dir('gdp-backend') {
                        bat 'npm install --legacy-peer-deps'
                        bat 'npm run build'
                    }
                }
            }
        }
        */

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
            echo 'Pipeline terminé avec succès!'
        }
        failure {
            echo 'Pipeline échoué.'
        }
    }
}
