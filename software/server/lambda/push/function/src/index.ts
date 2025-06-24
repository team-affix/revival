import AWS from 'aws-sdk';
import { auth } from 'shared';

const s3 = new AWS.S3();
const bucket = process.env.BUCKET_NAME;

type APIGatewayEvent = {
    body?: string;
    queryStringParameters?: { [key: string]: string };
    pathParameters?: { [key: string]: string };
    headers?: { [key: string]: string };
};

type RequestData = {
    package_name: string;
    package_version: string;
    content: string;  // base64 encoded package content
};

// Type guards
function isAPIGatewayEvent(event: any): event is APIGatewayEvent {
    return 'body' in event;
}

function isRequestData(event: any): event is RequestData {
    return 'package_name' in event && 'package_version' in event && 'content' in event;
}

export const handler = async (event: APIGatewayEvent | RequestData) => {
    console.log('Full event:', JSON.stringify(event, null, 2));

    // Temporary response for testing
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "Push Lambda function called successfully (temporary response)"
        })
    };
}; 