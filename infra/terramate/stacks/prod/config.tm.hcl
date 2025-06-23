# Prod Environment Configuration
# This file applies to all stacks under the prod/ directory

globals {
  environment = "prod"
  resource_prefix = "${global.project_name}-${global.environment}"
} 