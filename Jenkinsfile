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

        stage('Install Dependencies Backend') {
            steps {
                dir('gdp-backend') {
                    bat 'npm install'
                }
            }
        }

        stage('Unit Tests Frontend') {
            steps {
                dir('gdp-frontend') {
                    bat 'npm test -- --testPathPattern=authService.test.ts --passWithNoTests'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('gdp-frontend') {
                    bat 'npm run build'
                }
            }
        }

        stage('Build Backend') {
            steps {
                dir('gdp-backend') {
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
                          -Dsonar.exclusions=node_modules/**,out/**,build/**,.next/**
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

        stage('Archive Build Artifacts') {
            steps {
                echo '📦 Archivage des artefacts de build...'
                
                // Archiver le build frontend
                dir('gdp-frontend') {
                    archiveArtifacts artifacts: '.next/**/*', fingerprint: true
                }
                
                // Archiver le build backend
                dir('gdp-backend') {
                    archiveArtifacts artifacts: 'dist/**/*', fingerprint: true
                }
                
                echo '✅ Artefacts archivés avec succès!'
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline terminé avec succès!'
            echo '📊 Analyses SonarQube disponibles sur:'
            echo '   - Frontend: http://192.168.100.18:5050/dashboard?id=GDPFrontend'
            echo '   - Backend: http://192.168.100.18:5050/dashboard?id=GDPBackend'
            echo '📦 Artefacts de build disponibles dans Jenkins'
        }
        failure {
            echo '❌ Pipeline échoué.'
        }
        always {
            echo '🧹 Nettoyage terminé'
        }
    }
}
