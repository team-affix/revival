import AWS from 'aws-sdk';
import axios from 'axios';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';

// Get the stack environment from the environment variables
const stackEnv = process.env.STACK_ENV;
console.log("STACK ENV: ", stackEnv);

// Get the lambda function ARN from terraform output (using function_arn, not invoke_arn)
const lambdaFunctionArn = execSync(`cd ../../../../../infra/stacks/${stackEnv}/lambda && terraform output -raw package_pull_lambda_function_arn`).toString().trim();

// Get the region from terraform output
const region = execSync(`cd ../../../../../infra/stacks/${stackEnv}/lambda && terraform output -raw aws_region`).toString().trim();

// Get the API Gateway URL from terraform output
const apiGatewayUrl = execSync(`cd ../../../../../infra/stacks/${stackEnv}/api-gateway && terraform output -raw package_pull_api_url`).toString().trim();

console.log("LAMBDA FUNCTION ARN: ", lambdaFunctionArn);
console.log("AWS REGION: ", region);
console.log("API GATEWAY URL: ", apiGatewayUrl);

// Initialize AWS Lambda client with the region from terraform
const lambda = new AWS.Lambda({
    region
});

// Test data shared between both test suites
const tests = [
    {
        payload: {
            "package_name": "absurdity",
            "package_version": "0"
        },
        expectedFiles: [
            "main.agda",
        ]
    }
];

// Shared file paths
const zipFilePath = path.join(os.tmpdir(), 'apmtestpkg.zip');
const unzipDir = path.join(os.tmpdir(), 'apmtestpkg');

describe('AWS Lambda Invocation', () => {
    beforeEach(async () => {
        // clean up zip file and unzip directory
        await fs.rm(zipFilePath, { recursive: true, force: true });
        await fs.rm(unzipDir, { recursive: true, force: true });
        await fs.mkdir(unzipDir, { recursive: true });
    });

    describe('AWS SDK Lambda Invocation', () => {
        tests.forEach((testData) => {
            test(`aws sdk invocation should succeed for ${testData.payload.package_name}`, async () => {
                // Invoke lambda function using AWS SDK with ARN
                const params = {
                    FunctionName: lambdaFunctionArn,
                    Payload: JSON.stringify(testData.payload),
                    InvocationType: 'RequestResponse'
                };

                const result = await lambda.invoke(params).promise();
                
                // Print the result
                console.log("INVOCATION RESULT: ", result);
                console.log("RESPONSE PAYLOAD: ", result.Payload?.toString());

                // Assert the result
                expect(result).toBeDefined();
                expect(result.StatusCode).toBe(200);

                // Get the payload from the response
                const payload = JSON.parse(result.Payload!.toString());
                console.log("PAYLOAD: ", payload);

                // Assert the payload
                expect(payload).toBeDefined();
                expect(payload.statusCode).toBe(200);
                expect(payload.body).toBeDefined();

                // Convert base64 body to binary buffer (don't convert to string!)
                const binaryData = Buffer.from(payload.body, 'base64');
                
                await fs.writeFile(zipFilePath, binaryData);

                // Assert the file was created
                const zipExists = await fs.access(zipFilePath).then(() => true).catch(() => false);
                expect(zipExists).toBe(true);

                // Unzip the file with overwrite flag
                const unzipResult = execSync(`cd ${unzipDir} && unzip ${zipFilePath}`);
                console.log("UNZIP RESULT: ", unzipResult.toString());

                // Assert the files were created
                for (const file of testData.expectedFiles) {
                    const fileExists = await fs.access(path.join(unzipDir, file)).then(() => true).catch(() => false);
                    expect(fileExists).toBe(true);
                }
            });
        });
    });

    // describe('AWS API Gateway Invocation', () => {
    //     tests.forEach((testData) => {
    //         test(`aws api gateway invocation should succeed for ${testData.payload.package_name}`, async () => {
    //             // Make a POST request to the API Gateway endpoint
    //             console.log("Making API Gateway request to:", apiGatewayUrl);
    //             console.log("With payload:", testData.payload);

    //             const response = await axios.post(apiGatewayUrl, testData.payload, {
    //                 headers: {
    //                     'Content-Type': 'application/json'
    //                 },
    //                 responseType: 'text'  // Get as text first to handle double base64
    //             });

    //             // Debug response details
    //             console.log("API Gateway Response DATA:", response.data);
    //             // console.log("API Gateway Response Status:", response.status);
    //             // console.log("API Gateway Response Headers:", response.headers);
    //             // console.log("API Gateway Response Type:", typeof response.data);
    //             // console.log("API Gateway Response Length:", response.data?.length || 0);

    //             // Assert the response
    //             expect(response.status).toBe(200);
    //             expect(response.data).toBeDefined();
    //             expect(response.headers['content-type']).toBe('application/octet-stream');
    //             expect(response.headers['content-disposition']).toContain('attachment; filename="absurdity-0.zip"');

    //             // Convert base64 body to binary buffer (don't convert to string!)
    //             const binaryData = Buffer.from(response.data, 'base64');
                
    //             await fs.writeFile(zipFilePath, binaryData);

    //             // Assert the file was created
    //             const zipExists = await fs.access(zipFilePath).then(() => true).catch(() => false);
    //             expect(zipExists).toBe(true);

    //             // Unzip the file with overwrite flag
    //             const unzipResult = execSync(`cd ${unzipDir} && unzip ${zipFilePath}`);
    //             console.log("UNZIP RESULT: ", unzipResult.toString());

    //             // Assert the files were created
    //             for (const file of testData.expectedFiles) {
    //                 const fileExists = await fs.access(path.join(unzipDir, file)).then(() => true).catch(() => false);
    //                 expect(fileExists).toBe(true);
    //             }

    //         });
    //     });
    // });
});
