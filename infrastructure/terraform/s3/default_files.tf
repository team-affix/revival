############################################################################
###################### DEFAULT FILES CONFIGURATION #########################
############################################################################

# Zip the folder
data "archive_file" "absurdity_0_zip" {
  type        = "zip"
  source_dir  = "./default_files/packages/absurdity/0"  # Folder to zip
  output_path = "./default_files/package_zips/absurdity/0.zip"   # Temp zip file
  # Exclude Terragrunt/Terraform files
  excludes = [
    ".terragrunt-source-manifest"
  ]
}

# Upload the zip file
resource "aws_s3_object" "absurdity_0_zip_object" {
  bucket = aws_s3_bucket.lpk_bucket.id
  key    = "packages/absurdity/0.zip"
  source = data.archive_file.absurdity_0_zip.output_path
  etag   = data.archive_file.absurdity_0_zip.output_md5
  content_type = "application/zip"
}
