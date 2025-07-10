import path from 'path';
import os from 'os';
import fs from 'fs';
import debug from 'debug';
import { expect, describe, it, beforeEach, beforeAll } from '@jest/globals';
import { Readable } from 'stream';
import { Registry, __test__ as RegistryTest } from '../../src/models/registry';
import RegistryLoadError from '../../src/errors/registry-load';
import { Source } from '../../src/models/source';
import { Package } from '../../src/models/package';
import PackageLoadError from '../../src/errors/package-load';
import GetTransitiveDepsError from '../../src/errors/get-transitive-deps';

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

    const globalPackagesPath = path.join(os.tmpdir(), 'apm-tmp-packages');
    let globalPkgs: Package[];

    // Create the example packages
    beforeAll(async () => {
        // Remove the packages directory if it exists
        if (fs.existsSync(globalPackagesPath)) fs.rmSync(globalPackagesPath, { recursive: true, force: true });
        // Create the packages directory
        fs.mkdirSync(globalPackagesPath, { recursive: true });
        // Create the packages

        // LEAF NODES
        const pkg000 = await createPackage(path.join(globalPackagesPath, 'pkg000.apm'), 'pkgA', new Map());
        const pkg001 = await createPackage(path.join(globalPackagesPath, 'pkg001.apm'), 'pkgB', new Map());
        const pkg002 = await createPackage(path.join(globalPackagesPath, 'pkg002.apm'), 'pkgC', new Map());

        const pkg010 = await createPackage(path.join(globalPackagesPath, 'pkg010.apm'), 'pkgD', new Map());
        const pkg011 = await createPackage(path.join(globalPackagesPath, 'pkg011.apm'), 'pkgE', new Map());
        const pkg012 = await createPackage(path.join(globalPackagesPath, 'pkg012.apm'), 'pkgF', new Map());

        const pkg020 = await createPackage(path.join(globalPackagesPath, 'pkg020.apm'), 'pkgG', new Map());
        const pkg021 = await createPackage(path.join(globalPackagesPath, 'pkg021.apm'), 'pkgH', new Map());
        const pkg022 = await createPackage(path.join(globalPackagesPath, 'pkg022.apm'), 'pkgI', new Map());

        const pkg100 = await createPackage(path.join(globalPackagesPath, 'pkg100.apm'), 'pkgA', new Map());
        const pkg101 = await createPackage(path.join(globalPackagesPath, 'pkg101.apm'), 'pkgB', new Map());
        const pkg102 = await createPackage(path.join(globalPackagesPath, 'pkg102.apm'), 'pkgC', new Map());

        const pkg110 = await createPackage(path.join(globalPackagesPath, 'pkg110.apm'), 'pkgD', new Map());
        const pkg111 = await createPackage(path.join(globalPackagesPath, 'pkg111.apm'), 'pkgE', new Map());
        const pkg112 = await createPackage(path.join(globalPackagesPath, 'pkg112.apm'), 'pkgF', new Map());

        // const pkg120 = await createPackage(path.join(globalPackagesPath, 'pkg120.apm'), 'pkgG', new Map());
        const pkg121 = await createPackage(path.join(globalPackagesPath, 'pkg121.apm'), 'pkgH', new Map());
        const pkg122 = await createPackage(path.join(globalPackagesPath, 'pkg122.apm'), 'pkgI', new Map());

        // IMTERMEDIATE NODES
        const pkg00 = await createPackage(
            path.join(globalPackagesPath, 'pkg00.apm'),
            'pkgAlpha',
            new Map([
                [pkg000.name, pkg000.version],
                [pkg001.name, pkg001.version],
                [pkg002.name, pkg002.version],
            ]),
        );
        const pkg01 = await createPackage(
            path.join(globalPackagesPath, 'pkg01.apm'),
            'pkgAlpha',
            new Map([
                [pkg010.name, pkg010.version],
                [pkg011.name, pkg011.version],
                [pkg012.name, pkg012.version],
            ]),
        );
        const pkg02 = await createPackage(
            path.join(globalPackagesPath, 'pkg02.apm'),
            'pkgBeta',
            new Map([
                [pkg020.name, pkg020.version],
                [pkg021.name, pkg021.version],
                [pkg022.name, pkg022.version],
            ]),
        );

        const pkg10 = await createPackage(
            path.join(globalPackagesPath, 'pkg10.apm'),
            'pkgAlpha',
            new Map([
                [pkg100.name, pkg100.version],
                [pkg101.name, pkg101.version],
                [pkg102.name, pkg102.version],
            ]),
        );
        const pkg11 = await createPackage(
            path.join(globalPackagesPath, 'pkg11.apm'),
            'pkgAlpha',
            new Map([
                [pkg110.name, pkg110.version],
                [pkg111.name, pkg111.version],
                [pkg112.name, pkg112.version],
            ]),
        );
        const pkg12 = await createPackage(
            path.join(globalPackagesPath, 'pkg12.apm'),
            'pkgBeta',
            new Map([
                [pkg100.name, pkg100.version], // intentionally, this package is pkg100, peer under pkg10
                [pkg121.name, pkg121.version],
                [pkg122.name, pkg122.version],
            ]),
        );

        // ROOT NODES
        const pkg0 = await createPackage(
            path.join(globalPackagesPath, 'pkg0.apm'),
            'pkgRoot0',
            new Map([
                [pkg00.name, pkg00.version],
                [pkg01.name, pkg01.version],
                [pkg02.name, pkg02.version],
            ]),
        );
        const pkg1 = await createPackage(
            path.join(globalPackagesPath, 'pkg1.apm'),
            'pkgRoot1',
            new Map([
                [pkg10.name, pkg10.version],
                [pkg11.name, pkg11.version],
                [pkg12.name, pkg12.version],
            ]),
        );

        // Create the package list
        globalPkgs = [
            pkg000,
            pkg001,
            pkg002,
            pkg010,
            pkg011,
            pkg012,
            pkg020,
            pkg021,
            pkg022,
            pkg100,
            pkg101,
            pkg102,
            pkg110,
            pkg111,
            pkg112,
            pkg121,
            pkg122,
            pkg00,
            pkg01,
            pkg02,
            pkg10,
            pkg11,
            pkg12,
            pkg0,
            pkg1,
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
                const pkg0 = globalPkgs[0];
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
                const pkgSlice = globalPkgs.slice(0, pkgCount);
                // create temp variable for the package we want to get
                const pkg = globalPkgs[getPkgIndex];
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
                await expect(registry.get(globalPkgs[0].name, globalPkgs[0].version)).rejects.toThrow(PackageLoadError);
            });

            it('throws PackageLoadError if the package is not registered (2 packages present)', async () => {
                // load the packages into the registry
                await loadPackagesIntoRegistry(registryPath, globalPkgs.slice(0, 2));
                // load the registry
                const registry = await Registry.load(registryPath);
                // expect rejection, an error to be thrown
                await expect(registry.get(globalPkgs[2].name, globalPkgs[2].version)).rejects.toThrow(PackageLoadError);
            });
        });
    });

    describe('Registry.getTransitiveDeps()', () => {
        const registryPath = path.join(testCaseDir, 'registry');
        const localPackagesPath = path.join(testCaseDir, 'local-packages');

        beforeEach(() => {
            // If the registry dir exists, remove it
            if (fs.existsSync(registryPath)) fs.rmSync(registryPath, { recursive: true, force: true });
            // If the local packages dir exists, remove it
            if (fs.existsSync(localPackagesPath)) fs.rmSync(localPackagesPath, { recursive: true, force: true });
            // create the registry dir
            fs.mkdirSync(registryPath, { recursive: true });
            // create the local packages dir
            fs.mkdirSync(localPackagesPath, { recursive: true });
        });

        describe('success cases', () => {
            it('zero direct deps should produce empty transitive deps', async () => {
                const pkg0 = await createPackage(path.join(localPackagesPath, 'pkg0.apm'), 'pkg0', new Map());
                // load the packages into the registry
                await loadPackagesIntoRegistry(registryPath, [pkg0]);
                // load the registry
                const registry = await Registry.load(registryPath);
                // get the transitive deps
                const overrides = new Set<string>();
                const result = new Map<string, string>();
                await registry.getTransitiveDeps(pkg0.directDeps, overrides, result);
                // expect the transitive deps to be empty
                expect(result).toEqual(new Map());
            });

            it('single direct dep should produce transitive deps of the direct dep', async () => {
                const pkg0 = await createPackage(path.join(localPackagesPath, 'pkg0.apm'), 'pkg0', new Map());
                const pkg1 = await createPackage(
                    path.join(localPackagesPath, 'pkg1.apm'),
                    'pkg1',
                    new Map([[pkg0.name, pkg0.version]]),
                );
                // load the packages into the registry
                await loadPackagesIntoRegistry(registryPath, [pkg0, pkg1]);
                // load the registry
                const registry = await Registry.load(registryPath);
                // get the transitive deps
                const overrides = new Set<string>();
                const result = new Map<string, string>();
                await registry.getTransitiveDeps(pkg1.directDeps, overrides, result);
                // expect the transitive deps to be empty
                expect(result).toEqual(new Map([[pkg0.name, pkg0.version]]));
            });

            it('single direct dep which has been overridden should not be included in the transitive deps', async () => {
                const pkg0 = await createPackage(path.join(localPackagesPath, 'pkg0.apm'), 'pkg0', new Map());
                const pkg1 = await createPackage(
                    path.join(localPackagesPath, 'pkg1.apm'),
                    'pkg1',
                    new Map([[pkg0.name, pkg0.version]]),
                );
                // load the packages into the registry
                await loadPackagesIntoRegistry(registryPath, [pkg0, pkg1]);
                // load the registry
                const registry = await Registry.load(registryPath);
                // get the transitive deps
                const overrides = new Set<string>([pkg0.name]);
                const result = new Map<string, string>();
                await registry.getTransitiveDeps(pkg1.directDeps, overrides, result);
                // expect the transitive deps to be empty
                expect(result).toEqual(new Map());
            });

            it('single direct which has a single indirect dep', async () => {
                const pkg0 = await createPackage(path.join(localPackagesPath, 'pkg0.apm'), 'pkg0', new Map());
                const pkg1 = await createPackage(
                    path.join(localPackagesPath, 'pkg1.apm'),
                    'pkg1',
                    new Map([[pkg0.name, pkg0.version]]),
                );
                const pkg2 = await createPackage(
                    path.join(localPackagesPath, 'pkg2.apm'),
                    'pkg2',
                    new Map([[pkg1.name, pkg1.version]]),
                );
                // load the packages into the registry
                await loadPackagesIntoRegistry(registryPath, [pkg0, pkg1, pkg2]);
                // load the registry
                const registry = await Registry.load(registryPath);
                // get the transitive deps
                const overrides = new Set<string>();
                const result = new Map<string, string>();
                await registry.getTransitiveDeps(pkg2.directDeps, overrides, result);
                // expect the transitive deps to be empty
                expect(result).toEqual(
                    new Map([
                        [pkg0.name, pkg0.version],
                        [pkg1.name, pkg1.version],
                    ]),
                );
            });

            it('single direct which has a two indirect deps', async () => {
                const pkg0 = await createPackage(path.join(localPackagesPath, 'pkg0.apm'), 'pkg0', new Map());
                const pkg1 = await createPackage(path.join(localPackagesPath, 'pkg1.apm'), 'pkg1', new Map());
                const pkg2 = await createPackage(
                    path.join(localPackagesPath, 'pkg2.apm'),
                    'pkg2',
                    new Map([
                        [pkg0.name, pkg0.version],
                        [pkg1.name, pkg1.version],
                    ]),
                );
                const pkg3 = await createPackage(
                    path.join(localPackagesPath, 'pkg3.apm'),
                    'pkg3',
                    new Map([[pkg2.name, pkg2.version]]),
                );
                // load the packages into the registry
                await loadPackagesIntoRegistry(registryPath, [pkg0, pkg1, pkg2, pkg3]);
                // load the registry
                const registry = await Registry.load(registryPath);
                // get the transitive deps
                const overrides = new Set<string>();
                const result = new Map<string, string>();
                await registry.getTransitiveDeps(pkg3.directDeps, overrides, result);
                // expect the transitive deps to be empty
                expect(result).toEqual(
                    new Map([
                        [pkg0.name, pkg0.version],
                        [pkg1.name, pkg1.version],
                        [pkg2.name, pkg2.version],
                    ]),
                );
            });

            it('two direct deps, both have same indirect dep, but it is overridden', async () => {
                // Get the debugger
                const dbg = debug('apm:common:models:Registry:getTransitiveDeps');

                // Indicate the specific test
                dbg('Testing two direct deps, both have same indirect dep');

                const pkg0 = await createPackage(path.join(localPackagesPath, 'pkg0.apm'), 'pkg0', new Map());
                const pkg1 = await createPackage(
                    path.join(localPackagesPath, 'pkg1.apm'),
                    'pkg1',
                    new Map([[pkg0.name, pkg0.version]]),
                );
                const pkg2 = await createPackage(
                    path.join(localPackagesPath, 'pkg2.apm'),
                    'pkg2',
                    new Map([[pkg0.name, pkg0.version]]),
                );
                const pkg3 = await createPackage(
                    path.join(localPackagesPath, 'pkg3.apm'),
                    'pkg3',
                    new Map([
                        [pkg0.name, pkg0.version], // OVERRIDES pkg0 peer dependency of pkg1 and pkg2
                        [pkg1.name, pkg1.version],
                        [pkg2.name, pkg2.version],
                    ]),
                );
                // load the packages into the registry
                await loadPackagesIntoRegistry(registryPath, [pkg0, pkg1, pkg2, pkg3]);
                // load the registry
                const registry = await Registry.load(registryPath);
                // get the transitive deps
                const overrides = new Set<string>();
                const result = new Map<string, string>();
                // get the transitive deps
                await registry.getTransitiveDeps(pkg3.directDeps, overrides, result);
                // expect the transitive deps to be empty
                expect(result).toEqual(
                    new Map([
                        [pkg0.name, pkg0.version],
                        [pkg1.name, pkg1.version],
                        [pkg2.name, pkg2.version],
                    ]),
                );
            });
        });

        describe('failure cases', () => {
            it('one direct dep, one unresolved peer dep', async () => {
                const pkg0 = await createPackage(path.join(localPackagesPath, 'pkg0.apm'), 'pkg0', new Map());
                const pkg1 = await createPackage(
                    path.join(localPackagesPath, 'pkg1.apm'),
                    'pkg1',
                    new Map([[pkg0.name, pkg0.version]]),
                );
                // load the packages into the registry
                await loadPackagesIntoRegistry(registryPath, [pkg0, pkg1]);
                // load the registry
                const registry = await Registry.load(registryPath);
                // get the transitive deps
                const overrides = new Set<string>();
                const result = new Map<string, string>([[pkg0.name, pkg0.version]]);
                // expect rejection, an error to be thrown
                await expect(registry.getTransitiveDeps(pkg1.directDeps, overrides, result)).rejects.toThrow(
                    GetTransitiveDepsError,
                );
            });

            it('two direct deps, both have same indirect dep', async () => {
                // Get the debugger
                const dbg = debug('apm:common:models:Registry:getTransitiveDeps');

                // Indicate the specific test
                dbg('Testing two direct deps, both have same indirect dep');

                const pkg0 = await createPackage(path.join(localPackagesPath, 'pkg0.apm'), 'pkg0', new Map());
                const pkg1 = await createPackage(
                    path.join(localPackagesPath, 'pkg1.apm'),
                    'pkg1',
                    new Map([[pkg0.name, pkg0.version]]),
                );
                const pkg2 = await createPackage(
                    path.join(localPackagesPath, 'pkg2.apm'),
                    'pkg2',
                    new Map([[pkg0.name, pkg0.version]]),
                );
                const pkg3 = await createPackage(
                    path.join(localPackagesPath, 'pkg3.apm'),
                    'pkg3',
                    new Map([
                        [pkg1.name, pkg1.version],
                        [pkg2.name, pkg2.version],
                    ]),
                );
                // load the packages into the registry
                await loadPackagesIntoRegistry(registryPath, [pkg0, pkg1, pkg2, pkg3]);
                // load the registry
                const registry = await Registry.load(registryPath);
                // get the transitive deps
                const overrides = new Set<string>();
                const result = new Map<string, string>();
                // expect rejection, an error to be thrown
                await expect(registry.getTransitiveDeps(pkg3.directDeps, overrides, result)).rejects.toThrow(
                    GetTransitiveDepsError,
                );
            });
        });
    });
});
