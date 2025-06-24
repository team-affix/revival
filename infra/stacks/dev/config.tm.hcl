# Dev Environment Configuration
# This file applies to all stacks under the dev/ directory

globals {
  environment     = "dev"
  resource_prefix = "${global.project_name}-${global.environment}"
} 