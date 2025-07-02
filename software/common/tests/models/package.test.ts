import path from 'path';
import os from 'os';
import fs from 'fs';
import { expect, describe, it, beforeEach } from '@jest/globals';
import Package from '../../src/models/package';
import PackageNotFoundError from '../../src/errors/package-not-found';

describe('models/package', () => {
    const tmpRegistryPath = path.join(os.tmpdir(), 'tmp-registry');

    beforeEach(() => {
        // Remove the temporary registry if it exists
        if (fs.existsSync(tmpRegistryPath)) fs.rmSync(tmpRegistryPath, { recursive: true, force: true });

        // Create the temporary registry
        fs.mkdirSync(tmpRegistryPath, { recursive: true });
    });

    it('Package.fromFile() should throw PackageNotFoundError if the path does not exist', () => {
        const pkgPath = path.join(tmpRegistryPath, 'does-not-exist.tar');
        expect(() => Package.load(pkgPath)).toThrow(PackageNotFoundError);
    });

    it('Package.fromFile() should throw PackageNotFoundError if the path is a directory', () => {
        const dirPath = path.join(tmpRegistryPath, 'dir');

        // Create the directory
        fs.mkdirSync(dirPath, { recursive: true });

        // Expect the directory to exist
        expect(fs.existsSync(dirPath)).toBe(true);

        // Expect the package to not be found
        expect(() => Package.load(dirPath)).toThrow(PackageNotFoundError);
    });

    it('Package.fromFile() should return a Package object if the package exists', () => {
        const pkgName = 'name';
        const pkgVersion = 'version';

        // Construct the package path
        const pkgPath = path.join(tmpRegistryPath, pkgName, `${pkgVersion}.tar`);

        // Create the package directory
        fs.mkdirSync(path.join(tmpRegistryPath, pkgName), { recursive: true });

        // Create the package file
        fs.writeFileSync(pkgPath, 'test');

        // Find the package
        const pkg = Package.fromFile(pkgName, pkgVersion, pkgPath);
        expect(pkg).toBeInstanceOf(Package);
    });

    it('Package.getBinary() should return the correct data', () => {
        const pkgName = 'name';
        const pkgVersion = 'version';

        const BINARY_DATA = 'binary123';

        // Construct the package path
        const pkgPath = path.join(tmpRegistryPath, pkgName, `${pkgVersion}.tar`);

        // Create the package directory
        fs.mkdirSync(path.join(tmpRegistryPath, pkgName), { recursive: true });

        // Create the package file
        fs.writeFileSync(pkgPath, BINARY_DATA);

        // Find the package
        const pkg = Package.fromFile(pkgName, pkgVersion, pkgPath);
        expect(pkg).toBeInstanceOf(Package);

        // Get the binary data
        const binaryData = pkg.getBinary();
        expect(binaryData?.toString()).toBe(BINARY_DATA);
    });
});
