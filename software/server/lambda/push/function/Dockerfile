# Define custom function directory
ARG FUNCTION_DIR="/function"

# Build stage
FROM node:20-buster AS build-image

RUN apt-get update && apt-get install -y cmake

# Include global args in this stage of the build
ARG FUNCTION_DIR

# Copy function code
RUN mkdir -p ${FUNCTION_DIR}
COPY package*.json tsconfig.json ${FUNCTION_DIR}/
COPY src/ ${FUNCTION_DIR}/src/
COPY common-1.0.0.tgz ${FUNCTION_DIR}/common-1.0.0.tgz

WORKDIR ${FUNCTION_DIR}


# Install all dependencies (including dev dependencies for TypeScript and aws-lambda-ric)
RUN npm install

# Build TypeScript code
RUN npm run build

# Clean and install all production dependencies (including aws-lambda-ric)
RUN npm ci --only=production

# Install cmake and aws-lambda-ric
# RUN npm install aws-lambda-ric

# Final slim image with LaTeX
FROM node:20-buster-slim

# Required for Node runtimes which use npm@8.6.0+ because
# by default npm writes logs under /home/.npm and Lambda fs is read-only
ENV NPM_CONFIG_CACHE=/tmp/.npm
ENV DEBIAN_FRONTEND=noninteractive

# Include global arg in this stage of the build
ARG FUNCTION_DIR

# Set working directory to function root directory
WORKDIR ${FUNCTION_DIR}

# Copy the updated package.json from build stage (this includes our CommonJS changes)
COPY --from=build-image ${FUNCTION_DIR}/package*.json ${FUNCTION_DIR}/

# Copy the built JavaScript files from build stage
COPY --from=build-image ${FUNCTION_DIR}/dist ${FUNCTION_DIR}/dist

# Copy the node_modules from build stage
COPY --from=build-image ${FUNCTION_DIR}/node_modules/ ${FUNCTION_DIR}/node_modules/

RUN echo "test" > ${FUNCTION_DIR}/test.txt

# Set runtime interface client as default command for the container runtime
ENTRYPOINT ["/usr/local/bin/npx", "aws-lambda-ric"]

# Pass the name of the function handler as an argument to the runtime
CMD ["dist/index.handler"]
