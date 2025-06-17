# Infrastructure Setup with Terragrunt

This infrastructure has been restructured to use Terragrunt for better organization and environment management.

## Directory Structure

```
infrastructure/
├── terraform/          # Terraform modules
│   ├── s3/             # S3 bucket module
│   ├── lambda/         # Lambda function module
│   └── api-gateway/    # API Gateway module for HTTPS access
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
2. **Lambda** - Depends on S3 bucket outputs
3. **API Gateway** - Depends on Lambda outputs for HTTPS access

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

Your Lambda functions are now accessible via HTTPS through AWS API Gateway:

### HTTPS URLs
- **Dev Environment**: `https://{api-id}.execute-api.us-west-1.amazonaws.com/dev`
- **Prod Environment**: `https://{api-id}.execute-api.us-west-1.amazonaws.com/prod`

The actual URLs will be displayed after deployment in the Terragrunt output.

## Deployment Order

When deploying for the first time or to a new environment:

1. **S3 bucket** is deployed first
2. **Lambda function** is deployed next (depends on S3)
3. **API Gateway** is deployed last (depends on Lambda)

This happens automatically when using `terragrunt run-all` commands.

### Quick Start for HTTPS Access

1. Deploy all infrastructure:
```bash
cd infrastructure/terragrunt/dev
terragrunt run-all apply
```

2. Get your HTTPS URL:
```bash
cd infrastructure/terragrunt/dev/api-gateway
terragrunt output api_gateway_url
```

3. Test your Lambda via HTTPS:
```bash
curl https://your-api-gateway-url.execute-api.us-west-1.amazonaws.com/dev
``` 