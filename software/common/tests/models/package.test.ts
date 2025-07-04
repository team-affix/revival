import path from 'path';
import os from 'os';
import fs from 'fs';
import { glob } from 'glob';
import debug from 'debug';
import { expect, describe, it, beforeEach } from '@jest/globals';
import { Package, Draft, PackageBase } from '../../src/models/package';
import FailedToParseDepsError from '../../src/errors/failed-to-parse-deps';
import FailedToDeserializeDepsError from '../../src/errors/failed-to-deserialize-deps';
import DraftLoadError from '../../src/errors/draft-load';
import PackageLoadError from '../../src/errors/package-load';

describe('models/package', () => {
    // HELPER FUNCTIONS
    describe('Draft.parseDirectDeps()', () => {
        describe('success cases', () => {
            it('should parse as an empty map if the string is empty', () => {
                const raw = '';
                const deps = (Draft as any).parseDirectDeps(raw);
                expect(deps).toEqual(new Map());
            });

            it('should parse correctly with one dependency', () => {
                const raw = 'dep0 ver0';
                const deps = (Draft as any).parseDirectDeps(raw);
                expect(deps).toEqual(new Map([['dep0', 'ver0']]));
            });

            it('should parse correctly with two dependencies', () => {
                const raw = 'dep0 ver0\ndep1 ver1';
                const deps = (Draft as any).parseDirectDeps(raw);
                expect(deps).toEqual(
                    new Map([
                        ['dep0', 'ver0'],
                        ['dep1', 'ver1'],
                    ]),
                );
            });

            it('should parse correctly with many dependencies', () => {
                const raw = 'dep0 ver0\ndep1 ver1\ndep2 ver2\ndep3 ver3\ndep4 ver4\ndep5 ver5';
                const deps = (Draft as any).parseDirectDeps(raw);
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
                const deps = (Draft as any).parseDirectDeps(raw);
                expect(deps).toEqual(
                    new Map([
                        ['dep0', 'ver0'],
                        ['dep1', 'ver1'],
                    ]),
                );
            });

            it('should successfully parse if the string contains any redundant newlines', () => {
                const raw = 'dep0 ver0\n\n\ndep1 ver1\n\n\n\ndep2 ver2\n\n\n';
                const deps = (Draft as any).parseDirectDeps(raw);
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
                expect(() => (Draft as any).parseDirectDeps(raw)).toThrow(FailedToParseDepsError);
            });

            it('should throw a FailedToParseDepsError if the string contains any invalid dependencies', () => {
                const raw = 'dep0 ver0\ndep1';
                expect(() => (Draft as any).parseDirectDeps(raw)).toThrow(FailedToParseDepsError);
            });

            it('should throw a FailedToParseDepsError if the string contains only duplicate dependencies', () => {
                const raw = 'dep0 ver0\ndep0 ver1';
                expect(() => (Draft as any).parseDirectDeps(raw)).toThrow(FailedToParseDepsError);
            });

            it('should throw a FailedToParseDepsError if the string contains any duplicate dependencies', () => {
                const raw = 'dep0 ver0\ndep1 ver1\ndep0 ver2';
                expect(() => (Draft as any).parseDirectDeps(raw)).toThrow(FailedToParseDepsError);
            });

            it('should throw a FailedToParseDepsError if the string contains a single line with more than two parts', () => {
                const raw = 'dep0 ver0 etc\n';
                expect(() => (Draft as any).parseDirectDeps(raw)).toThrow(FailedToParseDepsError);
            });

            it('should throw a FailedToParseDepsError if the string contains any lines with more than two parts', () => {
                const raw = 'dep0 ver0\ndep1 ver1\ndep2 ver2 etc\ndep3 ver3';
                expect(() => (Draft as any).parseDirectDeps(raw)).toThrow(FailedToParseDepsError);
            });

            it('should throw a FailedToParseDepsError if the only line starts with a space', () => {
                const raw = ' dep0 ver0';
                expect(() => (Draft as any).parseDirectDeps(raw)).toThrow(FailedToParseDepsError);
            });

            it('should throw a FailedToParseDepsError if any lines start with a space', () => {
                const raw = 'dep0 ver0\n dep1 ver1\ndep2 ver2';
                expect(() => (Draft as any).parseDirectDeps(raw)).toThrow(FailedToParseDepsError);
            });
        });
    });

    describe('Package.serializeDirectDeps()', () => {
        it('should serialize with zero entries', () => {
            const deps = new Map();
            const serialized = (Package as any).serializeDirectDeps(deps);
            expect(serialized).toBe('{}');
        });

        it('should serialize with one entry', () => {
            const deps = new Map([['dep0', 'ver0']]);
            const serialized = (Package as any).serializeDirectDeps(deps);
            expect(serialized).toBe('{"dep0":"ver0"}');
        });

        it('should serialize correctly with 2 entries', () => {
            const deps = new Map([
                ['dep0', 'ver0'],
                ['dep1', 'ver1'],
            ]);
            const serialized = (Package as any).serializeDirectDeps(deps);
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

            const serialized = (Package as any).serializeDirectDeps(deps);
            expect(serialized).toBe(
                '{"dep0":"ver0","dep1":"ver1","dep2":"ver2","dep3":"ver3","dep4":"ver4","dep5":"ver5","dep6":"ver6","dep7":"ver7","dep8":"ver8","dep9":"ver9","dep10":"ver10","dep11":"ver11","dep12":"ver12","dep13":"ver13","dep14":"ver14","dep15":"ver15"}',
            );
        });
    });

    describe('Package.deserializeDirectDeps()', () => {
        describe('success cases', () => {
            it('should deserialize correctly with zero entries', () => {
                const serialized = '{}';
                const deps = (Package as any).deserializeDirectDeps(serialized);
                expect(deps).toEqual(new Map());
            });

            it('should deserialize correctly with one entry', () => {
                const serialized = '{"dep0":"ver0"}';
                const deps = (Package as any).deserializeDirectDeps(serialized);
                expect(deps).toEqual(new Map([['dep0', 'ver0']]));
            });

            it('should deserialize correctly with many entries', () => {
                const serialized =
                    '{"dep0":"ver0","dep1":"ver1","dep2":"ver2","dep3":"ver3","dep4":"ver4","dep5":"ver5","dep6":"ver6","dep7":"ver7","dep8":"ver8","dep9":"ver9","dep10":"ver10","dep11":"ver11","dep12":"ver12","dep13":"ver13","dep14":"ver14","dep15":"ver15"}';
                const deps = (Package as any).deserializeDirectDeps(serialized);
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
                expect(() => (Package as any).deserializeDirectDeps(serialized)).toThrow(FailedToDeserializeDepsError);
            });

            it('should throw a FailedToDeserializeDepsError if the string is not valid JSON', () => {
                const serialized = 'invalid';
                expect(() => (Package as any).deserializeDirectDeps(serialized)).toThrow(FailedToDeserializeDepsError);
            });

            it('should throw a FailedToDeserializeDepsError if the string is not valid JSON (missing a closing brace)', () => {
                const serialized = '{"dep0":"ver0"';
                expect(() => (Package as any).deserializeDirectDeps(serialized)).toThrow(FailedToDeserializeDepsError);
            });

            it('should throw a FailedToDeserializeDepsError if the string is not valid JSON (missing an opening brace)', () => {
                const serialized = '"dep0":"ver0"}';
                expect(() => (Package as any).deserializeDirectDeps(serialized)).toThrow(FailedToDeserializeDepsError);
            });

            it('should throw a FailedToDeserializeDepsError if the string is not valid JSON (missing a colon)', () => {
                const serialized = '{"dep0" "ver0"}';
                expect(() => (Package as any).deserializeDirectDeps(serialized)).toThrow(FailedToDeserializeDepsError);
            });
        });
    });

    describe('Package.computeBinary()', () => {
        // const produceDesiredBinary = (name: string, deps: Map<string, string>, payload: Buffer) => {
        //     // Create the chunks
        //     const chunks: Buffer[] = [];

        //     // Write the name length
        //     const nameLengthBuf = Buffer.alloc(4);
        //     nameLengthBuf.writeUInt32LE(name.length, 0);
        //     chunks.push(nameLengthBuf);

        //     // Write the name
        //     chunks.push(Buffer.from(name));

        //     // Write the dependencies length
        //     const depsLengthBuf = Buffer.alloc(4);
        //     depsLengthBuf.writeUInt32LE(depsSerialized.length, 0);
        //     chunks.push(depsLengthBuf);

        //     // Write the dependencies
        //     chunks.push(Buffer.from(depsSerialized));

        //     // Write the payload
        // };

        describe('success cases', () => {
            it('should compute the binary correctly for zero dependencies', () => {
                const name = 'PKG';
                const deps = new Map();
                const payload = Buffer.from([0xff]);

                // Compute the binary
                const binary = (Package as any).computeBinary(name, deps, payload);

                // Compute the hex
                const hex = binary.toString('hex');

                let desiredHex = '';
                desiredHex += '03000000'; // Name length
                desiredHex += '504b47'; // Name
                desiredHex += '02000000'; // Dependencies length
                desiredHex += '7b7d'; // Dependencies
                desiredHex += 'ff'; // Payload

                // Check the result
                expect(hex).toEqual(desiredHex);
            });

            it('should compute the binary correctly for one dependency', () => {
                const name = 'PKG';
                const deps = new Map([['dep0', 'ver0']]);
                const payload = Buffer.from([0xff]);

                // Compute the binary
                const binary = (Package as any).computeBinary(name, deps, payload);

                // Compute the hex
                const hex = binary.toString('hex');

                let desiredHex = '';
                desiredHex += '03000000'; // Name length
                desiredHex += '504b47'; // Name
                desiredHex += '0f000000'; // Dependencies length
                desiredHex += '7b2264657030223a2276657230227d'; // Dependencies
                desiredHex += 'ff'; // Payload

                // Check the result
                expect(hex).toEqual(desiredHex);
            });

            it('should compute the binary correctly for empty name and zero dependenciess', () => {
                const name = '';
                const deps = new Map();
                const payload = Buffer.from([0xff]);

                // Compute the binary
                const binary = (Package as any).computeBinary(name, deps, payload);

                // Compute the hex
                const hex = binary.toString('hex');

                let desiredHex = '';
                desiredHex += '00000000'; // Name length
                desiredHex += ''; // Name
                desiredHex += '02000000'; // Dependencies length
                desiredHex += '7b7d'; // Dependencies
                desiredHex += 'ff'; // Payload

                // Check the result
                expect(hex).toEqual(desiredHex);
            });

            it('should compute the binary correctly for empty name, zero dependencies, and large payload', () => {
                const name = '';
                const deps = new Map();
                const payload = Buffer.alloc(1000);
                payload.fill(0xff);

                // Compute the binary
                const binary = (Package as any).computeBinary(name, deps, payload);

                // Compute the hex
                const hex = binary.toString('hex');

                let desiredHex = '';
                desiredHex += '00000000'; // Name length
                desiredHex += ''; // Name
                desiredHex += '02000000'; // Dependencies length
                desiredHex += '7b7d'; // Dependencies
                desiredHex += 'ff'.repeat(1000); // Payload

                // Check the result
                expect(hex).toEqual(desiredHex);
            });

            it('should compute the binary correctly for empty name, one dependency, and large payload', () => {
                const name = '';
                const deps = new Map([['dep0', 'ver0']]);
                const payload = Buffer.alloc(1000);
                payload.fill(0xff);

                // Compute the binary
                const binary = (Package as any).computeBinary(name, deps, payload);

                // Compute the hex
                const hex = binary.toString('hex');

                let desiredHex = '';
                desiredHex += '00000000'; // Name length
                desiredHex += ''; // Name
                desiredHex += '0f000000'; // Dependencies length
                desiredHex += '7b2264657030223a2276657230227d'; // Dependencies
                desiredHex += 'ff'.repeat(1000); // Payload

                // Check the result
                expect(hex).toEqual(desiredHex);
            });

            it('should compute the binary correctly for long name, one dependency, and large payload', () => {
                const name = 'PKG_WITH_A_LONG_NAME_THAT_EXCEEDS_ALL_EXPECTATIONS_AND_THAT_IS_REALLY_LONG';
                const deps = new Map([['dep0', 'ver0']]);
                const payload = Buffer.alloc(1000);
                payload.fill(0xff);

                // Compute the binary
                const binary = (Package as any).computeBinary(name, deps, payload);

                // Compute the hex
                const hex = binary.toString('hex');

                let desiredHex = '';
                desiredHex += '4a000000'; // Name length
                desiredHex +=
                    '504b475F574954485F415F4C4F4E475F4E414D455F544841545F455843454544535F414C4C5F4558504543544154494F4E535F414E445F544841545F49535F5245414C4C595F4C4F4E47'.toLowerCase(); // Name
                desiredHex += '0f000000'; // Dependencies length
                desiredHex += '7b2264657030223a2276657230227d'; // Dependencies
                desiredHex += 'ff'.repeat(1000); // Payload

                // Check the result
                expect(hex).toEqual(desiredHex);
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

                // Compute the hex
                const hex = binary.toString('hex');

                let desiredHex = '';
                desiredHex += '4a000000'; // Name length
                desiredHex +=
                    '504b475f574954485f415f4c4f4e475f4e414d455f544841545f455843454544535f414c4c5f4558504543544154494f4e535f414e445f544841545f49535f5245414c4c595f4c4f4e47'.toLowerCase(); // Name
                desiredHex += '1d020000'; // Dependencies length
                desiredHex +=
                    '7b2264657030223a2276657230222c2264657031223a2276657231222c2264657032223a2276657232222c2264657033223a2276657233222c2264657034223a2276657234222c2264657035223a2276657235222c2264657036223a2276657236222c2264657037223a2276657237222c2264657038223a2276657238222c2264657039223a2276657239222c226465703130223a227665723130222c226465703131223a227665723131222c226465703132223a227665723132222c226465703133223a227665723133222c226465703134223a227665723134222c226465703135223a227665723135222c226465703136223a227665723136222c226465703137223a227665723137222c226465703138223a227665723138222c226465703139223a227665723139222c226465703230223a227665723230222c226465703231223a227665723231222c226465703232223a227665723232222c226465703233223a227665723233222c226465703234223a227665723234222c226465703235223a227665723235222c226465703236223a227665723236222c226465703237223a227665723237222c226465703238223a227665723238222c226465703239223a227665723239222c226465703330223a227665723330222c226465703331223a227665723331222c226465703332223a227665723332222c226465703333223a227665723333222c226465703334223a227665723334227d'; // Dependencies
                desiredHex += 'ff'.repeat(1000); // Payload
                // Check the result
                expect(hex).toEqual(desiredHex);
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

    describe('Package.packTar() and Package.extractTar()', () => {
        const packDir = path.join(os.tmpdir(), 'apm-pack-tar-tmp-dir');
        const extractDir = path.join(os.tmpdir(), 'apm-extract-tar-tmp-dir');

        const writeFileInside = (relPath: string, content: string) => {
            // Write the file inside the temporary directory
            const filePath = path.join(packDir, relPath);
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
            fs.writeFileSync(filePath, content);
        };

        const writeFilesInside = (entries: Map<string, string>) => {
            for (const [relPath, content] of entries) writeFileInside(relPath, content);
        };

        const assertFileInside = (relPath: string, content: string) => {
            const filePath = path.join(extractDir, relPath);
            expect(fs.existsSync(filePath)).toBe(true);
            expect(fs.readFileSync(filePath, 'utf8')).toBe(content);
        };

        const assertFilesMatchExactly = (entries: Map<string, string>) => {
            for (const [relPath, content] of entries) assertFileInside(relPath, content);
            // Get the list of files in the extract directory using glob
            const extractDirRelFiles = glob.sync('**/*', { cwd: extractDir, nodir: true }).sort();
            // Get the list of files in the pack directory using glob
            const expectedRelFiles = Array.from(entries.keys()).sort();
            // Assert that the list of files in the extract directory matches the list of files in the pack directory
            expect(extractDirRelFiles).toEqual(expectedRelFiles);
        };

        beforeEach(() => {
            // Remove the temporary directory if it exists
            if (fs.existsSync(packDir)) fs.rmSync(packDir, { recursive: true, force: true });
            if (fs.existsSync(extractDir)) fs.rmSync(extractDir, { recursive: true, force: true });

            // Create the temporary directory
            fs.mkdirSync(packDir, { recursive: true });
            fs.mkdirSync(extractDir, { recursive: true });
        });

        describe('success cases', () => {
            it('zero files', async () => {
                // Create the file

                const fileEntries = new Map<string, string>();

                writeFilesInside(fileEntries);

                const fileRelPaths: string[] = Array.from(fileEntries.keys());

                const tar = await (Package as any).packTar(packDir, fileRelPaths);

                expect(tar).toBeDefined();

                await (Package as any).extractTar(tar, extractDir);

                assertFilesMatchExactly(fileEntries);
            });

            it('a single file', async () => {
                // Create the file

                const fileEntries = new Map<string, string>([['file.txt', 'Hello, world!']]);

                writeFilesInside(fileEntries);

                const fileRelPaths: string[] = Array.from(fileEntries.keys());

                const tar = await (Package as any).packTar(packDir, fileRelPaths);

                expect(tar).toBeDefined();

                await (Package as any).extractTar(tar, extractDir);

                assertFilesMatchExactly(fileEntries);
            });

            it('two files with different names', async () => {
                // Create the file

                const fileEntries = new Map<string, string>([
                    ['file1.txt', 'Hello, world!'],
                    ['file2.txt', 'Hello, world!'],
                ]);

                writeFilesInside(fileEntries);

                const fileRelPaths: string[] = Array.from(fileEntries.keys());

                const tar = await (Package as any).packTar(packDir, fileRelPaths);

                expect(tar).toBeDefined();

                await (Package as any).extractTar(tar, extractDir);

                assertFilesMatchExactly(fileEntries);
            });

            it('one file in a subdirectory', async () => {
                // Create the file

                const fileEntries = new Map<string, string>([['subdir/file.txt', 'Hello, world!']]);

                writeFilesInside(fileEntries);

                const fileRelPaths: string[] = Array.from(fileEntries.keys());

                const tar = await (Package as any).packTar(packDir, fileRelPaths);

                expect(tar).toBeDefined();

                await (Package as any).extractTar(tar, extractDir);

                assertFilesMatchExactly(fileEntries);
            });

            it('two files in a subdirectory', async () => {
                // Create the file

                const fileEntries = new Map<string, string>([
                    ['subdir/file1.txt', 'Hello, world!'],
                    ['subdir/file2.txt', 'Hello, world!'],
                ]);

                writeFilesInside(fileEntries);

                const fileRelPaths: string[] = Array.from(fileEntries.keys());

                const tar = await (Package as any).packTar(packDir, fileRelPaths);

                expect(tar).toBeDefined();

                await (Package as any).extractTar(tar, extractDir);

                assertFilesMatchExactly(fileEntries);
            });

            it('two files, but only one is included in the tar', async () => {
                // Create the file

                writeFileInside('file1.txt', 'Hello, world!');

                const fileEntries = new Map<string, string>([['file2.txt', 'Hello, world!']]);

                writeFilesInside(fileEntries);

                const fileRelPaths: string[] = Array.from(fileEntries.keys());

                const tar = await (Package as any).packTar(packDir, fileRelPaths);

                expect(tar).toBeDefined();

                await (Package as any).extractTar(tar, extractDir);

                assertFilesMatchExactly(fileEntries);
            });

            it('two files with different contents', async () => {
                // Create the file

                const fileEntries = new Map<string, string>([
                    ['file1.txt', 'My name is Jake'],
                    ['file2.txt', 'My name is Adam'],
                ]);

                writeFilesInside(fileEntries);

                const fileRelPaths: string[] = Array.from(fileEntries.keys());

                const tar = await (Package as any).packTar(packDir, fileRelPaths);

                expect(tar).toBeDefined();

                await (Package as any).extractTar(tar, extractDir);

                assertFilesMatchExactly(fileEntries);
            });

            it('two files with different extensions', async () => {
                // Create the file

                const fileEntries = new Map<string, string>([
                    ['file1.md', 'My name is Jake'],
                    ['file2.txt', 'My name is Adam'],
                ]);

                writeFilesInside(fileEntries);

                const fileRelPaths: string[] = Array.from(fileEntries.keys());

                const tar = await (Package as any).packTar(packDir, fileRelPaths);

                expect(tar).toBeDefined();

                await (Package as any).extractTar(tar, extractDir);

                assertFilesMatchExactly(fileEntries);
            });

            it('files with unicode characters (specifically agda files)', async () => {
                // Create the file

                const fileEntries = new Map<string, string>([['file.agda', 'myNat : ℕ\nmyNat = 0']]);

                writeFilesInside(fileEntries);

                const fileRelPaths: string[] = Array.from(fileEntries.keys());

                const tar = await (Package as any).packTar(packDir, fileRelPaths);

                expect(tar).toBeDefined();

                await (Package as any).extractTar(tar, extractDir);

                assertFilesMatchExactly(fileEntries);
            });

            it('two files in different directories', async () => {
                // Create the file

                const fileEntries = new Map<string, string>([
                    ['subdir1/file1.txt', 'Hello, world1!'],
                    ['subdir2/file2.txt', 'Hello, world2!'],
                ]);

                writeFilesInside(fileEntries);

                const fileRelPaths: string[] = Array.from(fileEntries.keys());

                const tar = await (Package as any).packTar(packDir, fileRelPaths);

                expect(tar).toBeDefined();

                await (Package as any).extractTar(tar, extractDir);

                assertFilesMatchExactly(fileEntries);
            });

            it('a file in doubly-nested directories', async () => {
                // Create the file

                const fileEntries = new Map<string, string>([['subdir1/subdir2/file.txt', 'Hello, world!']]);

                writeFilesInside(fileEntries);

                const fileRelPaths: string[] = Array.from(fileEntries.keys());

                const tar = await (Package as any).packTar(packDir, fileRelPaths);

                expect(tar).toBeDefined();

                await (Package as any).extractTar(tar, extractDir);

                assertFilesMatchExactly(fileEntries);
            });

            it('many files in different directories', async () => {
                // Create the file

                const fileEntries = new Map<string, string>([
                    ['subdir1/subdir2/file1.txt', 'Hello, world1!'],
                    ['subdir1/subdir2/file2.txt', 'Hello, world2!'],
                    ['subdir1/subdir2/file3.txt', 'Hello, world3!'],
                    ['subdir1/file4.txt', 'Hello, world4!'],
                    ['subdir1/file5.txt', 'Hello, world5!'],
                    ['subdir1/subdir3/file6.txt', 'Hello, world6!'],
                    ['subdir1/subdir4/file7.txt', 'Hello, world7!'],
                    ['file8.txt', 'Hello, world8!'],
                ]);

                writeFilesInside(fileEntries);

                const fileRelPaths: string[] = Array.from(fileEntries.keys());

                const tar = await (Package as any).packTar(packDir, fileRelPaths);

                expect(tar).toBeDefined();

                await (Package as any).extractTar(tar, extractDir);

                assertFilesMatchExactly(fileEntries);
            });
        });

        // describe('failure cases', () => {
        //     it('should throw an error if the path is not a directory', () => {
        //         const path = 'not-a-directory';
        //     });
        // });
    });

    // PUBLIC INTERFACE TESTS
    describe('Draft.load()', () => {
        describe('success cases', () => {
            const tmpDir = path.join(os.tmpdir(), 'APMTmpDraft');

            const writeFileInside = (relPath: string, content: string) => {
                const filePath = path.join(tmpDir, relPath);
                fs.mkdirSync(path.dirname(filePath), { recursive: true });
                fs.writeFileSync(filePath, content);
            };

            beforeEach(() => {
                // Remove the temporary directory if it exists
                if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true, force: true });

                // Create the temporary directory
                fs.mkdirSync(tmpDir, { recursive: true });
            });

            it('empty deps.txt file and no source files', () => {
                // Create the file
                writeFileInside('deps.txt', '');

                // Load the draft
                const draft = Draft.load(tmpDir);

                // Expect the draft to be an instance of Draft
                expect(draft).toBeInstanceOf(Draft);
                expect(draft.getName()).toBe('APMTmpDraft');
                expect(draft.getDirectDeps()).toEqual(new Map());
                expect(draft.getSrcDir()).toBe(tmpDir);
                expect(draft.getAgdaFiles()).toEqual([]);
                expect(draft.getMdFiles()).toEqual([]);
            });

            it('empty deps.txt file and one dirt file (.txt)', () => {
                // Create the file
                writeFileInside('deps.txt', '');

                // Write the dirt file
                writeFileInside('file.txt', 'Hello, world!');

                // Load the draft
                const draft = Draft.load(tmpDir);

                // Expect the draft to be an instance of Draft
                expect(draft).toBeInstanceOf(Draft);
                expect(draft.getName()).toBe('APMTmpDraft');
                expect(draft.getDirectDeps()).toEqual(new Map());
                expect(draft.getSrcDir()).toBe(tmpDir);
                expect(draft.getAgdaFiles()).toEqual([]);
                expect(draft.getMdFiles()).toEqual([]);
            });

            it('empty deps.txt file and one agda file', () => {
                // Create the file
                writeFileInside('deps.txt', '');

                // Write the agda file
                writeFileInside('file.agda', 'myNat : ℕ\nmyNat = 0');

                // Load the draft
                const draft = Draft.load(tmpDir);

                // Expect the draft to be an instance of Draft
                expect(draft).toBeInstanceOf(Draft);
                expect(draft.getName()).toBe('APMTmpDraft');
                expect(draft.getDirectDeps()).toEqual(new Map());
                expect(draft.getSrcDir()).toBe(tmpDir);
                expect(draft.getAgdaFiles()).toEqual(['file.agda']);
                expect(draft.getMdFiles()).toEqual([]);
            });

            it('empty deps.txt file and one md file', () => {
                // Create the file
                writeFileInside('deps.txt', '');

                // Write the md file
                writeFileInside('file.md', '# My Document');

                // Load the draft
                const draft = Draft.load(tmpDir);

                // Expect the draft to be an instance of Draft
                expect(draft).toBeInstanceOf(Draft);
                expect(draft.getName()).toBe('APMTmpDraft');
                expect(draft.getDirectDeps()).toEqual(new Map());
                expect(draft.getSrcDir()).toBe(tmpDir);
                expect(draft.getAgdaFiles()).toEqual([]);
                expect(draft.getMdFiles()).toEqual(['file.md']);
            });

            it('empty deps.txt file and one agda file and one md file', () => {
                // Create the file
                writeFileInside('deps.txt', '');

                // Write the agda file
                writeFileInside('file.agda', 'myNat : ℕ\nmyNat = 0');

                // Write the md file
                writeFileInside('file.md', '# My Document');

                // Load the draft
                const draft = Draft.load(tmpDir);

                // Expect the draft to be an instance of Draft
                expect(draft).toBeInstanceOf(Draft);
                expect(draft.getName()).toBe('APMTmpDraft');
                expect(draft.getDirectDeps()).toEqual(new Map());
                expect(draft.getSrcDir()).toBe(tmpDir);
                expect(draft.getAgdaFiles()).toEqual(['file.agda']);
                expect(draft.getMdFiles()).toEqual(['file.md']);
            });

            it('empty deps.txt file and one agda file in nested directory', () => {
                // Create the file
                writeFileInside('deps.txt', '');

                // Write the agda file
                writeFileInside('subdir/file.agda', 'myNat : ℕ\nmyNat = 0');

                // Load the draft
                const draft = Draft.load(tmpDir);

                // Expect the draft to be an instance of Draft
                expect(draft).toBeInstanceOf(Draft);
                expect(draft.getName()).toBe('APMTmpDraft');
                expect(draft.getDirectDeps()).toEqual(new Map());
                expect(draft.getSrcDir()).toBe(tmpDir);
                expect(draft.getAgdaFiles()).toEqual(['subdir/file.agda']);
                expect(draft.getMdFiles()).toEqual([]);
            });

            it('empty deps.txt file and one md file in nested directory', () => {
                // Create the file
                writeFileInside('deps.txt', '');

                // Write the md file
                writeFileInside('subdir/file.md', '# My Document');

                // Load the draft
                const draft = Draft.load(tmpDir);

                // Expect the draft to be an instance of Draft
                expect(draft).toBeInstanceOf(Draft);
                expect(draft.getName()).toBe('APMTmpDraft');
                expect(draft.getDirectDeps()).toEqual(new Map());
                expect(draft.getSrcDir()).toBe(tmpDir);
                expect(draft.getAgdaFiles()).toEqual([]);
                expect(draft.getMdFiles()).toEqual(['subdir/file.md']);
            });

            it('empty deps.txt file and one agda file and one md file in nested directory', () => {
                // Create the file
                writeFileInside('deps.txt', '');

                // Write the agda file
                writeFileInside('subdir/file1.agda', 'myNat : ℕ\nmyNat = 0');

                // Write the md file
                writeFileInside('subdir/file2.md', '# My Document');

                // Load the draft
                const draft = Draft.load(tmpDir);

                // Expect the draft to be an instance of Draft
                expect(draft).toBeInstanceOf(Draft);
                expect(draft.getName()).toBe('APMTmpDraft');
                expect(draft.getDirectDeps()).toEqual(new Map());
                expect(draft.getSrcDir()).toBe(tmpDir);
                expect(draft.getAgdaFiles()).toEqual(['subdir/file1.agda']);
                expect(draft.getMdFiles()).toEqual(['subdir/file2.md']);
            });

            it('empty deps.txt file and one agda file in doubly-nested directory', () => {
                // Create the file
                writeFileInside('deps.txt', '');

                // Write the agda file
                writeFileInside('subdir/subdir2/file.agda', 'myNat : ℕ\nmyNat = 0');

                // Load the draft
                const draft = Draft.load(tmpDir);

                // Expect the draft to be an instance of Draft
                expect(draft).toBeInstanceOf(Draft);
                expect(draft.getName()).toBe('APMTmpDraft');
                expect(draft.getDirectDeps()).toEqual(new Map());
                expect(draft.getSrcDir()).toBe(tmpDir);
                expect(draft.getAgdaFiles()).toEqual(['subdir/subdir2/file.agda']);
                expect(draft.getMdFiles()).toEqual([]);
            });

            it('empty deps.txt file and multiple agda files', () => {
                // Create the file
                writeFileInside('deps.txt', '');

                // Write the agda files
                writeFileInside('file1.agda', 'myNat : ℕ\nmyNat = 0');
                writeFileInside('file2.agda', 'myNat : ℕ\nmyNat = 0');
                writeFileInside('file3.agda', 'myNat : ℕ\nmyNat = 0');

                // Load the draft
                const draft = Draft.load(tmpDir);

                // Expect the draft to be an instance of Draft
                expect(draft).toBeInstanceOf(Draft);
                expect(draft.getName()).toBe('APMTmpDraft');
                expect(draft.getDirectDeps()).toEqual(new Map());
                expect(draft.getSrcDir()).toBe(tmpDir);
                expect(draft.getAgdaFiles().sort()).toEqual(['file1.agda', 'file2.agda', 'file3.agda'].sort());
                expect(draft.getMdFiles().sort()).toEqual([]);
            });

            it('empty deps.txt file and multiple md files', () => {
                // Create the file
                writeFileInside('deps.txt', '');

                // Write the md files
                writeFileInside('file1.md', '# My Document');
                writeFileInside('file2.md', '# My Document');
                writeFileInside('file3.md', '# My Document');

                // Load the draft
                const draft = Draft.load(tmpDir);

                // Expect the draft to be an instance of Draft
                expect(draft).toBeInstanceOf(Draft);
                expect(draft.getName()).toBe('APMTmpDraft');
                expect(draft.getDirectDeps()).toEqual(new Map());
                expect(draft.getSrcDir()).toBe(tmpDir);
                expect(draft.getAgdaFiles().sort()).toEqual([]);
                expect(draft.getMdFiles().sort()).toEqual(['file1.md', 'file2.md', 'file3.md'].sort());
            });

            it('empty deps.txt file and multiple agda files and multiple md files', () => {
                // Create the file
                writeFileInside('deps.txt', '');

                // Write the agda files
                writeFileInside('file1.agda', 'myNat : ℕ\nmyNat = 0');
                writeFileInside('file2.agda', 'myNat : ℕ\nmyNat = 0');
                writeFileInside('file3.agda', 'myNat : ℕ\nmyNat = 0');

                // Write the md files
                writeFileInside('file1.md', '# My Document');
                writeFileInside('file2.md', '# My Document');
                writeFileInside('file3.md', '# My Document');

                // Load the draft
                const draft = Draft.load(tmpDir);

                // Expect the draft to be an instance of Draft
                expect(draft).toBeInstanceOf(Draft);
                expect(draft.getName()).toBe('APMTmpDraft');
                expect(draft.getDirectDeps()).toEqual(new Map());
                expect(draft.getSrcDir()).toBe(tmpDir);
                expect(draft.getAgdaFiles().sort()).toEqual(['file1.agda', 'file2.agda', 'file3.agda'].sort());
                expect(draft.getMdFiles().sort()).toEqual(['file1.md', 'file2.md', 'file3.md'].sort());
            });

            it('empty deps.txt file and multiple agda files and multiple md files in nested directories', () => {
                // Create the file
                writeFileInside('deps.txt', '');

                // Write the agda files
                writeFileInside('subdir1/file1.agda', 'myNat : ℕ\nmyNat = 0');
                writeFileInside('subdir1/README.md', '# My Document');
                writeFileInside('subdir2/file2.agda', 'myNat : ℕ\nmyNat = 0');
                writeFileInside('subdir2/README.md', '# My Document');
                writeFileInside('subdir2/subdir3/file3.agda', 'myNat : ℕ\nmyNat = 0');
                writeFileInside('subdir2/subdir3/README.md', '# My Document');

                // Load the draft
                const draft = Draft.load(tmpDir);

                // Expect the draft to be an instance of Draft
                expect(draft).toBeInstanceOf(Draft);
                expect(draft.getName()).toBe('APMTmpDraft');
                expect(draft.getDirectDeps()).toEqual(new Map());
                expect(draft.getSrcDir()).toBe(tmpDir);
                expect(draft.getAgdaFiles().sort()).toEqual(
                    ['subdir1/file1.agda', 'subdir2/file2.agda', 'subdir2/subdir3/file3.agda'].sort(),
                );
                expect(draft.getMdFiles().sort()).toEqual(
                    ['subdir1/README.md', 'subdir2/README.md', 'subdir2/subdir3/README.md'].sort(),
                );
            });

            it('single package deps.txt file and no source files', () => {
                // Create the file
                writeFileInside('deps.txt', 'name 1.0.0');

                // Load the draft
                const draft = Draft.load(tmpDir);

                // Expect the draft to be an instance of Draft
                expect(draft).toBeInstanceOf(Draft);
                expect(draft.getName()).toBe('APMTmpDraft');
                expect(draft.getDirectDeps()).toEqual(new Map([['name', '1.0.0']]));
                expect(draft.getSrcDir()).toBe(tmpDir);
                expect(draft.getAgdaFiles()).toEqual([]);
                expect(draft.getMdFiles()).toEqual([]);
            });

            it('two package deps.txt file and no source files', () => {
                // Create the file
                writeFileInside('deps.txt', 'name0 1.0.0\nname1 1.0.1');

                // Load the draft
                const draft = Draft.load(tmpDir);

                // Expect the draft to be an instance of Draft
                expect(draft).toBeInstanceOf(Draft);
                expect(draft.getName()).toBe('APMTmpDraft');
                expect(draft.getDirectDeps()).toEqual(
                    new Map([
                        ['name0', '1.0.0'],
                        ['name1', '1.0.1'],
                    ]),
                );
                expect(draft.getSrcDir()).toBe(tmpDir);
                expect(draft.getAgdaFiles()).toEqual([]);
                expect(draft.getMdFiles()).toEqual([]);
            });

            it('two package deps.txt file and one agda file', () => {
                // Create the file
                writeFileInside('deps.txt', 'name0 1.0.0\nname1 1.0.1');

                // Write the agda file
                writeFileInside('file.agda', 'myNat : ℕ\nmyNat = 0');

                // Load the draft
                const draft = Draft.load(tmpDir);

                // Expect the draft to be an instance of Draft
                expect(draft).toBeInstanceOf(Draft);
                expect(draft.getName()).toBe('APMTmpDraft');
                expect(draft.getDirectDeps()).toEqual(
                    new Map([
                        ['name0', '1.0.0'],
                        ['name1', '1.0.1'],
                    ]),
                );
                expect(draft.getSrcDir()).toBe(tmpDir);
                expect(draft.getAgdaFiles()).toEqual(['file.agda']);
                expect(draft.getMdFiles()).toEqual([]);
            });

            it('two package deps.txt file and one md file', () => {
                // Create the file
                writeFileInside('deps.txt', 'name0 1.0.0\nname1 1.0.1');

                // Write the md file
                writeFileInside('file.md', '# My Document');

                // Load the draft
                const draft = Draft.load(tmpDir);

                // Expect the draft to be an instance of Draft
                expect(draft).toBeInstanceOf(Draft);
                expect(draft.getName()).toBe('APMTmpDraft');
                expect(draft.getDirectDeps()).toEqual(
                    new Map([
                        ['name0', '1.0.0'],
                        ['name1', '1.0.1'],
                    ]),
                );
                expect(draft.getSrcDir()).toBe(tmpDir);
                expect(draft.getAgdaFiles()).toEqual([]);
                expect(draft.getMdFiles()).toEqual(['file.md']);
            });

            it('two package deps.txt file and one agda file and one md file', () => {
                // Create the file
                writeFileInside('deps.txt', 'name0 1.0.0\nname1 1.0.1');

                // Write the agda file
                writeFileInside('file.agda', 'myNat : ℕ\nmyNat = 0');

                // Write the md file
                writeFileInside('file.md', '# My Document');

                // Load the draft
                const draft = Draft.load(tmpDir);

                // Expect the draft to be an instance of Draft
                expect(draft).toBeInstanceOf(Draft);
                expect(draft.getName()).toBe('APMTmpDraft');
                expect(draft.getDirectDeps()).toEqual(
                    new Map([
                        ['name0', '1.0.0'],
                        ['name1', '1.0.1'],
                    ]),
                );
                expect(draft.getSrcDir()).toBe(tmpDir);
                expect(draft.getAgdaFiles()).toEqual(['file.agda']);
                expect(draft.getMdFiles()).toEqual(['file.md']);
            });

            it('many package deps.txt file and multiple agda files', () => {
                // Create the file
                writeFileInside('deps.txt', 'name0 1.0.0\nname1 1.0.1\nname2 1.0.2\nname3 1.0.3\nname4 1.0.4');

                // Write the agda files
                writeFileInside('file1.agda', 'myNat : ℕ\nmyNat = 0');
                writeFileInside('file2.agda', 'myNat : ℕ\nmyNat = 0');
                writeFileInside('file3.agda', 'myNat : ℕ\nmyNat = 0');
                writeFileInside('file4.agda', 'myNat : ℕ\nmyNat = 0');
                writeFileInside('file5.agda', 'myNat : ℕ\nmyNat = 0');

                // Load the draft
                const draft = Draft.load(tmpDir);

                // Expect the draft to be an instance of Draft
                expect(draft).toBeInstanceOf(Draft);
                expect(draft.getName()).toBe('APMTmpDraft');
                expect(draft.getDirectDeps()).toEqual(
                    new Map([
                        ['name0', '1.0.0'],
                        ['name1', '1.0.1'],
                        ['name2', '1.0.2'],
                        ['name3', '1.0.3'],
                        ['name4', '1.0.4'],
                    ]),
                );
                expect(draft.getSrcDir()).toBe(tmpDir);
                expect(draft.getAgdaFiles().sort()).toEqual(
                    ['file1.agda', 'file2.agda', 'file3.agda', 'file4.agda', 'file5.agda'].sort(),
                );
                expect(draft.getMdFiles().sort()).toEqual([]);
            });

            it('many package deps.txt file and multiple agda files in random nested directories', () => {
                // Create the file
                writeFileInside('deps.txt', 'name0 1.0.0\nname1 1.0.1\nname2 1.0.2\nname3 1.0.3\nname4 1.0.4');

                // Write the agda files
                writeFileInside('subdir1/file1.agda', 'myNat : ℕ\nmyNat = 0');
                writeFileInside('subdir1/subdir2/subdir3/subdir4/file2.agda', 'myNat : ℕ\nmyNat = 0');
                writeFileInside('subdir2/file3.agda', 'myNat : ℕ\nmyNat = 0');
                writeFileInside('subdir4/file4.agda', 'myNat : ℕ\nmyNat = 0');
                writeFileInside('subdir3/file5.agda', 'myNat : ℕ\nmyNat = 0');

                // Load the draft
                const draft = Draft.load(tmpDir);

                // Expect the draft to be an instance of Draft
                expect(draft).toBeInstanceOf(Draft);
                expect(draft.getName()).toBe('APMTmpDraft');
                expect(draft.getDirectDeps()).toEqual(
                    new Map([
                        ['name0', '1.0.0'],
                        ['name1', '1.0.1'],
                        ['name2', '1.0.2'],
                        ['name3', '1.0.3'],
                        ['name4', '1.0.4'],
                    ]),
                );
                expect(draft.getSrcDir()).toBe(tmpDir);
                expect(draft.getAgdaFiles().sort()).toEqual(
                    [
                        'subdir1/file1.agda',
                        'subdir1/subdir2/subdir3/subdir4/file2.agda',
                        'subdir2/file3.agda',
                        'subdir4/file4.agda',
                        'subdir3/file5.agda',
                    ].sort(),
                );
                expect(draft.getMdFiles().sort()).toEqual([]);
            });
        });

        describe('failure cases', () => {
            const tmpDir = path.join(os.tmpdir(), 'failure-cases');

            beforeEach(() => {
                // Remove the temporary directory if it exists
                if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true, force: true });

                // Create the temporary directory
                fs.mkdirSync(tmpDir, { recursive: true });
            });

            it('should throw a DraftLoadError if the path does not exist', () => {
                const srcPath = path.join(tmpDir, 'does-not-exist');

                expect(() => Draft.load(srcPath)).toThrow(DraftLoadError);
            });

            it('should throw a DraftLoadError if the path is not a directory', () => {
                const srcPath = path.join(tmpDir, 'not-a-directory');

                // Create the file
                fs.writeFileSync(srcPath, 'not-a-directory');

                // Expect the file to exist
                expect(fs.existsSync(srcPath)).toBe(true);

                expect(() => Draft.load(srcPath)).toThrow(DraftLoadError);
            });

            it('should throw a DraftLoadError if the path does not contain a deps.txt file', () => {
                const srcPath = path.join(tmpDir, 'no-deps-txt');

                // Create the file
                fs.mkdirSync(srcPath, { recursive: true });

                // Expect the file to exist
                expect(fs.existsSync(srcPath)).toBe(true);

                expect(() => Draft.load(srcPath)).toThrow(DraftLoadError);
            });

            it('should throw a DraftLoadError if the deps.txt is not a file', () => {
                const srcPath = path.join(tmpDir, 'no-deps-txt');
                const depsTxtPath = path.join(srcPath, 'deps.txt');

                // Create the file
                fs.mkdirSync(srcPath, { recursive: true });

                // Create the deps.txt folder (yes, this is strange, but it's just for testing)
                fs.mkdirSync(depsTxtPath, { recursive: true });

                // Expect the folder to exist
                expect(fs.existsSync(depsTxtPath)).toBe(true);

                expect(() => Draft.load(srcPath)).toThrow(DraftLoadError);
            });

            it('should throw a FailedToParseDepsError if the deps.txt file is invalid', () => {
                const srcPath = path.join(tmpDir, 'invalid-deps-txt');
                const depsTxtPath = path.join(srcPath, 'deps.txt');

                // Create the file
                fs.mkdirSync(srcPath, { recursive: true });

                // Create the deps.txt file
                fs.writeFileSync(depsTxtPath, 'pkgName');

                // Expect the file to exist
                expect(fs.existsSync(depsTxtPath)).toBe(true);

                expect(() => Draft.load(srcPath)).toThrow(FailedToParseDepsError);
            });
        });
    });

    describe('Package.load()', () => {
        const tmpRegistryPath = path.join(os.tmpdir(), 'tmp-registry');

        beforeEach(() => {
            // Remove the temporary registry if it exists
            if (fs.existsSync(tmpRegistryPath)) fs.rmSync(tmpRegistryPath, { recursive: true, force: true });

            // Create the temporary registry
            fs.mkdirSync(tmpRegistryPath, { recursive: true });
        });

        describe('success cases', () => {
            const genericTest = (pkgName: string, deps: Map<string, string>, payload: Buffer) => {
                // Get the debugger
                const dbg = debug('apm:common:tests:models:Package:load');

                // Construct the package path
                const pkgPath = path.join(tmpRegistryPath, `test.apm`);

                // If the file already exists, remove it
                if (fs.existsSync(pkgPath)) fs.unlinkSync(pkgPath);

                // Create the binary
                const binary = (Package as any).computeBinary(pkgName, deps, payload);

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
                expect(pkg.getDirectDeps()).toEqual(deps);
                expect(pkg.getVersion()).toBe(version);
                expect(pkg.getPayload()).toEqual(payload);
            };

            it('4-char name, 3 dependencies, 1-byte payload', () =>
                genericTest(
                    'name',
                    new Map([
                        ['dep0', '1.0.0'],
                        ['dep1', '1.0.1'],
                        ['dep2', '1.0.2'],
                    ]),
                    Buffer.from([0xff]),
                ));

            it('no dependencies', () => genericTest('name', new Map(), Buffer.from([0xff])));

            it('many dependencies', () =>
                genericTest(
                    'name',
                    new Map([
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
                    ]),
                    Buffer.from([0xff]),
                ));

            it('no dependencies and a long name', () =>
                genericTest('name'.repeat(100), new Map(), Buffer.from([0xff])));

            it('no dependencies and a huge payload', () =>
                genericTest('name', new Map(), Buffer.from(new Uint8Array(10000))));

            it('long name, many dependencies and a huge payload', () =>
                genericTest(
                    'name'.repeat(100),
                    new Map([
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
                    ]),
                    Buffer.from(new Uint8Array(10000)),
                ));
        });

        describe('failure cases', () => {
            it('Package.load() should throw PackageLoadError if the path does not exist', () => {
                const pkgPath = path.join(tmpRegistryPath, 'does-not-exist.tar');
                expect(() => Package.load(pkgPath)).toThrow(PackageLoadError);
            });

            it('Package.load() should throw PackageNotFoundError if the path is a directory', () => {
                const dirPath = path.join(tmpRegistryPath, 'dir');

                // Create the directory
                fs.mkdirSync(dirPath, { recursive: true });

                // Expect the directory to exist
                expect(fs.existsSync(dirPath)).toBe(true);

                // Expect the package to not be found
                expect(() => Package.load(dirPath)).toThrow(PackageLoadError);
            });

            it('Package.load() should throw PackageLoadError if the package is too short to contain a name length', () => {
                const pkgPath = path.join(tmpRegistryPath, 'too-short-name-length.apm');

                // Create the package file
                fs.writeFileSync(pkgPath, Buffer.from([]));

                // Expect the package to not be found
                expect(() => Package.load(pkgPath)).toThrow(PackageLoadError);
            });

            it('Package.load() should throw PackageLoadError if the package name length is nonzero but the name is empty', () => {
                const pkgPath = path.join(tmpRegistryPath, 'too-short-name.apm');

                // Create binary
                const chunks: Buffer[] = [];

                // Add the name length
                const nameLengthBuf = Buffer.alloc(4);
                nameLengthBuf.writeUInt32LE(1, 0);
                chunks.push(nameLengthBuf);

                // Create the package file
                fs.writeFileSync(pkgPath, Buffer.concat(chunks));
            });

            it('Package.load() should throw PackageLoadError if the package name is smaller than the designated name length', () => {
                const pkgPath = path.join(tmpRegistryPath, 'too-short-name.apm');

                // Create binary
                const chunks: Buffer[] = [];

                // Add the name length
                const nameLengthBuf = Buffer.alloc(4);
                nameLengthBuf.writeUInt32LE(5, 0);
                chunks.push(nameLengthBuf);

                // Add the name
                const nameBuf = Buffer.from('name');
                chunks.push(nameBuf);

                // Create the package file
                fs.writeFileSync(pkgPath, Buffer.concat(chunks));

                // Expect the package to not be found
                expect(() => Package.load(pkgPath)).toThrow(PackageLoadError);
            });

            it('Package.load() should throw PackageLoadError if the package dependencies length is missing', () => {
                const pkgPath = path.join(tmpRegistryPath, 'missing-deps-length.apm');

                // Create binary
                const chunks: Buffer[] = [];

                // Add the name length
                const nameLengthBuf = Buffer.alloc(4);
                nameLengthBuf.writeUInt32LE(4, 0);
                chunks.push(nameLengthBuf);

                // Add the name
                const nameBuf = Buffer.from('name');
                chunks.push(nameBuf);

                // Create the package file
                fs.writeFileSync(pkgPath, Buffer.concat(chunks));

                // Expect the package to not be found
                expect(() => Package.load(pkgPath)).toThrow(PackageLoadError);
            });

            it('Package.load() should throw PackageLoadError if the package dependencies are missing', () => {
                const pkgPath = path.join(tmpRegistryPath, 'missing-deps.apm');

                // Create binary
                const chunks: Buffer[] = [];

                // Add the name length
                const nameLengthBuf = Buffer.alloc(4);
                nameLengthBuf.writeUInt32LE(4, 0);
                chunks.push(nameLengthBuf);

                // Add the name
                const nameBuf = Buffer.from('name');
                chunks.push(nameBuf);

                // Add the dependencies length
                const depsLengthBuf = Buffer.alloc(4);
                depsLengthBuf.writeUInt32LE(2, 0);
                chunks.push(depsLengthBuf);

                // Create the package file
                fs.writeFileSync(pkgPath, Buffer.concat(chunks));

                // Expect the package to not be found
                expect(() => Package.load(pkgPath)).toThrow(PackageLoadError);
            });

            it('Package.load() should throw PackageLoadError if the package dependencies are smaller than the designated dependencies length', () => {
                const pkgPath = path.join(tmpRegistryPath, 'too-short-deps.apm');

                // Create binary
                const chunks: Buffer[] = [];

                // Add the name length
                const nameLengthBuf = Buffer.alloc(4);
                nameLengthBuf.writeUInt32LE(4, 0);
                chunks.push(nameLengthBuf);

                // Add the name
                const nameBuf = Buffer.from('name');
                chunks.push(nameBuf);

                // Add the dependencies length
                const depsLengthBuf = Buffer.alloc(4);
                depsLengthBuf.writeUInt32LE(3, 0);
                chunks.push(depsLengthBuf);

                // Add the dependencies
                const depsBuf = Buffer.from('{}');
                chunks.push(depsBuf);

                // Create the package file
                fs.writeFileSync(pkgPath, Buffer.concat(chunks));

                // Expect the package to not be found
                expect(() => Package.load(pkgPath)).toThrow(PackageLoadError);
            });

            it('Package.load() should throw FailedToDeserializeDepsError if the package dependencies are not a valid JSON object', () => {
                const pkgPath = path.join(tmpRegistryPath, 'invalid-deps.apm');

                // Create binary
                const chunks: Buffer[] = [];

                // Add the name length
                const nameLengthBuf = Buffer.alloc(4);
                nameLengthBuf.writeUInt32LE(4, 0);
                chunks.push(nameLengthBuf);

                // Add the name
                const nameBuf = Buffer.from('name');
                chunks.push(nameBuf);

                // Add the dependencies length
                const depsLengthBuf = Buffer.alloc(4);
                depsLengthBuf.writeUInt32LE(1, 0);
                chunks.push(depsLengthBuf);

                // Add the dependencies
                const depsBuf = Buffer.from('{');
                chunks.push(depsBuf);

                // Create the package file
                fs.writeFileSync(pkgPath, Buffer.concat(chunks));

                // Expect the package to not be found
                expect(() => Package.load(pkgPath)).toThrow(FailedToDeserializeDepsError);
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
