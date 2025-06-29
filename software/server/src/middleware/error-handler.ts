import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { debug } from 'debug';

/////////////////////////////////////////////////////////////////////////
////////////////////// DEFINE ERROR TYPES ///////////////////////////////
/////////////////////////////////////////////////////////////////////////

export class PackageNotFoundError extends Error {
    name: string;
    version: string;
    status: number;
    constructor(name: string, version: string) {
        super(`Package ${name} version ${version} not found`);
        this.name = name;
        this.version = version;
        this.status = 404;
        // Required to make instanceof work correctly in some environments
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

/////////////////////////////////////////////////////////////////////////
////////////////////// DEFINE ERROR HANDLER //////////////////////////////
/////////////////////////////////////////////////////////////////////////

export type AppError = PackageNotFoundError;

export const errorHandler: ErrorRequestHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
    // Create debugger
    const dbg = debug('apm:server:errorHandler');

    // Print the error
    dbg(`Error: ${err}`);

    // Send the error
    res.status(err.status || 500).json(err);
};
