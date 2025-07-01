import Package from '../../src/models/package';
import path from 'path';
import os from 'os';
import fs from 'fs';

describe('models/package', () => {
    const tmpRegistryPath = path.join(os.tmpdir(), 'tmp-registry');

    beforeEach(() => {
        // Remove the temporary registry if it exists
        if (fs.existsSync(tmpRegistryPath)) fs.rmSync(tmpRegistryPath, { recursive: true, force: true });

        // Create the temporary registry
        fs.mkdirSync(tmpRegistryPath, { recursive: true });
    });

    it('Package.find() should return null if the package does not exist', () => {
        const pkgName = 'name';
        const pkgVersion = 'version';
        const pkg = Package.find(tmpRegistryPath, pkgName, pkgVersion);
        expect(pkg).toBeNull();
    });

    it('Package.find() should return a Package object if the package exists', () => {
        const pkgName = 'name';
        const pkgVersion = 'version';

        // Construct the package path
        const pkgPath = path.join(tmpRegistryPath, pkgName, `${pkgVersion}.tar`);

        // Create the package directory
        fs.mkdirSync(path.join(tmpRegistryPath, pkgName), { recursive: true });

        // Create the package file
        fs.writeFileSync(pkgPath, 'test');

        // Find the package
        const pkg = Package.find(tmpRegistryPath, pkgName, pkgVersion);
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
        const pkg = Package.find(tmpRegistryPath, pkgName, pkgVersion);
        expect(pkg).toBeInstanceOf(Package);

        // Get the binary data
        const binaryData = pkg?.getBinary();
        expect(binaryData?.toString()).toBe(BINARY_DATA);
    });
});
