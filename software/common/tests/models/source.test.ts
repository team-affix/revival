import path from 'path';
import os from 'os';
import fs from 'fs';
import { glob } from 'glob';
import { expect, describe, it, beforeEach } from '@jest/globals';
import { Source, __test__ as SourceTest } from '../../src/models/source';

describe('models/Source', () => {
    describe('packTar() and extractTar()', () => {
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
            const genericTest = async (fileEntries: Map<string, string>) => {
                // Create the files
                writeFilesInside(fileEntries);

                const fileRelPaths: string[] = Array.from(fileEntries.keys());

                // Pack the source
                const payload = await SourceTest.packTar(packDir, fileRelPaths);

                expect(payload).toBeDefined();

                // Extract the source
                await SourceTest.extractTar(extractDir, payload);

                assertFilesMatchExactly(fileEntries);
            };
            it('zero files', async () => genericTest(new Map()));

            it('a single file', async () => genericTest(new Map([['file.txt', 'Hello, world!']])));

            it('two files with different names', async () =>
                genericTest(
                    new Map([
                        ['file1.txt', 'Hello, world!'],
                        ['file2.txt', 'Hello, world!'],
                    ]),
                ));

            it('one file in a subdirectory', async () =>
                genericTest(new Map<string, string>([['subdir/file.txt', 'Hello, world!']])));

            it('two files in a subdirectory', async () =>
                genericTest(
                    new Map<string, string>([
                        ['subdir/file1.txt', 'Hello, world!'],
                        ['subdir/file2.txt', 'Hello, world!'],
                    ]),
                ));

            it('two files, but only one is included in the tar', async () =>
                genericTest(new Map<string, string>([['file2.txt', 'Hello, world!']])));

            it('two files with different contents', async () =>
                genericTest(
                    new Map<string, string>([
                        ['file1.txt', 'My name is Jake'],
                        ['file2.txt', 'My name is Adam'],
                    ]),
                ));

            it('two files with different extensions', async () =>
                genericTest(
                    new Map<string, string>([
                        ['file1.md', 'My name is Jake'],
                        ['file2.txt', 'My name is Adam'],
                    ]),
                ));

            it('files with unicode characters (specifically agda files)', async () =>
                genericTest(new Map<string, string>([['file.agda', 'myNat : ℕ\nmyNat = 0']])));

            it('two files in different directories', async () =>
                genericTest(
                    new Map<string, string>([
                        ['subdir1/file1.txt', 'Hello, world1!'],
                        ['subdir2/file2.txt', 'Hello, world2!'],
                    ]),
                ));

            it('a file in doubly-nested directories', async () =>
                genericTest(new Map<string, string>([['subdir1/subdir2/file.txt', 'Hello, world!']])));

            it('many files in different directories', async () =>
                genericTest(
                    new Map<string, string>([
                        ['subdir1/subdir2/file1.txt', 'Hello, world1!'],
                        ['subdir1/subdir2/file2.txt', 'Hello, world2!'],
                        ['subdir1/subdir2/file3.txt', 'Hello, world3!'],
                        ['subdir1/file4.txt', 'Hello, world4!'],
                        ['subdir1/file5.txt', 'Hello, world5!'],
                        ['subdir1/subdir3/file6.txt', 'Hello, world6!'],
                        ['subdir1/subdir4/file7.txt', 'Hello, world7!'],
                        ['file8.txt', 'Hello, world8!'],
                    ]),
                ));
        });
    });
    describe('Source.pack() and Source.extract()', () => {
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
            const genericTest = async (fileEntries: Map<string, string>) => {
                // Create the files
                writeFilesInside(fileEntries);

                // Construct the source object
                const source = await Source.load(packDir);

                // Pack the source
                const payload = await Source.pack(source);

                expect(payload).toBeDefined();

                // Extract the source
                await Source.extract(extractDir, payload);

                // Get only the files that end in .agda or .md
                const filteredFiles = new Map<string, string>();
                for (const [filename, content] of fileEntries) {
                    if (filename.endsWith('.agda') || filename.endsWith('.md')) filteredFiles.set(filename, content);
                }

                assertFilesMatchExactly(filteredFiles);
            };

            it('zero files', async () => genericTest(new Map()));

            it('a single dirt file', async () => genericTest(new Map([['file.txt', 'Hello, world!']])));

            it('a single agda file', async () =>
                genericTest(new Map<string, string>([['file.agda', 'myNat : ℕ\nmyNat = 0']])));

            it('a single md file', async () => genericTest(new Map<string, string>([['file.md', '# Hello, world!']])));

            it('two dirt files with different names', async () =>
                genericTest(
                    new Map([
                        ['file1.txt', 'Hello, world!'],
                        ['file2.txt', 'Hello, world!'],
                    ]),
                ));

            it('two agda files with different names', async () =>
                genericTest(
                    new Map([
                        ['file1.agda', 'myNat : ℕ\nmyNat = 0'],
                        ['file2.agda', 'myNat : ℕ\nmyNat = 0'],
                    ]),
                ));

            it('two md files with different names', async () =>
                genericTest(
                    new Map([
                        ['file1.md', '# Hello, world!'],
                        ['file2.md', '# Hello, world!'],
                    ]),
                ));

            it('one dirt file in a subdirectory', async () =>
                genericTest(new Map<string, string>([['subdir/file.txt', 'Hello, world!']])));

            it('two dirt files in a subdirectory', async () =>
                genericTest(
                    new Map<string, string>([
                        ['subdir/file1.txt', 'Hello, world!'],
                        ['subdir/file2.txt', 'Hello, world!'],
                    ]),
                ));

            it('one agda file in a subdirectory', async () =>
                genericTest(new Map<string, string>([['subdir/file.agda', 'myNat : ℕ\nmyNat = 0']])));

            it('one md file in a subdirectory', async () =>
                genericTest(new Map<string, string>([['subdir/file.md', '# Hello, world!']])));

            it('two agda files in a subdirectory', async () =>
                genericTest(
                    new Map<string, string>([
                        ['subdir/file1.agda', 'myNat : ℕ\nmyNat = 0'],
                        ['subdir/file2.agda', 'myNat : ℕ\nmyNat = 0'],
                    ]),
                ));

            it('two md files in a subdirectory', async () =>
                genericTest(
                    new Map<string, string>([
                        ['subdir/file1.md', '# Hello, world!'],
                        ['subdir/file2.md', '# Hello, world!'],
                    ]),
                ));

            it('dirt file AND agda file', async () =>
                genericTest(
                    new Map<string, string>([
                        ['file1.txt', 'Hello, world!'],
                        ['file2.agda', 'myNat : ℕ\nmyNat = 0'],
                    ]),
                ));

            it('two agda files with different contents', async () =>
                genericTest(
                    new Map<string, string>([
                        ['file1.agda', 'myNat : ℕ\nmyNat = 0'],
                        ['file2.agda', 'myNat : ℕ\nmyNat = 1'],
                    ]),
                ));

            it('two md files with different contents', async () =>
                genericTest(
                    new Map<string, string>([
                        ['file1.md', '# Hello, world!'],
                        ['file2.md', '# Hello, world!'],
                    ]),
                ));

            it('two md files in different directories', async () =>
                genericTest(
                    new Map<string, string>([
                        ['subdir1/file1.md', '# Hello, world1!'],
                        ['subdir2/file2.md', '# Hello, world2!'],
                    ]),
                ));

            it('a dirt file in doubly-nested directories', async () =>
                genericTest(new Map<string, string>([['subdir1/subdir2/file.txt', 'Hello, world!']])));

            it('an agda file in doubly-nested directories', async () =>
                genericTest(new Map<string, string>([['subdir1/subdir2/file.agda', 'myNat : ℕ\nmyNat = 0']])));

            it('a md file in doubly-nested directories', async () =>
                genericTest(new Map<string, string>([['subdir1/subdir2/file.md', '# Hello, world!']])));

            it('many different types of files in different directories', async () =>
                genericTest(
                    new Map<string, string>([
                        ['subdir1/subdir2/file1.txt', 'Hello, world1!'],
                        ['subdir1/subdir2/file2.agda', 'myNat : ℕ\nmyNat = 0'],
                        ['subdir1/subdir2/file3.md', '# Hello, world3!'],
                        ['subdir1/file4.txt', 'Hello, world4!'],
                        ['subdir1/file5.txt', 'Hello, world5!'],
                        ['subdir1/subdir3/file6.agda', 'myNat : ℕ\nmyNat = 0'],
                        ['subdir1/subdir4/file7.md', '# Hello, world7!'],
                        ['file8.txt', 'Hello, world8!'],
                    ]),
                ));
        });
    });
});
