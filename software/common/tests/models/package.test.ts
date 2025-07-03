import path from 'path';
import os from 'os';
import fs from 'fs';
import debug from 'debug';
import { expect, describe, it, beforeEach } from '@jest/globals';
import Package from '../../src/models/package';
import PackageNotFoundError from '../../src/errors/package-not-found';
import PackageBase from '../../src/models/package';
import FailedToParseDeps from '../../src/errors/failed-to-parse-deps';
import FailedToParseDepsError from '../../src/errors/failed-to-parse-deps';

describe('models/package', () => {
    describe('PackageBase.parseDeps()', () => {
        describe('success cases', () => {
            it('should parse as an empty map if the string is empty', () => {
                const raw = '';
                const deps = (PackageBase as any).parseDeps(raw);
                expect(deps).toEqual(new Map());
            });

            it('should parse correctly with one dependency', () => {
                const raw = 'dep0 ver0';
                const deps = (PackageBase as any).parseDeps(raw);
                expect(deps).toEqual(new Map([['dep0', 'ver0']]));
            });

            it('should parse correctly with two dependencies', () => {
                const raw = 'dep0 ver0\ndep1 ver1';
                const deps = (PackageBase as any).parseDeps(raw);
                expect(deps).toEqual(
                    new Map([
                        ['dep0', 'ver0'],
                        ['dep1', 'ver1'],
                    ]),
                );
            });

            it('should parse correctly with many dependencies', () => {
                const raw = 'dep0 ver0\ndep1 ver1\ndep2 ver2\ndep3 ver3\ndep4 ver4\ndep5 ver5';
                const deps = (PackageBase as any).parseDeps(raw);
                expect(deps).toEqual(
                    new Map([
                        ['dep0', 'ver0'],
                        ['dep1', 'ver1'],
                        ['dep2', 'ver2'],
                        ['dep3', 'ver3'],
                        ['dep4', 'ver4'],
                        ['dep5', 'ver5'],
                    ]),
                );
            });

            it('should successfully parse if the string contains any redundant newlines', () => {
                const raw = 'dep0 ver0\n\ndep1 ver1';
                const deps = (PackageBase as any).parseDeps(raw);
                expect(deps).toEqual(
                    new Map([
                        ['dep0', 'ver0'],
                        ['dep1', 'ver1'],
                    ]),
                );
            });

            it('should successfully parse if the string contains any redundant newlines', () => {
                const raw = 'dep0 ver0\n\n\ndep1 ver1\n\n\n\ndep2 ver2\n\n\n';
                const deps = (PackageBase as any).parseDeps(raw);
                expect(deps).toEqual(
                    new Map([
                        ['dep0', 'ver0'],
                        ['dep1', 'ver1'],
                        ['dep2', 'ver2'],
                    ]),
                );
            });
        });

        describe('failure cases', () => {
            it('should throw a FailedToParseDepsError if the string contains just a package name', () => {
                const raw = 'dep0';
                expect(() => (PackageBase as any).parseDeps(raw)).toThrow(FailedToParseDepsError);
            });

            it('should throw a FailedToParseDepsError if the string contains any invalid dependencies', () => {
                const raw = 'dep0 ver0\ndep1';
                expect(() => (PackageBase as any).parseDeps(raw)).toThrow(FailedToParseDepsError);
            });

            it('should throw a FailedToParseDepsError if the string contains only duplicate dependencies', () => {
                const raw = 'dep0 ver0\ndep0 ver1';
                expect(() => (PackageBase as any).parseDeps(raw)).toThrow(FailedToParseDepsError);
            });

            it('should throw a FailedToParseDepsError if the string contains any duplicate dependencies', () => {
                const raw = 'dep0 ver0\ndep1 ver1\ndep0 ver2';
                expect(() => (PackageBase as any).parseDeps(raw)).toThrow(FailedToParseDepsError);
            });

            it('should throw a FailedToParseDepsError if the string contains a single line with more than two parts', () => {
                const raw = 'dep0 ver0 etc\n';
                expect(() => (PackageBase as any).parseDeps(raw)).toThrow(FailedToParseDepsError);
            });

            it('should throw a FailedToParseDepsError if the string contains any lines with more than two parts', () => {
                const raw = 'dep0 ver0\ndep1 ver1\ndep2 ver2 etc\ndep3 ver3';
                expect(() => (PackageBase as any).parseDeps(raw)).toThrow(FailedToParseDepsError);
            });

            it('should throw a FailedToParseDepsError if the only line starts with a space', () => {
                const raw = ' dep0 ver0';
                expect(() => (PackageBase as any).parseDeps(raw)).toThrow(FailedToParseDepsError);
            });

            it('should throw a FailedToParseDepsError if any lines start with a space', () => {
                const raw = 'dep0 ver0\n dep1 ver1\ndep2 ver2';
                expect(() => (PackageBase as any).parseDeps(raw)).toThrow(FailedToParseDepsError);
            });
        });
    });

    describe('Package.load()', () => {
        const tmpRegistryPath = path.join(os.tmpdir(), 'tmp-registry');

        const getExampleBinary = (pkgName: string, deps: Map<string, string>, payload: Buffer) => {
            // Serialize the dependencies
            const depsSerialized = (PackageBase as any).serializeDeps(deps);

            // Construct the header
            const header = Buffer.concat([Buffer.from(pkgName), Buffer.from(depsSerialized)]);

            // Construct the footer
            const depsOffset = pkgName.length;
            const payloadOffset = depsOffset + depsSerialized.length;
            const footer = Buffer.alloc(8);
            footer.writeUInt32LE(depsOffset, 4);
            footer.writeUInt32LE(payloadOffset, 0);

            // Create the binary
            const binary = Buffer.concat([header, payload, footer]);

            return binary;
        };

        beforeEach(() => {
            // Remove the temporary registry if it exists
            if (fs.existsSync(tmpRegistryPath)) fs.rmSync(tmpRegistryPath, { recursive: true, force: true });

            // Create the temporary registry
            fs.mkdirSync(tmpRegistryPath, { recursive: true });
        });

        describe('success cases', () => {
            it('Package.load() should return a Package object for simple package', () => {
                // Get the debugger
                const dbg = debug('apm:common:tests:models:package:load');

                // Indicate that we are testing the package from file
                dbg('Testing Package.load()');

                const pkgName = 'name';

                // Construct the package path
                const pkgPath = path.join(tmpRegistryPath, `${pkgName}.tar`);

                // Construct the dependencies
                const deps = new Map([
                    ['dep0', '1.0.0'],
                    ['dep1', '1.0.1'],
                    ['dep2', '1.0.2'],
                ]);

                // Construct the payload (just a uint8)
                const payload = Buffer.from([0xff]);

                // Serialize the dependencies
                const depsSerialized = (PackageBase as any).serializeDeps(deps);

                // Construct the header
                const header = Buffer.concat([Buffer.from(pkgName), Buffer.from(depsSerialized)]);

                // Construct the footer
                const depsOffset = pkgName.length;
                const payloadOffset = depsOffset + depsSerialized.length;
                const footer = Buffer.alloc(8);
                footer.writeUInt32LE(depsOffset, 4);
                footer.writeUInt32LE(payloadOffset, 0);

                // Create the binary
                const binary = Buffer.concat([header, payload, footer]);

                // Print the binary
                dbg(`Binary: ${binary.toString('hex')}`);

                // Get the version of the package
                const version = (Package as any).computeVersion(binary);

                // Print the version
                dbg(`Version: ${version}`);

                // Create the package file
                fs.writeFileSync(pkgPath, binary);

                // Find the package
                const pkg = Package.load(pkgPath);

                expect(pkg).toBeInstanceOf(Package);

                expect(pkg.getName()).toBe(pkgName);
                expect(pkg.getDeps()).toEqual(deps);
                expect(pkg.getVersion()).toBe(version);
                expect(pkg.getPayload()).toEqual(payload);
            });

            it('Package.load() should return a Package object for package with no dependencies', () => {
                // Get the debugger
                const dbg = debug('apm:common:tests:models:package:load');

                // Indicate that we are testing the package from file
                dbg('Testing Package.load()');

                const pkgName = 'name';

                // Construct the package path
                const pkgPath = path.join(tmpRegistryPath, `${pkgName}.tar`);

                // Construct the dependencies
                const deps = new Map();

                // Construct the payload (just a uint8)
                const payload = Buffer.from([0xff]);

                // Serialize the dependencies
                const depsSerialized = (PackageBase as any).serializeDeps(deps);

                // Construct the header
                const header = Buffer.concat([Buffer.from(pkgName), Buffer.from(depsSerialized)]);

                // Construct the footer
                const depsOffset = pkgName.length;
                const payloadOffset = depsOffset + depsSerialized.length;
                const footer = Buffer.alloc(8);
                footer.writeUInt32LE(depsOffset, 4);
                footer.writeUInt32LE(payloadOffset, 0);

                // Create the binary
                const binary = Buffer.concat([header, payload, footer]);

                // Print the binary
                dbg(`Binary: ${binary.toString('hex')}`);

                // Get the version of the package
                const version = (Package as any).computeVersion(binary);

                // Print the version
                dbg(`Version: ${version}`);

                // Create the package file
                fs.writeFileSync(pkgPath, binary);

                // Find the package
                const pkg = Package.load(pkgPath);

                expect(pkg).toBeInstanceOf(Package);

                expect(pkg.getName()).toBe(pkgName);
                expect(pkg.getDeps()).toEqual(deps);
                expect(pkg.getVersion()).toBe(version);
                expect(pkg.getPayload()).toEqual(payload);
            });

            it('Package.load() should return a Package object for package with many dependencies', () => {
                // Get the debugger
                const dbg = debug('apm:common:tests:models:package:load');

                // Indicate that we are testing the package from file
                dbg('Testing Package.load()');

                const pkgName = 'name';

                // Construct the package path
                const pkgPath = path.join(tmpRegistryPath, `${pkgName}.tar`);

                // Construct the dependencies
                const deps = new Map([
                    ['dep0', '1.0.0'],
                    ['dep1', '1.0.1'],
                    ['dep2', '1.0.2'],
                    ['dep3', '1.0.3'],
                    ['dep4', '1.0.4'],
                    ['dep5', '1.0.5'],
                    ['dep6', '1.0.6'],
                    ['dep7', '1.0.7'],
                    ['dep8', '1.0.8'],
                    ['dep9', '1.0.9'],
                    ['dep10', '1.0.10'],
                    ['dep11', '1.0.11'],
                    ['dep12', '1.0.12'],
                    ['dep13', '1.0.13'],
                    ['dep14', '1.0.14'],
                    ['dep15', '1.0.15'],
                    ['dep16', '1.0.16'],
                    ['dep17', '1.0.17'],
                    ['dep18', '1.0.18'],
                    ['dep19', '1.0.19'],
                    ['dep20', '1.0.20'],
                    ['dep21', '1.0.21'],
                    ['dep22', '1.0.22'],
                    ['dep23', '1.0.23'],
                    ['dep24', '1.0.24'],
                    ['dep25', '1.0.25'],
                    ['dep26', '1.0.26'],
                    ['dep27', '1.0.27'],
                    ['dep28', '1.0.28'],
                    ['dep29', '1.0.29'],
                    ['dep30', '1.0.30'],
                    ['dep31', '1.0.31'],
                    ['dep32', '1.0.32'],
                    ['dep33', '1.0.33'],
                    ['dep34', '1.0.34'],
                    ['dep35', '1.0.35'],
                    ['dep36', '1.0.36'],
                    ['dep37', '1.0.37'],
                    ['dep38', '1.0.38'],
                    ['dep39', '1.0.39'],
                    ['dep40', '1.0.40'],
                    ['dep41', '1.0.41'],
                    ['dep42', '1.0.42'],
                    ['dep43', '1.0.43'],
                    ['dep44', '1.0.44'],
                    ['dep45', '1.0.45'],
                    ['dep46', '1.0.46'],
                    ['dep47', '1.0.47'],
                    ['dep48', '1.0.48'],
                    ['dep49', '1.0.49'],
                    ['dep50', '1.0.50'],
                    ['dep51', '1.0.51'],
                    ['dep52', '1.0.52'],
                ]);

                // Construct the payload (just a uint8)
                const payload = Buffer.from([0xff]);

                // Serialize the dependencies
                const depsSerialized = (PackageBase as any).serializeDeps(deps);

                // Construct the header
                const header = Buffer.concat([Buffer.from(pkgName), Buffer.from(depsSerialized)]);

                // Construct the footer
                const depsOffset = pkgName.length;
                const payloadOffset = depsOffset + depsSerialized.length;
                const footer = Buffer.alloc(8);
                footer.writeUInt32LE(depsOffset, 4);
                footer.writeUInt32LE(payloadOffset, 0);

                // Create the binary
                const binary = Buffer.concat([header, payload, footer]);

                // Print the binary
                dbg(`Binary: ${binary.toString('hex')}`);

                // Get the version of the package
                const version = (Package as any).computeVersion(binary);

                // Print the version
                dbg(`Version: ${version}`);

                // Create the package file
                fs.writeFileSync(pkgPath, binary);

                // Find the package
                const pkg = Package.load(pkgPath);

                expect(pkg).toBeInstanceOf(Package);

                expect(pkg.getName()).toBe(pkgName);
                expect(pkg.getDeps()).toEqual(deps);
                expect(pkg.getVersion()).toBe(version);
                expect(pkg.getPayload()).toEqual(payload);
            });
        });

        describe('failure cases', () => {
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
        });
    });

    // it('Package.save() should break if the package was invalid to begin with', () => {
    //     // Get the debugger
    //     const dbg = debug('apm:common:tests:models:package:save');

    //     // Indicate that we are testing the package from file
    //     dbg('Testing Package.save()');

    //     const pkgName = 'name';

    //     // Construct the package path
    //     const pkgPath = path.join(tmpRegistryPath, `${pkgName}.tar`);

    //     // Construct the dependencies
    //     const deps = new Map([
    //         ['dep0', '1.0.0'],
    //         ['dep1', '1.0.1'],
    //         ['dep2', '1.0.2'],
    //     ]);

    //     // Construct the payload (just a uint8)
    //     const payload = Buffer.from([0xff]);

    //     // Create the binary
    //     const binary = getExampleBinary(pkgName, deps, payload);

    //     const binaryInvalid = Buffer.from(binary);

    //     // Print the binary
    //     dbg(`Binary: ${binary.toString('hex')}`);

    //     // Get the version of the package
    //     const version = Package.computeVersion(binary);

    //     // Print the version
    //     dbg(`Version: ${version}`);

    //     // Create the package file
    //     fs.writeFileSync(pkgPath, binary);

    //     // Find the package
    //     const pkg = Package.load(pkgPath);

    //     expect(pkg).toBeInstanceOf(Package);

    //     expect(pkg.getName()).toBe(pkgName);
    //     expect(pkg.getDeps()).toEqual(deps);
    //     expect(pkg.getVersion()).toBe(version);
    //     expect(pkg.getPayload()).toEqual(payload);
    // });
});
