import { Request, Response } from 'express';
import { GetPackageRequest, getPackage } from '../src/controllers/package';
import { PackageNotFoundError } from '../src/middleware/error-handler';

describe('controllers/package', () => {
    describe('getPackage', () => {
        it('should throw a PackageNotFoundError if the package does not exist', () => {
            const req = {} as Request;
            const res = {} as Response;

            // Set the request body
            req.body = {
                name: 'NonExistentPackage',
                version: '1.0.0',
            };

            // Expect the PackageNotFoundError to have been thrown
            expect(() => getPackage(req, res, jest.fn())).toThrow(
                new PackageNotFoundError('NonExistentPackage', '1.0.0'),
            );
        });
    });
});
