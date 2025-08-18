<#
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This PowerShell script automates the entire deployment process for the StorIA-Lite 
 *   application. It handles building the Docker image, pushing it to a specified 
 *   container registry, updating the Kubernetes deployment manifest with the new 
 *   image tag, and applying the manifests to the cluster to roll out the new version.
 * 
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
#>

# Script to automate the Docker image build, push to the registry,
# and deployment of the StorIA-Lite application on Kubernetes.

# --- CONFIGURATION (MODIFY THESE VARIABLES) ---
# This section contains all the variables you need to set for your specific environment.

# The URL of your container registry (e.g., docker.io/yourusername, youracr.azurecr.io, gcr.io/your-project)
$DOCKER_REGISTRY = "your-registry/your-username" # IMPORTANT: Replace with your container registry URL.

# The name of the image
$IMAGE_NAME = "storia-lite-api"

# The tag for the image (can be "latest", a version number like "1.1.0", etc.)
$IMAGE_TAG = "latest"

# The Kubernetes namespace where the resources will be deployed
$K8S_NAMESPACE = "storia-lite"

# Path to the Kubernetes manifest files
$K8S_MANIFEST_PATH = ".\System\Deploy"

# --- END OF CONFIGURATION ---


# --- SCRIPT LOGIC ---
# Do not modify beyond this point unless you know what you are doing.

# Set the error action preference to stop script execution on any error.
$ErrorActionPreference = "Stop"

# Compose the full image name from the configuration variables.
$FULL_IMAGE_NAME = "$DOCKER_REGISTRY/$IMAGE_NAME`:$IMAGE_TAG"

# Helper function to display colored log messages in the console.
function Write-Log {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

# --- STEP 1: Build the Docker Image ---
Write-Log "--- STEP 1: Building the Docker image: $FULL_IMAGE_NAME ---" -Color Yellow
try {
    # Execute the docker build command.
    # -t: Tags the image with the specified name and tag.
    # -f: Specifies the path to the Dockerfile.
    # The final argument is the build context path.
    docker build -t $FULL_IMAGE_NAME -f ".\System\Dockerfile" ".\System"
    Write-Log "Image build completed successfully." -Color Green
}
catch {
    # Handle potential errors during the build process.
    Write-Log "ERROR: Failed to build the Docker image. Check the Dockerfile and the build context." -Color Red
    exit 1
}

# --- STEP 2: Push the Image to the Registry ---
Write-Log "--- STEP 2: Pushing the image to the registry: $FULL_IMAGE_NAME ---" -Color Yellow
try {
    # Push the locally built image to the remote container registry.
    docker push $FULL_IMAGE_NAME
    Write-Log "Image push completed successfully." -Color Green
}
catch {
    # Handle potential errors during the push process.
    Write-Log "ERROR: Failed to push the image. Ensure you are logged in (`docker login`) and the registry name is correct." -Color Red
    exit 1
}

# --- STEP 3: Update the Deployment Manifest ---
Write-Log "--- STEP 3: Updating the deployment file with the new image ---" -Color Yellow
$deploymentFile = Join-Path $K8S_MANIFEST_PATH "deployment.yaml"

# Check if the deployment manifest file exists before proceeding.
if (-not (Test-Path $deploymentFile)) {
    Write-Log "ERROR: Deployment file not found at '$deploymentFile'." -Color Red
    exit 1
}

# Read the content of the deployment.yaml file, replace the image placeholder
# with the newly built and pushed image name, and write the changes back to the file.
# NOTE: This assumes a placeholder like 'your-registry/storia-lite-api:latest' exists in the file.
#       Update the placeholder string if your manifest uses a different one.
(Get-Content $deploymentFile) -replace 'your-registry/storia-lite-api:latest', $FULL_IMAGE_NAME | Set-Content $deploymentFile
Write-Log "File '$deploymentFile' has been updated." -Color Green

# --- STEP 4: Apply Kubernetes Manifests ---
Write-Log "--- STEP 4: Applying Kubernetes manifests ---" -Color Yellow
try {
    # Apply all configuration files (.yaml) located in the specified directory.
    # This will create or update the resources in the Kubernetes cluster.
    kubectl apply -f $K8S_MANIFEST_PATH
    Write-Log "Kubernetes manifests applied successfully." -Color Green
}
catch {
    # Handle potential errors when communicating with the Kubernetes cluster.
    Write-Log "ERROR: Failed to apply Kubernetes manifests. Check your connection to the cluster and the .yaml files." -Color Red
    exit 1
}

# --- STEP 5: Restart the Deployment ---
Write-Log "--- STEP 5: Forcing a deployment restart to pull the new image ---" -Color Yellow
try {
    # Trigger a rolling restart of the deployment. This ensures that the pods
    # will be recreated using the new image version specified in the manifest.
    kubectl rollout restart deployment "storia-lite-api-deployment" -n $K8S_NAMESPACE
    Write-Log "Restart command sent. Monitor the pods with 'kubectl get pods -n $K8S_NAMESPACE -w'." -Color Cyan
}
catch {
    # This step might fail if permissions are insufficient or the deployment name is wrong.
    Write-Log "WARNING: Could not restart the deployment automatically. Kubernetes may perform the rollout on its own." -Color Yellow
}

Write-Log "--- Deployment process finished! ---" -Color Magenta