import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { debug } from 'debug';

/////////////////////////////////////////////////////////////////////////
////////////////////// DEFINE ERROR TYPES ///////////////////////////////
/////////////////////////////////////////////////////////////////////////

export interface AppError extends Error {
    status: number;
}

export class PackageNotFoundError extends Error implements AppError {
    packageName: string;
    packageVersion: string;
    status: number;
    constructor(packageName: string, packageVersion: string) {
        super(`Package ${packageName} version ${packageVersion} not found`);
        this.name = 'PackageNotFoundError';
        this.packageName = packageName;
        this.packageVersion = packageVersion;
        this.status = 404;
        // Required to make instanceof work correctly in some environments
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

/////////////////////////////////////////////////////////////////////////
////////////////////// DEFINE ERROR HANDLER //////////////////////////////
/////////////////////////////////////////////////////////////////////////

export const errorHandler: ErrorRequestHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
    // Create debugger
    const dbg = debug('apm:server:errorHandler');

    // Print the error
    dbg(`Error message: ${err.message}`);

    // Send the error
    res.status(err.status || 500).json(err);
};
