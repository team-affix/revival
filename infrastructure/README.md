# Infrastructure Setup with Terragrunt

This infrastructure has been restructured to use Terragrunt for better organization and environment management.

## Directory Structure

```
infrastructure/
├── terraform/          # Terraform modules
│   ├── s3/             # S3 bucket module
│   ├── lambda/         # Lambda functions module (3 functions)
│   │   ├── main.tf     # Shared IAM role and configuration
│   │   ├── package_pull.tf    # Package Pull Lambda (read-only S3)
│   │   ├── package_push.tf    # Package Push Lambda (read/write S3)
│   │   └── get_puzzle.tf      # Get Puzzle Lambda (no S3 access)
│   └── api-gateway/    # Single API Gateway module with path-based routing
│       ├── main.tf     # Shared API Gateway configuration
│       ├── package_pull.tf    # Package Pull path configuration
│       ├── package_push.tf    # Package Push path configuration
│       └── get_puzzle.tf      # Get Puzzle path configuration
├── terragrunt/         # Terragrunt configurations
│   ├── terragrunt.hcl  # Root configuration
│   ├── dev/            # Development environment
│   │   ├── s3/         # Dev S3 configuration
│   │   ├── lambda/     # Dev Lambda configuration
│   │   └── api-gateway/# Dev API Gateway configuration
│   └── prod/           # Production environment
│       ├── s3/         # Prod S3 configuration
│       ├── lambda/     # Prod Lambda configuration
│       └── api-gateway/# Prod API Gateway configuration
└── README.md           # This documentation
```

## Lambda Functions

The infrastructure creates three Lambda functions with modular file organization:

1. **Package Pull Lambda** (`lpk-{env}-package-pull-lambda`)
   - Purpose: Pull packages from the S3 registry
   - S3 Permissions: Read-only access (`s3:GetObject`, `s3:ListBucket`)
   - Environment Variables: `BUCKET_NAME`
   - Configuration: `lambda/package_pull.tf`

2. **Package Push Lambda** (`lpk-{env}-package-push-lambda`)
   - Purpose: Push packages to the S3 registry
   - S3 Permissions: Read/write access (`s3:GetObject`, `s3:PutObject`, `s3:DeleteObject`, `s3:ListBucket`)
   - Environment Variables: `BUCKET_NAME`
   - Configuration: `lambda/package_push.tf`

3. **Get Puzzle Lambda** (`lpk-{env}-get-puzzle-lambda`)
   - Purpose: Generate or retrieve puzzles
   - S3 Permissions: None (no S3 access needed)
   - Environment Variables: None
   - Configuration: `lambda/get_puzzle.tf`

### Lambda Architecture

- **Shared Resources** (`lambda/main.tf`): IAM execution role, basic execution policy, and placeholder deployment package
- **Modular Functions**: Each Lambda function has its own file with specific S3 policies and configuration
- **Clean Separation**: Easy to modify individual Lambda permissions and settings without affecting others

## Getting Started

### Prerequisites

1. Install [Terragrunt](https://terragrunt.gruntwork.io/docs/getting-started/install/)
2. Install [Terraform](https://www.terraform.io/downloads.html)
3. Configure AWS credentials

### Initialization

Initialize all modules with a single command:

```bash
cd infrastructure/terragrunt
terragrunt run-all init
```

### Working with Terragrunt

#### Environment Management

All environments are managed through separate directories under `terragrunt/`:
- `dev/` - Development environment
- `prod/` - Production environment

#### Common Commands

**Plan all modules:**
```bash
cd infrastructure/terragrunt
terragrunt run-all plan
```

**Apply all modules:**
```bash
cd infrastructure/terragrunt
terragrunt run-all apply
```

**Plan/apply specific environment:**
```bash
# Development
cd infrastructure/terragrunt/dev
terragrunt run-all plan
terragrunt run-all apply

# Production
cd infrastructure/terragrunt/prod
terragrunt run-all plan
terragrunt run-all apply
```

**Plan/apply specific module:**
```bash
# S3 in development
cd infrastructure/terragrunt/dev/s3
terragrunt plan
terragrunt apply

# Lambda in production
cd infrastructure/terragrunt/prod/lambda
terragrunt plan
terragrunt apply
```

**Destroy resources:**
```bash
# Destroy all resources
cd infrastructure/terragrunt
terragrunt run-all destroy

# Destroy specific environment
cd infrastructure/terragrunt/dev
terragrunt run-all destroy

# Destroy specific module
cd infrastructure/terragrunt/dev/s3
terragrunt destroy
```

## Benefits of Terragrunt

1. **DRY (Don't Repeat Yourself)**: Common configuration is shared in the root `terragrunt.hcl`
2. **Environment Isolation**: Each environment has its own state and configuration
3. **Dependency Management**: Lambda automatically depends on S3 bucket outputs
4. **Simplified State Management**: No need to manually configure backend settings
5. **Consistent Provider Configuration**: AWS provider is automatically generated
6. **No Scripts Required**: Everything is managed through Terragrunt configuration files

## Module Dependencies

The infrastructure now has the following dependency chain:
1. **S3** - Storage bucket (no dependencies)
2. **Lambda** - Three Lambda functions depending on S3 bucket outputs
3. **API Gateway** - Single API Gateway with path-based routing depending on Lambda outputs for HTTPS access

Terragrunt automatically handles these dependencies during deployment.

## Configuration

All configuration is managed through Terragrunt HCL files:

- **Root config** (`terragrunt/terragrunt.hcl`): Contains common settings like AWS region, project name, and remote state configuration
- **Environment configs**: Each environment directory contains module-specific configurations
- **No environment variables needed**: Everything is defined in configuration files

## Migration from Legacy Setup

The old Terraform setup has been completely modernized:
- ❌ Removed `env.sh` (environment variables now in `terragrunt.hcl`)
- ❌ Removed `init.sh` (replaced with `terragrunt run-all init`)
- ✅ Converted to reusable modules without code duplication
- ✅ Automatic dependency management
- ✅ Simplified workflow with no bash scripts required 

## HTTPS Access to Lambda Functions

Your Lambda functions are now accessible via HTTPS through a single AWS API Gateway with path-based routing. This is more cost-effective and efficient than having separate API Gateways for each function.

### HTTPS URLs (Development)
- **Base API Gateway**: `https://{api-id}.execute-api.us-west-1.amazonaws.com/dev`
- **Package Pull**: `https://{api-id}.execute-api.us-west-1.amazonaws.com/dev/package-pull`
- **Package Push**: `https://{api-id}.execute-api.us-west-1.amazonaws.com/dev/package-push`
- **Get Puzzle**: `https://{api-id}.execute-api.us-west-1.amazonaws.com/dev/get-puzzle`

### HTTPS URLs (Production)
- **Base API Gateway**: `https://{api-id}.execute-api.us-west-1.amazonaws.com/prod`
- **Package Pull**: `https://{api-id}.execute-api.us-west-1.amazonaws.com/prod/package-pull`
- **Package Push**: `https://{api-id}.execute-api.us-west-1.amazonaws.com/prod/package-push`
- **Get Puzzle**: `https://{api-id}.execute-api.us-west-1.amazonaws.com/prod/get-puzzle`

The actual URLs will be displayed after deployment in the Terragrunt output.

### API Gateway Architecture

The single API Gateway is organized with clean path-based routing:
- `/package-pull` and `/package-pull/*` → Package Pull Lambda
- `/package-push` and `/package-push/*` → Package Push Lambda  
- `/get-puzzle` and `/get-puzzle/*` → Get Puzzle Lambda

Each path supports all HTTP methods (GET, POST, PUT, DELETE, etc.) and includes proxy integration for sub-paths.

## Deployment Order

When deploying for the first time or to a new environment:

1. **S3 bucket** is deployed first
2. **Lambda functions** are deployed next (depends on S3)
3. **API Gateway** is deployed last (depends on Lambda)

This happens automatically when using `terragrunt run-all` commands.

### Quick Start for HTTPS Access

1. Deploy all infrastructure:
```bash
cd infrastructure/terragrunt/dev
terragrunt run-all apply
```

2. Get your HTTPS URLs:
```bash
cd infrastructure/terragrunt/dev/api-gateway
terragrunt output api_gateway_url           # Base URL
terragrunt output package_pull_api_url      # Package Pull endpoint
terragrunt output package_push_api_url      # Package Push endpoint
terragrunt output get_puzzle_api_url        # Get Puzzle endpoint
```

### Testing the Endpoints

You can test each Lambda function using curl:

```bash
# Test Package Pull (read-only S3 access)
curl -X GET "https://{api-id}.execute-api.us-west-1.amazonaws.com/dev/package-pull"

# Test Package Push (read/write S3 access)
curl -X POST "https://{api-id}.execute-api.us-west-1.amazonaws.com/dev/package-push" \
  -H "Content-Type: application/json" \
  -d '{"package": "example"}'

# Test Get Puzzle (no S3 access)
curl -X GET "https://{api-id}.execute-api.us-west-1.amazonaws.com/dev/get-puzzle"
```

## Cost Optimization

The new single API Gateway architecture provides several cost benefits:
- **Reduced API Gateway costs**: One API Gateway instead of three
- **Simplified management**: Single endpoint to monitor and maintain
- **Shared rate limits**: Better resource utilization across all functions
- **Reduced complexity**: Fewer resources to manage and deploy 