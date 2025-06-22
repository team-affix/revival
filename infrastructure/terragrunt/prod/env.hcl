locals {
  # Environment-specific variables
  environment = "prod"
  
  # Import root locals
  root = read_terragrunt_config(find_in_parent_folders("root.hcl"))
  project_name = local.root.locals.project_name

  # Resource prefix for this environment
  resource_prefix = "${local.project_name}-${local.environment}"
}

# Common inputs for all modules in this environment
inputs = {
  environment = local.environment
  resource_prefix = local.resource_prefix
}
