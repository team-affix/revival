import path from 'path';
import os from 'os';
import fs from 'fs';
import { expect, describe, it, beforeEach, beforeAll } from '@jest/globals';
import { Readable } from 'stream';
import { Registry, __test__ as RegistryTest } from '../../src/models/registry';
import RegistryLoadError from '../../src/errors/registry-load';
import { Source } from '../../src/models/source';
import { Package } from '../../src/models/package';
import PackageLoadError from '../../src/errors/package-load';

describe('models/registry', () => {
    // Helper function to create a package with no source files
    const createPackage = async (filePath: string, name: string, deps: Map<string, string>) => {
        // Create the source path
        const sourceDir = path.join(os.tmpdir(), 'apm-tmp-source');
        // If the source dir exists, remove it
        if (fs.existsSync(sourceDir)) fs.rmSync(sourceDir, { recursive: true, force: true });
        // Create the source dir
        fs.mkdirSync(sourceDir, { recursive: true });
        // Create the source object
        const source: Source = await Source.load(sourceDir);
        // Create the archive
        const archive: Readable = source.getArchive();
        // Create the package
        return await Package.create(filePath, name, deps, archive);
    };

    const packagesPath = path.join(os.tmpdir(), 'apm-tmp-packages');
    let pkgs: Package[];

    // Create the example packages
    beforeAll(async () => {
        // Remove the packages directory if it exists
        if (fs.existsSync(packagesPath)) fs.rmSync(packagesPath, { recursive: true, force: true });
        // Create the packages directory
        fs.mkdirSync(packagesPath, { recursive: true });
        // Create the packages
        pkgs = [
            await createPackage(path.join(packagesPath, 'pkg1.apm'), 'pkg1', new Map([['pkg0', '1.0.0']])),
            await createPackage(path.join(packagesPath, 'pkg2.apm'), 'pkg2', new Map([['pkg1', '1.0.0']])),
            await createPackage(path.join(packagesPath, 'pkg3.apm'), 'pkg3', new Map([['pkg2', '1.0.0']])),
            await createPackage(path.join(packagesPath, 'pkg4.apm'), 'pkg4', new Map([['pkg3', '1.0.0']])),
            await createPackage(path.join(packagesPath, 'pkg5.apm'), 'pkg5', new Map([['pkg4', '1.0.0']])),
        ];
    });

    const loadPackagesIntoRegistry = async (registryPath: string, pkgs: Package[]) =>
        Promise.all(
            pkgs.map(async (pkg) => {
                // get the destination package path
                const dest = RegistryTest.getPackagePath(registryPath, pkg.name, pkg.version);
                // create the package path
                fs.mkdirSync(path.dirname(dest), { recursive: true });
                // copy the package
                fs.copyFileSync(pkg.filePath, dest);
            }),
        );

    const testCaseDir = path.join(os.tmpdir(), 'test-case-tmpdir');

    beforeEach(() => {
        // remove the test case dir if it exists
        if (fs.existsSync(testCaseDir)) fs.rmSync(testCaseDir, { recursive: true, force: true });
        // create the test case dir
        fs.mkdirSync(testCaseDir, { recursive: true });
    });

    describe('Registry.load()', () => {
        const registryPath = path.join(testCaseDir, 'registry');

        beforeEach(() => {
            // If the registry dir exists, remove it
            if (fs.existsSync(registryPath)) fs.rmSync(registryPath, { recursive: true, force: true });
            // create the registry dir
            fs.mkdirSync(registryPath, { recursive: true });
        });

        describe('success cases', () => {
            it('zero packages', async () => {
                // expect no error to be thrown
                await expect(Registry.load(registryPath)).resolves.toBeDefined();
            });

            it('one package', async () => {
                // get an inventory of the packages we want
                const pkg0 = pkgs[0];
                // create a path to the destination file
                const pkgPath = RegistryTest.getPackagePath(registryPath, pkg0.name, pkg0.version);
                // create a file in the registry path
                fs.mkdirSync(path.dirname(pkgPath), { recursive: true });
                fs.copyFileSync(pkg0.filePath, pkgPath);
                // load the registry
                await expect(Registry.load(registryPath)).resolves.toBeDefined();
            });
        });

        describe('failure cases', () => {
            it('should throw RegistryLoadError if the path does not exist', async () => {
                // create a non-existent path
                const nonExistentPath = path.join(testCaseDir, 'non-existent-path');
                // If the path exists, remove it
                if (fs.existsSync(nonExistentPath)) fs.rmSync(nonExistentPath, { recursive: true, force: true });
                // expect rejection, an error to be thrown
                await expect(Registry.load(nonExistentPath)).rejects.toThrow(RegistryLoadError);
            });

            it('should throw RegistryLoadError if the path is not a directory', async () => {
                // create a non-directory path
                const nonDirectoryPath = path.join(testCaseDir, 'non-directory-path');
                // If the path exists, remove it
                if (fs.existsSync(nonDirectoryPath)) fs.rmSync(nonDirectoryPath, { recursive: true, force: true });
                // create a file in the path (not a directory)
                fs.writeFileSync(nonDirectoryPath, 'test');
                // expect rejection, an error to be thrown
                await expect(Registry.load(nonDirectoryPath)).rejects.toThrow(RegistryLoadError);
            });
        });
    });

    describe('Registry.get()', () => {
        const registryPath = path.join(testCaseDir, 'registry');

        beforeEach(() => {
            // If the registry dir exists, remove it
            if (fs.existsSync(registryPath)) fs.rmSync(registryPath, { recursive: true, force: true });
            // create the registry dir
            fs.mkdirSync(registryPath, { recursive: true });
        });

        describe('success cases', () => {
            const genericTest = async (pkgCount: number, getPkgIndex: number) => {
                // get an inventory of the packages we want
                const pkgSlice = pkgs.slice(0, pkgCount);
                // create temp variable for the package we want to get
                const pkg = pkgs[getPkgIndex];
                // load the packages into the registry
                await loadPackagesIntoRegistry(registryPath, pkgSlice);
                // load the registry
                const registry = await Registry.load(registryPath);
                // get the package
                const resultPkg = await registry.get(pkg.name, pkg.version);
                // expect the package to be defined
                expect(resultPkg).toBeDefined();
                // expect the package to be the correct package
                expect(resultPkg?.name).toEqual(pkg.name);
                expect(resultPkg?.version).toEqual(pkg.version);
                expect(resultPkg?.directDeps).toEqual(pkg.directDeps);
                expect(resultPkg?.archiveOffset).toEqual(pkg.archiveOffset);
            };

            it('one package', async () => await genericTest(1, 0));

            it('two packages, get first', async () => await genericTest(2, 0));

            it('two packages, get second', async () => await genericTest(2, 1));

            it('three packages, get first', async () => await genericTest(3, 0));

            it('three packages, get second', async () => await genericTest(3, 1));

            it('three packages, get third', async () => await genericTest(3, 2));

            it('four packages, get first', async () => await genericTest(4, 0));

            it('four packages, get second', async () => await genericTest(4, 1));

            it('four packages, get third', async () => await genericTest(4, 2));
        });

        describe('failure cases', () => {
            it('should throw PackageLoadError if the path does not exist', async () => {
                // load the registry
                const registry = await Registry.load(registryPath);
                // expect rejection, an error to be thrown
                await expect(registry.get(pkgs[0].name, pkgs[0].version)).rejects.toThrow(PackageLoadError);
            });

            it('throws PackageLoadError if the package is not registered (2 packages present)', async () => {
                // load the packages into the registry
                await loadPackagesIntoRegistry(registryPath, pkgs.slice(0, 2));
                // load the registry
                const registry = await Registry.load(registryPath);
                // expect rejection, an error to be thrown
                await expect(registry.get(pkgs[2].name, pkgs[2].version)).rejects.toThrow(PackageLoadError);
            });
        });
    });
});
