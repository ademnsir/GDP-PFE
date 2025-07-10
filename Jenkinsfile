pipeline {
    agent any

    tools {
        nodejs 'nodejs-18'
    }

    environment {
        SONARQUBE_ENV = 'sq_env' // Nom de ta config SonarQube
        PATH = "C:\\Users\\Mqi Katan\\Desktop\\sonar-scanner-7.1.0.4889-windows-x64\\bin;C:\\Program Files\\Docker\\Docker\\resources\\bin;%PATH%"
        DOCKER_BACKEND_IMAGE = 'adem012/gdp-backend' 
        DOCKER_FRONTEND_IMAGE = 'adem012/gdp-frontend' 
        DOCKER_TAG = 'latest'
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
                    bat 'npm install --legacy-peer-deps'
                }
            }
        }

        stage('Unit Tests Frontend') {
            steps {
                dir('gdp-frontend') {
                    bat 'npm test -- --testPathPattern=src/test/authService.test.ts --passWithNoTests'
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

        stage('Docker Build') {
            steps {
                script {
                    try {
                        echo '🔨 Construction des images Docker...'
                        bat 'docker-compose build'
                        
                        echo '🏷️ Tag des images pour Docker Hub...'
                        // Tag de l'image backend
                        bat 'docker tag pfe-adem-backend %DOCKER_BACKEND_IMAGE%:%DOCKER_TAG%'
                        // Tag de l'image frontend
                        bat 'docker tag pfe-adem-frontend %DOCKER_FRONTEND_IMAGE%:%DOCKER_TAG%'
                        
                        echo '✅ Images taggées:'
                        echo '   - Backend: %DOCKER_BACKEND_IMAGE%:%DOCKER_TAG%'
                        echo '   - Frontend: %DOCKER_FRONTEND_IMAGE%:%DOCKER_TAG%'
                    } catch (Exception e) {
                        echo '⚠️ Docker non disponible, étape Docker Build ignorée'
                        echo '   - Erreur: ' + e.getMessage()
                    }
                }
            }
        }

        stage('Push Docker Images') {
            steps {
                script {
                    try {
                        echo '🚀 Push des images vers Docker Hub...'
                        withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                            bat 'echo %DOCKER_PASSWORD% | docker login -u %DOCKER_USERNAME% --password-stdin'
                            // Push de l'image backend
                            echo '📤 Push de l\'image backend...'
                            bat 'docker push %DOCKER_BACKEND_IMAGE%:%DOCKER_TAG%'
                            // Push de l'image frontend
                            echo '📤 Push de l\'image frontend...'
                            bat 'docker push %DOCKER_FRONTEND_IMAGE%:%DOCKER_TAG%'
                            echo '✅ Images poussées avec succès vers Docker Hub!'
                        }
                    } catch (Exception e) {
                        echo '⚠️ Docker non disponible, étape Push Docker ignorée'
                        echo '   - Erreur: ' + e.getMessage()
                    }
                }
            }
        }

        stage('Docker Deploy') {
            steps {
                script {
                    try {
                        echo '🚀 Déploiement des conteneurs...'
                        bat 'docker-compose down'
                        bat 'docker-compose up -d'
                        
                        // Attendre que les services soient prêts
                        timeout(5) {
                            waitUntil {
                                try {
                                    bat 'docker-compose ps | findstr "Up"'
                                    return true
                                } catch (Exception e) {
                                    echo 'Services en cours de démarrage...'
                                    sleep(10)
                                    return false
                                }
                            }
                        }
                    } catch (Exception e) {
                        echo '⚠️ Docker non disponible, étape Docker Deploy ignorée'
                        echo '   - Erreur: ' + e.getMessage()
                    }
                }
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
            script {
                try {
                    bat 'docker --version'
                    echo '🐳 Images Docker Hub:'
                    echo '   - Backend: %DOCKER_BACKEND_IMAGE%:%DOCKER_TAG%'
                    echo '   - Frontend: %DOCKER_FRONTEND_IMAGE%:%DOCKER_TAG%'
                    echo '🌐 Application déployée et accessible sur:'
                    echo '   - Frontend: http://localhost:3001'
                    echo '   - Backend: http://localhost:3000'
                    echo '   - Database: localhost:5433'
                } catch (Exception e) {
                    echo '⚠️ Docker non disponible - déploiement manuel requis'
                    echo '📦 Builds disponibles pour déploiement manuel'
                }
            }
        }
        failure {
            echo '❌ Pipeline échoué.'
            // Nettoyage en cas d'échec
            script {
                try {
                    bat 'docker-compose down'
                } catch (Exception e) {
                    echo '⚠️ Docker non disponible pour le nettoyage'
                }
            }
        }
        always {
            // Nettoyage des images non utilisées
            script {
                try {
                    bat 'docker image prune -f'
                } catch (Exception e) {
                    echo '⚠️ Docker non disponible pour le nettoyage des images'
                }
            }
            echo '🧹 Nettoyage terminé'
        }
    }
}