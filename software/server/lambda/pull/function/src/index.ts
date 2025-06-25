import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({});
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
};

// Type guards
function isAPIGatewayEvent(event: any): event is APIGatewayEvent {
    return 'body' in event;
}

function isRequestData(event: any): event is RequestData {
    return 'package_name' in event && 'package_version' in event;
}

export const handler = async (event: APIGatewayEvent | RequestData) => {
    console.log('Full event:', JSON.stringify(event, null, 2));
    return {
        statusCode: 200,
        // headers: {
        //     'Content-Type': 'application/octet-stream',
        //     'Content-Disposition': `attachment; filename="${requestData.package_name}-${requestData.package_version}.zip"`,
        //     'X-Bucket-Name': bucket
        // },
        isBase64Encoded: true,
        body: "test"
    };

//     let requestData: RequestData;
    
//     if (isAPIGatewayEvent(event)) {
//         // API Gateway invocation - TypeScript now knows event is APIGatewayEvent
//         if (!event.body) throw new Error('Missing request body');
//         requestData = JSON.parse(event.body);
//     } else if (isRequestData(event)) {
//         // Direct CLI invocation - TypeScript now knows event is RequestData
//         requestData = event;
//     } else {
//         throw new Error('Invalid event format. Expected either API Gateway event with body or direct invocation with package_name and package_version');
//     }

//     const key = 'packages/' + requestData.package_name + '/' + requestData.package_version + '.zip';
    
//     console.log("BUCKET: ", bucket);
//     console.log("KEY: ", key);

//   try {
//     if (!bucket) {
//       throw new Error('BUCKET_NAME environment variable is not defined');
//     }
    
//     const data = await s3Client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
//     const content = data.Body?.toString('base64') || '';

//     return {
//         statusCode: 200,
//         headers: {
//             'Content-Type': 'application/octet-stream',
//             'Content-Disposition': `attachment; filename="${requestData.package_name}-${requestData.package_version}.zip"`,
//             'X-Bucket-Name': bucket
//         },
//         isBase64Encoded: true,
//         body: content
//     };
//   } catch (err: unknown) {
//     console.error(err);
//     const message = err instanceof Error ? err.message : String(err);
//     return {
//       statusCode: 500,
//       body: JSON.stringify({ error: message }),
//     };
//   }
};
