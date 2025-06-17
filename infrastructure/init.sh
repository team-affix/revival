cd ./s3
terraform init \
  -backend-config="bucket=$TF_VAR_state_bucket" \
  -backend-config="region=$TF_VAR_state_region" \
  -backend-config="workspace_key_prefix=$TF_VAR_state_workspace_key_prefix" \
  -backend-config="encrypt=$TF_VAR_state_encrypt" \
  -backend-config="key=$TF_VAR_state_s3_key"

cd ../lambda
terraform init \
  -backend-config="bucket=$TF_VAR_state_bucket" \
  -backend-config="region=$TF_VAR_state_region" \
  -backend-config="workspace_key_prefix=$TF_VAR_state_workspace_key_prefix" \
  -backend-config="encrypt=$TF_VAR_state_encrypt" \
  -backend-config="key=$TF_VAR_state_lambda_key"
