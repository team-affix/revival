const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const bucket = process.env.BUCKET_NAME;

exports.handler = async (event) => {
//   const key = 'temp.txt';
    const key = event.package_name + '/' + event.package_version + '.zip';

  try {
    const data = await s3.getObject({ Bucket: bucket, Key: key }).promise();
    const content = data.Body.toString('base64');

    return {
        statusCode: 200,
        isBase64Encoded: true,
        body: content,
        bucket_name: bucket,
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
