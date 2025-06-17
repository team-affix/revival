# Infrastructure Setup with Terragrunt

This infrastructure has been restructured to use Terragrunt for better organization and environment management.

## Directory Structure

```
infrastructure/
├── terraform/          # Terraform modules
│   ├── s3/             # S3 bucket module
│   └── lambda/         # Lambda function module
├── terragrunt/         # Terragrunt configurations
│   ├── terragrunt.hcl  # Root configuration
│   ├── dev/            # Development environment
│   │   ├── s3/         # Dev S3 configuration
│   │   └── lambda/     # Dev Lambda configuration
│   └── prod/           # Production environment
│       ├── s3/         # Prod S3 configuration
│       └── lambda/     # Prod Lambda configuration
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

The Lambda module depends on the S3 module:
- Lambda requires the S3 bucket name and ARN
- Terragrunt automatically handles this dependency
- S3 must be deployed before Lambda in each environment

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