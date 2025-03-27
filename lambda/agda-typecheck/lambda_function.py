import sys
import os
import subprocess
import boto3
import shutil

s3Client = boto3.client('s3')

def handler(event, context):
    
    # print(printDir('/opt/agda'))
    # print(subprocess.run(['agda', '--version'], capture_output=True, text=True))
    # test1234 = subprocess.run(['agda', './ex.agda'], capture_output=True, text=True)

    # Get the file path to typecheck in s3 bucket
    s3_folder_path = event["obj_key"]
    print("s3_folder_path   : " + s3_folder_path)

    # Download the folder
    BUCKET_NAME = "revival-logic-platform"
    LOCAL_DL_DIR = "/tmp/dl"

    # Clean the DL directory before DL
    shutil.rmtree(LOCAL_DL_DIR, True)

    # Execute the download from s3
    download_dir(s3_folder_path, LOCAL_DL_DIR, BUCKET_NAME, s3Client)

    # Define location of agda root
    AGDA_MAIN_FILE_PARENT_DIR = os.path.join(LOCAL_DL_DIR, s3_folder_path)
    AGDA_MAIN_FILE_PATH = os.path.join(AGDA_MAIN_FILE_PARENT_DIR, "main.agda")

    # print the download tree
    printDir(LOCAL_DL_DIR)

    # Typecheck the main agda file
    result = subprocess.run(["agda", "-i" + AGDA_MAIN_FILE_PARENT_DIR, AGDA_MAIN_FILE_PATH], capture_output=True, text=True)

    # Print the result of typechecking to logs
    print(str(result))

    # Compute status code
    statusCode = 200 if result.returncode == 0 else 500

    # Respond to sender
    return {
        "statusCode": statusCode,
        "event": str(event),
        "result": str(result)
    }

def download_dir(prefix, local, bucket, client):
    """
    params:
    - prefix: pattern to match in s3
    - local: local path to folder in which to place files
    - bucket: s3 bucket with target contents
    - client: initialized s3 client object
    """
    keys = []
    dirs = []
    next_token = ''
    base_kwargs = {
        'Bucket':bucket,
        'Prefix':prefix,
    }
    while next_token is not None:
        kwargs = base_kwargs.copy()
        if next_token != '':
            kwargs.update({'ContinuationToken': next_token})
        results = client.list_objects_v2(**kwargs)
        contents = results.get('Contents')
        for i in contents:
            k = i.get('Key')
            if k[-1] != '/':
                keys.append(k)
            else:
                dirs.append(k)
        next_token = results.get('NextContinuationToken')
    for d in dirs:
        dest_pathname = os.path.join(local, d)
        if not os.path.exists(os.path.dirname(dest_pathname)):
            os.makedirs(os.path.dirname(dest_pathname))
    for k in keys:
        dest_pathname = os.path.join(local, k)
        if not os.path.exists(os.path.dirname(dest_pathname)):
            os.makedirs(os.path.dirname(dest_pathname))
        client.download_file(bucket, k, dest_pathname)

def printDir(dirPath):
    for root, subdirs, files in os.walk(dirPath):
        print(root + ": " + str(files) + str(subdirs))

def printFile(filePath):
    print(open(filePath, 'r').read())
