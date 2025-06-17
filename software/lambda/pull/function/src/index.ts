// const AWS = require('aws-sdk');
import AWS from 'aws-sdk';
// Use direct require for shared package
import { auth } from 'shared';

const s3 = new AWS.S3();
const bucket = process.env.BUCKET_NAME;

type MyEvent = {
    package_name: string;
    package_version: string;
};

export const handler = async (event: MyEvent) => {
    const key = event.package_name + '/' + event.package_version + '.zip';
    
  try {
    if (!bucket) {
      throw new Error('BUCKET_NAME environment variable is not defined');
    }
    
    const data = await s3.getObject({ Bucket: bucket, Key: key }).promise();
    const content = data.Body?.toString('base64') || '';

    return {
        statusCode: 200,
        isBase64Encoded: true,
        body: content,
        bucket_name: bucket,
        auth
    };
  } catch (err: unknown) {
    console.error(err);
    const message = err instanceof Error ? err.message : String(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: message }),
    };
  }
};
