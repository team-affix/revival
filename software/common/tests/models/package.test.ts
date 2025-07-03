import path from 'path';
import os from 'os';
import fs from 'fs';
import debug from 'debug';
import { expect, describe, it, beforeEach } from '@jest/globals';
import { Package, Draft, PackageBase } from '../../src/models/package';
import PackageNotFoundError from '../../src/errors/package-not-found';
import FailedToParseDepsError from '../../src/errors/failed-to-parse-deps';
import FailedToDeserializeDepsError from '../../src/errors/failed-to-deserialize-deps';

describe('models/package', () => {
    describe('Draft.parseDeps()', () => {
        describe('success cases', () => {
            it('should parse as an empty map if the string is empty', () => {
                const raw = '';
                const deps = (Draft as any).parseDeps(raw);
                expect(deps).toEqual(new Map());
            });

            it('should parse correctly with one dependency', () => {
                const raw = 'dep0 ver0';
                const deps = (Draft as any).parseDeps(raw);
                expect(deps).toEqual(new Map([['dep0', 'ver0']]));
            });

            it('should parse correctly with two dependencies', () => {
                const raw = 'dep0 ver0\ndep1 ver1';
                const deps = (Draft as any).parseDeps(raw);
                expect(deps).toEqual(
                    new Map([
                        ['dep0', 'ver0'],
                        ['dep1', 'ver1'],
                    ]),
                );
            });

            it('should parse correctly with many dependencies', () => {
                const raw = 'dep0 ver0\ndep1 ver1\ndep2 ver2\ndep3 ver3\ndep4 ver4\ndep5 ver5';
                const deps = (Draft as any).parseDeps(raw);
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
                const deps = (Draft as any).parseDeps(raw);
                expect(deps).toEqual(
                    new Map([
                        ['dep0', 'ver0'],
                        ['dep1', 'ver1'],
                    ]),
                );
            });

            it('should successfully parse if the string contains any redundant newlines', () => {
                const raw = 'dep0 ver0\n\n\ndep1 ver1\n\n\n\ndep2 ver2\n\n\n';
                const deps = (Draft as any).parseDeps(raw);
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
                expect(() => (Draft as any).parseDeps(raw)).toThrow(FailedToParseDepsError);
            });

            it('should throw a FailedToParseDepsError if the string contains any invalid dependencies', () => {
                const raw = 'dep0 ver0\ndep1';
                expect(() => (Draft as any).parseDeps(raw)).toThrow(FailedToParseDepsError);
            });

            it('should throw a FailedToParseDepsError if the string contains only duplicate dependencies', () => {
                const raw = 'dep0 ver0\ndep0 ver1';
                expect(() => (Draft as any).parseDeps(raw)).toThrow(FailedToParseDepsError);
            });

            it('should throw a FailedToParseDepsError if the string contains any duplicate dependencies', () => {
                const raw = 'dep0 ver0\ndep1 ver1\ndep0 ver2';
                expect(() => (Draft as any).parseDeps(raw)).toThrow(FailedToParseDepsError);
            });

            it('should throw a FailedToParseDepsError if the string contains a single line with more than two parts', () => {
                const raw = 'dep0 ver0 etc\n';
                expect(() => (Draft as any).parseDeps(raw)).toThrow(FailedToParseDepsError);
            });

            it('should throw a FailedToParseDepsError if the string contains any lines with more than two parts', () => {
                const raw = 'dep0 ver0\ndep1 ver1\ndep2 ver2 etc\ndep3 ver3';
                expect(() => (Draft as any).parseDeps(raw)).toThrow(FailedToParseDepsError);
            });

            it('should throw a FailedToParseDepsError if the only line starts with a space', () => {
                const raw = ' dep0 ver0';
                expect(() => (Draft as any).parseDeps(raw)).toThrow(FailedToParseDepsError);
            });

            it('should throw a FailedToParseDepsError if any lines start with a space', () => {
                const raw = 'dep0 ver0\n dep1 ver1\ndep2 ver2';
                expect(() => (Draft as any).parseDeps(raw)).toThrow(FailedToParseDepsError);
            });
        });
    });

    describe('Package.serializeDeps()', () => {
        it('should serialize with zero entries', () => {
            const deps = new Map();
            const serialized = (Package as any).serializeDeps(deps);
            expect(serialized).toBe('{}');
        });

        it('should serialize with one entry', () => {
            const deps = new Map([['dep0', 'ver0']]);
            const serialized = (Package as any).serializeDeps(deps);
            expect(serialized).toBe('{"dep0":"ver0"}');
        });

        it('should serialize correctly with 2 entries', () => {
            const deps = new Map([
                ['dep0', 'ver0'],
                ['dep1', 'ver1'],
            ]);
            const serialized = (Package as any).serializeDeps(deps);
            expect(serialized).toBe('{"dep0":"ver0","dep1":"ver1"}');
        });

        it('should serialize correctly with many entries', () => {
            const deps = new Map([
                ['dep0', 'ver0'],
                ['dep1', 'ver1'],
                ['dep2', 'ver2'],
                ['dep3', 'ver3'],
                ['dep4', 'ver4'],
                ['dep5', 'ver5'],
                ['dep6', 'ver6'],
                ['dep7', 'ver7'],
                ['dep8', 'ver8'],
                ['dep9', 'ver9'],
                ['dep10', 'ver10'],
                ['dep11', 'ver11'],
                ['dep12', 'ver12'],
                ['dep13', 'ver13'],
                ['dep14', 'ver14'],
                ['dep15', 'ver15'],
            ]);

            const serialized = (Package as any).serializeDeps(deps);
            expect(serialized).toBe(
                '{"dep0":"ver0","dep1":"ver1","dep2":"ver2","dep3":"ver3","dep4":"ver4","dep5":"ver5","dep6":"ver6","dep7":"ver7","dep8":"ver8","dep9":"ver9","dep10":"ver10","dep11":"ver11","dep12":"ver12","dep13":"ver13","dep14":"ver14","dep15":"ver15"}',
            );
        });
    });

    describe('Package.deserializeDeps()', () => {
        describe('success cases', () => {
            it('should deserialize correctly with zero entries', () => {
                const serialized = '{}';
                const deps = (Package as any).deserializeDeps(serialized);
                expect(deps).toEqual(new Map());
            });

            it('should deserialize correctly with one entry', () => {
                const serialized = '{"dep0":"ver0"}';
                const deps = (Package as any).deserializeDeps(serialized);
                expect(deps).toEqual(new Map([['dep0', 'ver0']]));
            });

            it('should deserialize correctly with many entries', () => {
                const serialized =
                    '{"dep0":"ver0","dep1":"ver1","dep2":"ver2","dep3":"ver3","dep4":"ver4","dep5":"ver5","dep6":"ver6","dep7":"ver7","dep8":"ver8","dep9":"ver9","dep10":"ver10","dep11":"ver11","dep12":"ver12","dep13":"ver13","dep14":"ver14","dep15":"ver15"}';
                const deps = (Package as any).deserializeDeps(serialized);
                expect(deps).toEqual(
                    new Map([
                        ['dep0', 'ver0'],
                        ['dep1', 'ver1'],
                        ['dep2', 'ver2'],
                        ['dep3', 'ver3'],
                        ['dep4', 'ver4'],
                        ['dep5', 'ver5'],
                        ['dep6', 'ver6'],
                        ['dep7', 'ver7'],
                        ['dep8', 'ver8'],
                        ['dep9', 'ver9'],
                        ['dep10', 'ver10'],
                        ['dep11', 'ver11'],
                        ['dep12', 'ver12'],
                        ['dep13', 'ver13'],
                        ['dep14', 'ver14'],
                        ['dep15', 'ver15'],
                    ]),
                );
            });
        });

        describe('failure cases', () => {
            it('should throw a FailedToDeserializeDepsError if the string is empty', () => {
                const serialized = '';
                expect(() => (Package as any).deserializeDeps(serialized)).toThrow(FailedToDeserializeDepsError);
            });

            it('should throw a FailedToDeserializeDepsError if the string is not valid JSON', () => {
                const serialized = 'invalid';
                expect(() => (Package as any).deserializeDeps(serialized)).toThrow(FailedToDeserializeDepsError);
            });

            it('should throw a FailedToDeserializeDepsError if the string is not valid JSON (missing a closing brace)', () => {
                const serialized = '{"dep0":"ver0"';
                expect(() => (Package as any).deserializeDeps(serialized)).toThrow(FailedToDeserializeDepsError);
            });

            it('should throw a FailedToDeserializeDepsError if the string is not valid JSON (missing an opening brace)', () => {
                const serialized = '"dep0":"ver0"}';
                expect(() => (Package as any).deserializeDeps(serialized)).toThrow(FailedToDeserializeDepsError);
            });

            it('should throw a FailedToDeserializeDepsError if the string is not valid JSON (missing a colon)', () => {
                const serialized = '{"dep0" "ver0"}';
                expect(() => (Package as any).deserializeDeps(serialized)).toThrow(FailedToDeserializeDepsError);
            });
        });
    });

    describe('Package.computeBinary()', () => {
        const produceDesiredBinary = (name: string, deps: Map<string, string>, payload: Buffer) => {
            // Computed values
            const depsOffset = name.length;
            const depsSerialized = (Package as any).serializeDeps(deps);
            const payloadOffset = depsOffset + depsSerialized.length;
            const footer = Buffer.alloc(8);
            footer.writeUInt32LE(depsOffset, 4);
            footer.writeUint32LE(payloadOffset, 0);
            const header = Buffer.concat([Buffer.from(name), Buffer.from(depsSerialized)]);

            // Desired value
            return Buffer.concat([header, payload, footer]);
        };

        describe('success cases', () => {
            it('should compute the binary correctly for zero dependencies', () => {
                const name = 'PKG';
                const deps = new Map();
                const payload = Buffer.from([0xff]);

                // Compute the binary
                const binary = (Package as any).computeBinary(name, deps, payload);

                // Check the result
                expect(binary).toEqual(produceDesiredBinary(name, deps, payload));
            });

            it('should compute the binary correctly for one dependency', () => {
                const name = 'PKG';
                const deps = new Map([['dep0', 'ver0']]);
                const payload = Buffer.from([0xff]);

                // Compute the binary
                const binary = (Package as any).computeBinary(name, deps, payload);

                // Check the result
                expect(binary).toEqual(produceDesiredBinary(name, deps, payload));
            });

            it('should compute the binary correctly for empty name and zero dependenciess', () => {
                const name = '';
                const deps = new Map();
                const payload = Buffer.from([0xff]);

                // Compute the binary
                const binary = (Package as any).computeBinary(name, deps, payload);

                // Check the result
                expect(binary).toEqual(produceDesiredBinary(name, deps, payload));
            });

            it('should compute the binary correctly for empty name, zero dependencies, and large payload', () => {
                const name = '';
                const deps = new Map();
                const payload = Buffer.alloc(1000);
                payload.fill(0xff);

                // Compute the binary
                const binary = (Package as any).computeBinary(name, deps, payload);

                // Check the result
                expect(binary).toEqual(produceDesiredBinary(name, deps, payload));
            });

            it('should compute the binary correctly for empty name, one dependency, and large payload', () => {
                const name = '';
                const deps = new Map([['dep0', 'ver0']]);
                const payload = Buffer.alloc(1000);
                payload.fill(0xff);

                // Compute the binary
                const binary = (Package as any).computeBinary(name, deps, payload);

                // Check the result
                expect(binary).toEqual(produceDesiredBinary(name, deps, payload));
            });

            it('should compute the binary correctly for long name, one dependency, and large payload', () => {
                const name = 'PKG_WITH_A_LONG_NAME_THAT_EXCEEDS_ALL_EXPECTATIONS_AND_THAT_IS_REALLY_LONG';
                const deps = new Map([['dep0', 'ver0']]);
                const payload = Buffer.alloc(1000);
                payload.fill(0xff);

                // Compute the binary
                const binary = (Package as any).computeBinary(name, deps, payload);

                // Check the result
                expect(binary).toEqual(produceDesiredBinary(name, deps, payload));
            });

            it('should compute the binary correctly for long name, many dependencies, and large payload', () => {
                const name = 'PKG_WITH_A_LONG_NAME_THAT_EXCEEDS_ALL_EXPECTATIONS_AND_THAT_IS_REALLY_LONG';
                const deps = new Map([
                    ['dep0', 'ver0'],
                    ['dep1', 'ver1'],
                    ['dep2', 'ver2'],
                    ['dep3', 'ver3'],
                    ['dep4', 'ver4'],
                    ['dep5', 'ver5'],
                    ['dep6', 'ver6'],
                    ['dep7', 'ver7'],
                    ['dep8', 'ver8'],
                    ['dep9', 'ver9'],
                    ['dep10', 'ver10'],
                    ['dep11', 'ver11'],
                    ['dep12', 'ver12'],
                    ['dep13', 'ver13'],
                    ['dep14', 'ver14'],
                    ['dep15', 'ver15'],
                    ['dep16', 'ver16'],
                    ['dep17', 'ver17'],
                    ['dep18', 'ver18'],
                    ['dep19', 'ver19'],
                    ['dep20', 'ver20'],
                    ['dep21', 'ver21'],
                    ['dep22', 'ver22'],
                    ['dep23', 'ver23'],
                    ['dep24', 'ver24'],
                    ['dep25', 'ver25'],
                    ['dep26', 'ver26'],
                    ['dep27', 'ver27'],
                    ['dep28', 'ver28'],
                    ['dep29', 'ver29'],
                    ['dep30', 'ver30'],
                    ['dep31', 'ver31'],
                    ['dep32', 'ver32'],
                    ['dep33', 'ver33'],
                    ['dep34', 'ver34'],
                ]);
                const payload = Buffer.alloc(1000);
                payload.fill(0xff);

                // Compute the binary
                const binary = (Package as any).computeBinary(name, deps, payload);

                // Check the result
                expect(binary).toEqual(produceDesiredBinary(name, deps, payload));
            });
        });
    });

    describe('Package.computeVersion()', () => {
        it('should compute the version correctly for small binary', () => {
            const binary = Buffer.from([0x01, 0x02, 0x03, 0x04]);
            const version = (Package as any).computeVersion(binary);
            // The version is the SHA256 hash of the binary (sourced from https://emn178.github.io/online-tools/sha256.html)
            expect(version).toBe('9f64a747e1b97f131fabb6b447296c9b6f0201e79fb3c5356e6c77e89b6a806a');
        });

        it('should compute the version correctly for medium binary', () => {
            const binary = Buffer.from([
                0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f, 0x10,
            ]);
            const version = (Package as any).computeVersion(binary);
            // The version is the SHA256 hash of the binary (sourced from https://emn178.github.io/online-tools/sha256.html)
            expect(version).toBe('5dfbabeedf318bf33c0927c43d7630f51b82f351740301354fa3d7fc51f0132e');
        });

        it('should compute the version correctly for large binary', () => {
            const binary = Buffer.from([
                0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f, 0x10, 0x11,
                0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f, 0x20, 0x21, 0x22,
                0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2a, 0x2b, 0x2c, 0x2d, 0x2e, 0x2f, 0x30, 0x31, 0x32, 0x33,
                0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3a, 0x3b, 0x3c, 0x3d, 0x3e, 0x3f, 0x40, 0x41, 0x42, 0x43, 0x44,
                0x45, 0x46, 0x47, 0x48, 0x49, 0x4a, 0x4b, 0x4c, 0x4d, 0x4e, 0x4f,
            ]);
            const version = (Package as any).computeVersion(binary);
            // The version is the SHA256 hash of the binary (sourced from https://emn178.github.io/online-tools/sha256.html)
            expect(version).toBe('ce266517af1f9b2272e176703395a24fe91eba54fef1c05a9c57c2a215b182b6');
        });
    });

    // describe('Package.createTar()', () => {
    //     const tmpDir = path.join(os.tmpdir(), 'apm-create-tar-tmp-dir');

    //     beforeEach(() => {
    //         // Remove the temporary directory if it exists
    //         if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true, force: true });
    //         // Create the temporary directory
    //         fs.mkdirSync(tmpDir, { recursive: true });
    //     });

    //     describe('success cases', () => {
    //         it('should create a tar file correctly for a single file', async () => {
    //             // Create the file
    //             const fileRelPath = 'file.txt';
    //             const filePath = path.join(tmpDir, fileRelPath);
    //             fs.writeFileSync(filePath, 'Hello, world!');

    //             const tar = await (Package as any).createTar(tmpDir, [fileRelPath]);
    //             const tarHex = tar.toString('hex');
    //             const expectedTarHex = `66696c652e74787400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003030303634342000303030303030200030303030303020003030303030303030303135203135303331343337343533203031303730352000300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000075737461720030300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000030303030303020003030303030302000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000048656c6c6f2c20776f726c64210000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000`;
    //             expect(tar).toBeDefined();
    //             expect(tarHex).toBe(expectedTarHex);
    //         });
    //     });

    //     // describe('failure cases', () => {
    //     //     it('should throw an error if the path is not a directory', () => {
    //     //         const path = 'not-a-directory';
    //     //     });
    //     // });
    // });

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
                const dbg = debug('apm:common:tests:models:Package:load');

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
                const depsSerialized = (Package as any).serializeDeps(deps);

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
                const dbg = debug('apm:common:tests:models:Package:load');

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
                const depsSerialized = (Package as any).serializeDeps(deps);

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
                const dbg = debug('apm:common:tests:models:Package:load');

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
                const depsSerialized = (Package as any).serializeDeps(deps);

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
            it('Package.load() should throw PackageNotFoundError if the path does not exist', () => {
                const pkgPath = path.join(tmpRegistryPath, 'does-not-exist.tar');
                expect(() => Package.load(pkgPath)).toThrow(PackageNotFoundError);
            });

            it('Package.load() should throw PackageNotFoundError if the path is a directory', () => {
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
