import sys
import os
import subprocess
import boto3

s3Client = boto3.client('s3')

def handler(event, context):
    # test123 = subprocess.run(['agda', '--version'], capture_output=True, text=True)
    # test1234 = subprocess.run(['agda', './ex.agda'], capture_output=True, text=True)
    # Get the file path to typecheck in s3 bucket
    ld = os.listdir('/opt/agda')
    s3_file_path = event["obj_key"]
    print("agda_file_path   : " + s3_file_path)

    s3_file_name = os.path.basename(s3_file_path)

    # Our bucket name
    BUCKET_NAME = "revival-logic-platform"

    # Get the object
    LOCAL_FILE_NAME = os.path.join("/tmp", s3_file_name)
    s3Client.download_file(BUCKET_NAME, s3_file_path, LOCAL_FILE_NAME)

    # read file
    fcontent = open(LOCAL_FILE_NAME, 'r').read()

    result = subprocess.run(["agda", "-i/tmp", LOCAL_FILE_NAME], capture_output=True, text=True)

    statusCode = 200 if result.returncode == 0 else 500

    return {
        "statusCode": statusCode,
        "event": str(event),
        "fileContent": str(fcontent),
        "result": str(result)
    }
