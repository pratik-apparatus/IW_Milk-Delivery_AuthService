pipeline {
    agent any

    environment {
        NODE_ENV = 'production'
        CONTAINER_PORT = '3001'
        IMAGE_NAME = 'milk-delivery-auth'
        NETWORK_NAME = 'milk-delivery-services'
        SERVICE_ALIAS = 'auth.milk-delivery'
    }

    stages {
        stage('Set Port and Container Name') {
            steps {
                script {
                    env.HOST_PORT = '4011'
                    env.CONTAINER_NAME = "milk-delivery-auth-${env.BRANCH_NAME}"
                }
            }
        }

        stage('Load Environment Variables') {
            steps {
                withCredentials([file(credentialsId: 'milk_delivery_auth_env', variable: 'ENV_FILE')]) {
                    sh '''
                        echo "Sanitizing env file for build..."
                        tr -d '\\r' < "$ENV_FILE" | sed 's/"//g' | sed "s/'//g" > .env
                    '''
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                    docker run --rm -v ${WORKSPACE}:/app -w /app node:20-alpine sh -c \
                      "npm ci"
                '''
            }
        }

        stage('Format Check') {
            steps {
                sh '''
                    docker run --rm -v ${WORKSPACE}:/app -w /app node:20-alpine sh -c \
                      "npx prettier --check \\"src/**/*.ts\\""
                '''
            }
        }

        stage('Lint Fix') {
            steps {
                sh '''
                    docker run --rm -v ${WORKSPACE}:/app -w /app node:20-alpine sh -c \
                      "npm run lint"
                '''
            }
        }

        stage('Type Check') {
            steps {
                sh '''
                    docker run --rm -v ${WORKSPACE}:/app -w /app node:20-alpine sh -c \
                      "npx tsc --noEmit"
                '''
            }
        }

        stage('Build') {
            steps {
                withCredentials([file(credentialsId: 'milk_delivery_auth_env', variable: 'ENV_FILE')]) {
                    sh '''
                        echo "Writing .env for build..."
                        tr -d '\\r' < "$ENV_FILE" | sed 's/"//g' | sed "s/'//g" > .env
                        docker run --rm -v ${WORKSPACE}:/app -w /app node:20-alpine sh -c \
                          "npm run build"
                    '''
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                withCredentials([file(credentialsId: 'milk_delivery_auth_env', variable: 'ENV_FILE')]) {
                    sh '''
                        echo "Writing .env for Docker build context..."
                        tr -d '\\r' < "$ENV_FILE" | sed 's/"//g' | sed "s/'//g" > .env
                        docker build -t ${IMAGE_NAME}:"$BRANCH_NAME" -f Dockerfile .
                    '''
                }
            }
        }

        stage('Create Shared Network') {
            steps {
                sh '''
                    docker network create "$NETWORK_NAME" || true
                '''
            }
        }

        stage('Deploy') {
            steps {
                withCredentials([file(credentialsId: 'milk_delivery_auth_env', variable: 'ENV_FILE')]) {
                    sh '''
                        echo "Stopping old container..."
                        docker rm -f "$CONTAINER_NAME" || true

                        echo "Sanitizing env file for Docker..."
                        tr -d '\\r' < "$ENV_FILE" | sed 's/"//g' | sed "s/'//g" > .env.runtime

                        echo "Starting new container..."
                        docker run -d \
                            --name "$CONTAINER_NAME" \
                            --network "$NETWORK_NAME" \
                            --network-alias ${SERVICE_ALIAS} \
                            -p "$HOST_PORT:$CONTAINER_PORT" \
                            -e NODE_ENV="$NODE_ENV" \
                            -e PORT="$CONTAINER_PORT" \
                            -e BACKEND_MS_HOST="backend.milk-delivery" \
                            -e BACKEND_MS_PORT="4012" \
                            -e MAIL_MS_HOST="mail.milk-delivery" \
                            -e MAIL_MS_PORT="4003" \
                            --env-file .env.runtime \
                            --restart always \
                            ${IMAGE_NAME}:"$BRANCH_NAME"
                    '''
                }
            }
        }

        stage('Health Check') {
            steps {
                script {
                    echo "Waiting for service to be healthy..."
                    sleep(time: 15, unit: 'SECONDS')

                    def status = sh(
                        script: "docker ps --filter name=${CONTAINER_NAME} --format '{{.Status}}'",
                        returnStdout: true
                    ).trim()

                    if (!status) {
                        error("Container ${CONTAINER_NAME} failed to start")
                    }

                    def healthCheck = sh(
                        script: "curl -sf http://localhost:${HOST_PORT}/health",
                        returnStatus: true
                    )

                    if (healthCheck != 0) {
                        sh "docker logs ${CONTAINER_NAME}"
                        error("Health check failed for ${CONTAINER_NAME}")
                    }

                    echo "Health check passed"
                }
            }
        }
    }

    post {
        always {
            echo "Pipeline execution completed for branch: ${env.BRANCH_NAME}"
        }
        failure {
            echo "Pipeline failed. Showing container logs..."
            script {
                if (env.CONTAINER_NAME) {
                    sh 'docker logs "$CONTAINER_NAME" || true'
                }
            }
        }
    }
}
