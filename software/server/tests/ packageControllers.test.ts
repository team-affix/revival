import { Request, Response } from 'express';
import { GetPackageRequest, getPackage } from '../src/controllers/package';
import { PackageNotFoundError } from '../src/middleware/error-handler';

describe('controllers/package', () => {
    describe('getPackage', () => {
        it('should throw a PackageNotFoundError if the package does not exist', () => {
            // Define the package name and version
            const PACKAGE_NAME = 'NonExistentPackage';
            const PACKAGE_VERSION = '1.0.0';

            // Create a mock request and response
            const req = {} as Request;
            const res = {} as Response;

            // Set the request body
            req.body = {
                name: PACKAGE_NAME,
                version: PACKAGE_VERSION,
            };

            // Expect the PackageNotFoundError to have been thrown
            expect(() => getPackage(req, res, jest.fn())).toThrow(
                new PackageNotFoundError(PACKAGE_NAME, PACKAGE_VERSION),
            );
        });
    });
});
