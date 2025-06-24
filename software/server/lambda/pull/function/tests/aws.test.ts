import AWS from 'aws-sdk';
import fs from 'fs';
import path from 'path';
import os from 'os';

const { execSync } = require('child_process');

// Get the stack environment from the environment variables
const stackEnv = process.env.STACK_ENV;
console.log("STACK ENV: ", stackEnv);

// Get the lambda function ARNfrom terraform output
const lambdaFunctionArn = execSync(`cd ../../../../../infra/stacks/${stackEnv}/lambda && terraform output -raw package_pull_lambda_function_arn`).toString().trim();

// Get the region from terraform output
const region = execSync(`cd ../../../../../infra/stacks/${stackEnv}/lambda && terraform output -raw aws_region`).toString().trim();

console.log("LAMBDA FUNCTION ARN: ", lambdaFunctionArn);
console.log("AWS REGION: ", region);

// Initialize AWS Lambda client with the region from terraform
const lambda = new AWS.Lambda({
    region
});

// Construct the test suite
describe('AWS Lambda Invocation', () => {

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
    
    // Write the binary data directly to a temp file /tmp/apmtestpkg.zip
    const zipFilePath = path.join(os.tmpdir(), 'apmtestpkg.zip');
    const unzipDir = path.join(os.tmpdir(), 'apmtestpkg');

    beforeEach(() => {
        // clean up zip file and unzip directory
        fs.rmSync(zipFilePath, { recursive: true, force: true });
        fs.rmSync(unzipDir, { recursive: true, force: true });
        fs.mkdirSync(unzipDir, { recursive: true });
    });

    describe('AWS SDK Lambda Invocation', () => {
        tests.forEach((testData) => {
            test(`aws sdk invocation should succeed for ${testData.payload.package_name}`, async () => {
                // Invoke lambda function using AWS SDK with ARN
                const params: AWS.Lambda.InvocationRequest = {
                    FunctionName: lambdaFunctionArn, // Using ARN instead of just function name
                    Payload: JSON.stringify(testData.payload),
                    InvocationType: 'RequestResponse' // Synchronous invocation
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
                
                fs.writeFileSync(zipFilePath, binaryData);

                // Assert the file was created
                expect(fs.existsSync(zipFilePath)).toBe(true);

                // Unzip the file with overwrite flag
                const unzipResult = execSync(`cd ${unzipDir} && unzip ${zipFilePath}`);
                console.log("UNZIP RESULT: ", unzipResult.toString());

                // Assert the files were created
                for (const file of testData.expectedFiles) {
                    expect(fs.existsSync(path.join(unzipDir, file))).toBe(true);
                }
                
            });
        });
    });

    // describe('AWS API Gateway Invocation', () => {
    //     tests.forEach((testData) => {
    //         test(`aws api gateway invocation should succeed for ${testData.payload.package_name}`, async () => {
    //             // Invoke lambda function using AWS API Gateway
    //             const params: AWS.Lambda.InvocationRequest = {
    //                 FunctionName: lambdaFunctionArn, // Using ARN instead of just function name
    //                 Payload: JSON.stringify(testData.payload),
    //                 InvocationType: 'RequestResponse' // Synchronous invocation
    //             };

    //             const result = await lambda.invoke(params).promise();
                
    //             // Print the result
    //             console.log("INVOCATION RESULT: ", result);
    //             console.log("RESPONSE PAYLOAD: ", result.Payload?.toString());

    //             // Assert the result
    //             expect(result).toBeDefined();
    //             expect(result.StatusCode).toBe(200);

    //             // Get the payload from the response
    //             const payload = JSON.parse(result.Payload!.toString());
    //             console.log("PAYLOAD: ", payload);

    //             // Assert the payload
    //             expect(payload).toBeDefined();
    //             expect(payload.statusCode).toBe(200);
    //             expect(payload.body).toBeDefined();

    //             // Convert base64 body to binary buffer (don't convert to string!)
    //             const binaryData = Buffer.from(payload.body, 'base64');
                
    //             fs.writeFileSync(zipFilePath, binaryData);

    //             // Assert the file was created
    //             expect(fs.existsSync(zipFilePath)).toBe(true);

    //             // Unzip the file with overwrite flag
    //             const unzipResult = execSync(`cd ${unzipDir} && unzip ${zipFilePath}`);
    //             console.log("UNZIP RESULT: ", unzipResult.toString());

    //             // Assert the files were created
    //             for (const file of testData.expectedFiles) {
    //                 expect(fs.existsSync(path.join(unzipDir, file))).toBe(true);
    //             }
                
    //         });
    //     });
    // });
});
