const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.handler = async (event) => {
  const bucket = 'lpk-revival'; // or process.env.BUCKET_NAME if using env vars
  const key = 'temp.txt';

  try {
    const data = await s3.getObject({ Bucket: bucket, Key: key }).promise();
    const content = data.Body.toString('utf-8');

    return {
      statusCode: 200,
      body: JSON.stringify({ content }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
