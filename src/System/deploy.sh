#!/bin/bash

#
# Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
# (a division of Vytruve.org)
# 
# Original Author: Pedro Henrique / phkaiser13
# 
# Description:
#   This shell script automates the entire deployment process for the StorIA-Lite 
#   application on a Linux/macOS environment. It handles building the Docker image, 
#   pushing it to a specified container registry, updating the Kubernetes deployment 
#   manifest with the new image tag, and applying the manifests to the cluster to 
#   roll out the new version.
# 
# More information: https://vytruve.org
#
# SPDX-License-Identifier: Apache-2.0
#

# --- SCRIPT CONFIGURATION ---
# 'set -e' causes the script to exit immediately if a command exits with a non-zero status.
# 'set -o pipefail' ensures that a pipeline's return status is the value of the last command to exit with a non-zero status.
set -e
set -o pipefail

# --- USER CONFIGURATION (MODIFY THESE VARIABLES) ---
# This section contains all the variables you need to set for your specific environment.

# The URL of your container registry (e.g., docker.io/yourusername, youracr.azurecr.io, gcr.io/your-project)
DOCKER_REGISTRY="your-registry/your-username" # IMPORTANT: Replace with your container registry URL.

# The name of the image
IMAGE_NAME="storia-lite-api"

# The tag for the image (can be "latest", a version number like "1.1.0", etc.)
IMAGE_TAG="latest"

# The Kubernetes namespace where the resources will be deployed
K8S_NAMESPACE="storia-lite"

# Path to the Kubernetes manifest files
K8S_MANIFEST_PATH="./System/Deploy"

# --- END OF USER CONFIGURATION ---


# --- SCRIPT LOGIC ---
# Do not modify beyond this point unless you know what you are doing.

# Define color codes for console output to improve readability.
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Compose the full image name from the configuration variables.
FULL_IMAGE_NAME="${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"

# --- STEP 1: Build the Docker Image ---
echo -e "${YELLOW}--- STEP 1: Building the Docker image: ${FULL_IMAGE_NAME} ---${NC}"
# Execute the docker build command.
# -t: Tags the image with the specified name and tag.
# -f: Specifies the path to the Dockerfile.
# The final argument is the build context path.
docker build -t "$FULL_IMAGE_NAME" -f "./System/Dockerfile" "./System" || {
  echo -e "${RED}ERROR: Failed to build the Docker image. Check the Dockerfile and the build context.${NC}"
  exit 1
}
echo -e "${GREEN}Image build completed successfully.${NC}"

# --- STEP 2: Push the Image to the Registry ---
echo -e "${YELLOW}--- STEP 2: Pushing the image to the registry: ${FULL_IMAGE_NAME} ---${NC}"
# Push the locally built image to the remote container registry.
docker push "$FULL_IMAGE_NAME" || {
  echo -e "${RED}ERROR: Failed to push the image. Ensure you are logged in ('docker login') and the registry name is correct.${NC}"
  exit 1
}
echo -e "${GREEN}Image push completed successfully.${NC}"

# --- STEP 3: Update the Deployment Manifest ---
echo -e "${YELLOW}--- STEP 3: Updating the deployment file with the new image ---${NC}"
DEPLOYMENT_FILE="${K8S_MANIFEST_PATH}/deployment.yaml"

# Check if the deployment manifest file exists before proceeding.
if [ ! -f "$DEPLOYMENT_FILE" ]; then
    echo -e "${RED}ERROR: Deployment file not found at '${DEPLOYMENT_FILE}'.${NC}"
    exit 1
fi

# Use 'sed' to perform an in-place replacement of the image placeholder.
# A backup of the original file is created with a .bak extension.
# We use '|' as the delimiter for 'sed' to avoid conflicts with the '/' characters in the image name.
# NOTE: This assumes a placeholder like 'your-registry/storia-lite-api:latest' exists in the file.
#       Update the placeholder string if your manifest uses a different one.
sed -i.bak "s|your-registry/storia-lite-api:latest|$FULL_IMAGE_NAME|g" "$DEPLOYMENT_FILE"
echo -e "${GREEN}File '${DEPLOYMENT_FILE}' updated. Backup created at '${DEPLOYMENT_FILE}.bak'.${NC}"

# --- STEP 4: Apply Kubernetes Manifests ---
echo -e "${YELLOW}--- STEP 4: Applying Kubernetes manifests ---${NC}"
# Apply all configuration files (.yaml) located in the specified directory.
# This will create or update the resources in the Kubernetes cluster.
kubectl apply -f "$K8S_MANIFEST_PATH" || {
  echo -e "${RED}ERROR: Failed to apply Kubernetes manifests. Check your connection to the cluster and the .yaml files.${NC}"
  exit 1
}
echo -e "${GREEN}Kubernetes manifests applied successfully.${NC}"

# --- STEP 5: Restart the Deployment ---
echo -e "${YELLOW}--- STEP 5: Forcing a deployment restart to pull the new image ---${NC}"
# Trigger a rolling restart of the deployment. This ensures that the pods
# will be recreated using the new image version specified in the manifest.
kubectl rollout restart deployment "storia-lite-api-deployment" -n "$K8S_NAMESPACE" || {
  # This step might fail, but we treat it as a warning as Kubernetes might roll out the update anyway.
  echo -e "${YELLOW}WARNING: Could not restart the deployment automatically. Kubernetes may perform the rollout on its own.${NC}"
}
echo -e "${CYAN}Restart command sent. Monitor the pods with 'kubectl get pods -n ${K8S_NAMESPACE} -w'.${NC}"

echo -e "${MAGENTA}--- Deployment process finished! ---${NC}"