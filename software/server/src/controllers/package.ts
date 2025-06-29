import config from '../config';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { Package } from '../models/package';
import { PackageNotFoundError } from '../middleware/error-handler';
import fs from 'fs';
import path from 'path';
import { debug } from 'debug';

export interface GetPackageRequest {
    name: string;
    version: string;
}

export interface GetPackageSuccessResponse {
    name: string;
    version: string;
    b64: string;
}

export type GetPackageErrorResponse = PackageNotFoundError;

export const getPackage: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    // Create debugger
    const dbg = debug('apm:server:getPackage');

    // Parse the request
    const parsedRequest: GetPackageRequest = {
        name: req.params.name,
        version: req.params.version,
    };

    // Print the parsed request
    dbg(`Parsed request: ${JSON.stringify(parsedRequest)}`);

    // Construct the package path
    const pkgPath = path.join(config.registryPath, parsedRequest.name, parsedRequest.version + '.tar');

    // Print the package path
    dbg(`Package path: ${pkgPath}`);

    // Check if the package exists
    if (!fs.existsSync(pkgPath)) {
        throw new PackageNotFoundError(parsedRequest.name, parsedRequest.version);
    }

    // Read in the package binary (NOT UTF-8, should be a buffer)
    const pkgBinary = fs.readFileSync(pkgPath);

    // Convert the binary to a base64 string
    const b64 = pkgBinary.toString('base64');

    // Print the base64 string
    dbg(`Package b64: ${b64}`);

    // Construct the response
    const response: GetPackageSuccessResponse = {
        name: parsedRequest.name,
        version: parsedRequest.version,
        b64,
    };

    // Print the response
    dbg(`Response: ${JSON.stringify(response)}`);

    // Send the response
    res.json(response);
};
