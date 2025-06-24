import AWS from 'aws-sdk';
import fs from 'fs';
import path from 'path';
import os from 'os';

const { execSync } = require('child_process');

// Get the stack environment from the environment variables
const stackEnv = process.env.STACK_ENV;
console.log("STACK ENV: ", stackEnv);

// Get the lambda function ARN from terraform output
const lambdaFunctionArn = execSync(`cd ../../../../../infra/stacks/${stackEnv}/lambda && terraform output -raw get_puzzle_lambda_invoke_arn`).toString().trim();

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
                "puzzle_id": "test-puzzle-1"
            }
        }
    ];

    test(`aws sdk invocation should succeed for test puzzle`, async () => {
        // Invoke lambda function using AWS SDK with ARN
        const params: AWS.Lambda.InvocationRequest = {
            FunctionName: lambdaFunctionArn,
            Payload: JSON.stringify(tests[0].payload),
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
    });
}); 