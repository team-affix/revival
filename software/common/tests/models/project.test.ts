// import { Source } from '../../src/models/source';
// import { expect, describe, it } from '@jest/globals';

// describe('models/Source', () => {
//     // PUBLIC INTERFACE TESTS
//     describe('Source.load()', () => {
//         describe('success cases', () => {
//             const tmpDir = path.join(os.tmpdir(), 'APMTmpDraft');

//             const writeFileInside = (relPath: string, content: string) => {
//                 const filePath = path.join(tmpDir, relPath);
//                 fs.mkdirSync(path.dirname(filePath), { recursive: true });
//                 fs.writeFileSync(filePath, content);
//             };

//             beforeEach(() => {
//                 // Remove the temporary directory if it exists
//                 if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true, force: true });

//                 // Create the temporary directory
//                 fs.mkdirSync(tmpDir, { recursive: true });
//             });

//             it('empty deps.txt file and no source files', () => {
//                 // Create the file
//                 writeFileInside('deps.txt', '');

//                 // Load the draft
//                 const draft = Draft.load(tmpDir);

//                 // Expect the draft to be an instance of Draft
//                 expect(draft).toBeInstanceOf(Draft);
//                 expect(draft.getName()).toBe('APMTmpDraft');
//                 expect(draft.getDirectDeps()).toEqual(new Map());
//                 expect(draft.getSrcDir()).toBe(tmpDir);
//                 expect(draft.getAgdaFiles()).toEqual([]);
//                 expect(draft.getMdFiles()).toEqual([]);
//             });

//             it('empty deps.txt file and one dirt file (.txt)', () => {
//                 // Create the file
//                 writeFileInside('deps.txt', '');

//                 // Write the dirt file
//                 writeFileInside('file.txt', 'Hello, world!');

//                 // Load the draft
//                 const draft = Draft.load(tmpDir);

//                 // Expect the draft to be an instance of Draft
//                 expect(draft).toBeInstanceOf(Draft);
//                 expect(draft.getName()).toBe('APMTmpDraft');
//                 expect(draft.getDirectDeps()).toEqual(new Map());
//                 expect(draft.getSrcDir()).toBe(tmpDir);
//                 expect(draft.getAgdaFiles()).toEqual([]);
//                 expect(draft.getMdFiles()).toEqual([]);
//             });

//             it('empty deps.txt file and one agda file', () => {
//                 // Create the file
//                 writeFileInside('deps.txt', '');

//                 // Write the agda file
//                 writeFileInside('file.agda', 'myNat : ℕ\nmyNat = 0');

//                 // Load the draft
//                 const draft = Draft.load(tmpDir);

//                 // Expect the draft to be an instance of Draft
//                 expect(draft).toBeInstanceOf(Draft);
//                 expect(draft.getName()).toBe('APMTmpDraft');
//                 expect(draft.getDirectDeps()).toEqual(new Map());
//                 expect(draft.getSrcDir()).toBe(tmpDir);
//                 expect(draft.getAgdaFiles()).toEqual(['file.agda']);
//                 expect(draft.getMdFiles()).toEqual([]);
//             });

//             it('empty deps.txt file and one md file', () => {
//                 // Create the file
//                 writeFileInside('deps.txt', '');

//                 // Write the md file
//                 writeFileInside('file.md', '# My Document');

//                 // Load the draft
//                 const draft = Draft.load(tmpDir);

//                 // Expect the draft to be an instance of Draft
//                 expect(draft).toBeInstanceOf(Draft);
//                 expect(draft.getName()).toBe('APMTmpDraft');
//                 expect(draft.getDirectDeps()).toEqual(new Map());
//                 expect(draft.getSrcDir()).toBe(tmpDir);
//                 expect(draft.getAgdaFiles()).toEqual([]);
//                 expect(draft.getMdFiles()).toEqual(['file.md']);
//             });

//             it('empty deps.txt file and one agda file and one md file', () => {
//                 // Create the file
//                 writeFileInside('deps.txt', '');

//                 // Write the agda file
//                 writeFileInside('file.agda', 'myNat : ℕ\nmyNat = 0');

//                 // Write the md file
//                 writeFileInside('file.md', '# My Document');

//                 // Load the draft
//                 const draft = Draft.load(tmpDir);

//                 // Expect the draft to be an instance of Draft
//                 expect(draft).toBeInstanceOf(Draft);
//                 expect(draft.getName()).toBe('APMTmpDraft');
//                 expect(draft.getDirectDeps()).toEqual(new Map());
//                 expect(draft.getSrcDir()).toBe(tmpDir);
//                 expect(draft.getAgdaFiles()).toEqual(['file.agda']);
//                 expect(draft.getMdFiles()).toEqual(['file.md']);
//             });

//             it('empty deps.txt file and one agda file in nested directory', () => {
//                 // Create the file
//                 writeFileInside('deps.txt', '');

//                 // Write the agda file
//                 writeFileInside('subdir/file.agda', 'myNat : ℕ\nmyNat = 0');

//                 // Load the draft
//                 const draft = Draft.load(tmpDir);

//                 // Expect the draft to be an instance of Draft
//                 expect(draft).toBeInstanceOf(Draft);
//                 expect(draft.getName()).toBe('APMTmpDraft');
//                 expect(draft.getDirectDeps()).toEqual(new Map());
//                 expect(draft.getSrcDir()).toBe(tmpDir);
//                 expect(draft.getAgdaFiles()).toEqual(['subdir/file.agda']);
//                 expect(draft.getMdFiles()).toEqual([]);
//             });

//             it('empty deps.txt file and one md file in nested directory', () => {
//                 // Create the file
//                 writeFileInside('deps.txt', '');

//                 // Write the md file
//                 writeFileInside('subdir/file.md', '# My Document');

//                 // Load the draft
//                 const draft = Draft.load(tmpDir);

//                 // Expect the draft to be an instance of Draft
//                 expect(draft).toBeInstanceOf(Draft);
//                 expect(draft.getName()).toBe('APMTmpDraft');
//                 expect(draft.getDirectDeps()).toEqual(new Map());
//                 expect(draft.getSrcDir()).toBe(tmpDir);
//                 expect(draft.getAgdaFiles()).toEqual([]);
//                 expect(draft.getMdFiles()).toEqual(['subdir/file.md']);
//             });

//             it('empty deps.txt file and one agda file and one md file in nested directory', () => {
//                 // Create the file
//                 writeFileInside('deps.txt', '');

//                 // Write the agda file
//                 writeFileInside('subdir/file1.agda', 'myNat : ℕ\nmyNat = 0');

//                 // Write the md file
//                 writeFileInside('subdir/file2.md', '# My Document');

//                 // Load the draft
//                 const draft = Draft.load(tmpDir);

//                 // Expect the draft to be an instance of Draft
//                 expect(draft).toBeInstanceOf(Draft);
//                 expect(draft.getName()).toBe('APMTmpDraft');
//                 expect(draft.getDirectDeps()).toEqual(new Map());
//                 expect(draft.getSrcDir()).toBe(tmpDir);
//                 expect(draft.getAgdaFiles()).toEqual(['subdir/file1.agda']);
//                 expect(draft.getMdFiles()).toEqual(['subdir/file2.md']);
//             });

//             it('empty deps.txt file and one agda file in doubly-nested directory', () => {
//                 // Create the file
//                 writeFileInside('deps.txt', '');

//                 // Write the agda file
//                 writeFileInside('subdir/subdir2/file.agda', 'myNat : ℕ\nmyNat = 0');

//                 // Load the draft
//                 const draft = Draft.load(tmpDir);

//                 // Expect the draft to be an instance of Draft
//                 expect(draft).toBeInstanceOf(Draft);
//                 expect(draft.getName()).toBe('APMTmpDraft');
//                 expect(draft.getDirectDeps()).toEqual(new Map());
//                 expect(draft.getSrcDir()).toBe(tmpDir);
//                 expect(draft.getAgdaFiles()).toEqual(['subdir/subdir2/file.agda']);
//                 expect(draft.getMdFiles()).toEqual([]);
//             });

//             it('empty deps.txt file and multiple agda files', () => {
//                 // Create the file
//                 writeFileInside('deps.txt', '');

//                 // Write the agda files
//                 writeFileInside('file1.agda', 'myNat : ℕ\nmyNat = 0');
//                 writeFileInside('file2.agda', 'myNat : ℕ\nmyNat = 0');
//                 writeFileInside('file3.agda', 'myNat : ℕ\nmyNat = 0');

//                 // Load the draft
//                 const draft = Draft.load(tmpDir);

//                 // Expect the draft to be an instance of Draft
//                 expect(draft).toBeInstanceOf(Draft);
//                 expect(draft.getName()).toBe('APMTmpDraft');
//                 expect(draft.getDirectDeps()).toEqual(new Map());
//                 expect(draft.getSrcDir()).toBe(tmpDir);
//                 expect(draft.getAgdaFiles().sort()).toEqual(['file1.agda', 'file2.agda', 'file3.agda'].sort());
//                 expect(draft.getMdFiles().sort()).toEqual([]);
//             });

//             it('empty deps.txt file and multiple md files', () => {
//                 // Create the file
//                 writeFileInside('deps.txt', '');

//                 // Write the md files
//                 writeFileInside('file1.md', '# My Document');
//                 writeFileInside('file2.md', '# My Document');
//                 writeFileInside('file3.md', '# My Document');

//                 // Load the draft
//                 const draft = Draft.load(tmpDir);

//                 // Expect the draft to be an instance of Draft
//                 expect(draft).toBeInstanceOf(Draft);
//                 expect(draft.getName()).toBe('APMTmpDraft');
//                 expect(draft.getDirectDeps()).toEqual(new Map());
//                 expect(draft.getSrcDir()).toBe(tmpDir);
//                 expect(draft.getAgdaFiles().sort()).toEqual([]);
//                 expect(draft.getMdFiles().sort()).toEqual(['file1.md', 'file2.md', 'file3.md'].sort());
//             });

//             it('empty deps.txt file and multiple agda files and multiple md files', () => {
//                 // Create the file
//                 writeFileInside('deps.txt', '');

//                 // Write the agda files
//                 writeFileInside('file1.agda', 'myNat : ℕ\nmyNat = 0');
//                 writeFileInside('file2.agda', 'myNat : ℕ\nmyNat = 0');
//                 writeFileInside('file3.agda', 'myNat : ℕ\nmyNat = 0');

//                 // Write the md files
//                 writeFileInside('file1.md', '# My Document');
//                 writeFileInside('file2.md', '# My Document');
//                 writeFileInside('file3.md', '# My Document');

//                 // Load the draft
//                 const draft = Draft.load(tmpDir);

//                 // Expect the draft to be an instance of Draft
//                 expect(draft).toBeInstanceOf(Draft);
//                 expect(draft.getName()).toBe('APMTmpDraft');
//                 expect(draft.getDirectDeps()).toEqual(new Map());
//                 expect(draft.getSrcDir()).toBe(tmpDir);
//                 expect(draft.getAgdaFiles().sort()).toEqual(['file1.agda', 'file2.agda', 'file3.agda'].sort());
//                 expect(draft.getMdFiles().sort()).toEqual(['file1.md', 'file2.md', 'file3.md'].sort());
//             });

//             it('empty deps.txt file and multiple agda files and multiple md files in nested directories', () => {
//                 // Create the file
//                 writeFileInside('deps.txt', '');

//                 // Write the agda files
//                 writeFileInside('subdir1/file1.agda', 'myNat : ℕ\nmyNat = 0');
//                 writeFileInside('subdir1/README.md', '# My Document');
//                 writeFileInside('subdir2/file2.agda', 'myNat : ℕ\nmyNat = 0');
//                 writeFileInside('subdir2/README.md', '# My Document');
//                 writeFileInside('subdir2/subdir3/file3.agda', 'myNat : ℕ\nmyNat = 0');
//                 writeFileInside('subdir2/subdir3/README.md', '# My Document');

//                 // Load the draft
//                 const draft = Draft.load(tmpDir);

//                 // Expect the draft to be an instance of Draft
//                 expect(draft).toBeInstanceOf(Draft);
//                 expect(draft.getName()).toBe('APMTmpDraft');
//                 expect(draft.getDirectDeps()).toEqual(new Map());
//                 expect(draft.getSrcDir()).toBe(tmpDir);
//                 expect(draft.getAgdaFiles().sort()).toEqual(
//                     ['subdir1/file1.agda', 'subdir2/file2.agda', 'subdir2/subdir3/file3.agda'].sort(),
//                 );
//                 expect(draft.getMdFiles().sort()).toEqual(
//                     ['subdir1/README.md', 'subdir2/README.md', 'subdir2/subdir3/README.md'].sort(),
//                 );
//             });

//             it('single package deps.txt file and no source files', () => {
//                 // Create the file
//                 writeFileInside('deps.txt', 'name 1.0.0');

//                 // Load the draft
//                 const draft = Draft.load(tmpDir);

//                 // Expect the draft to be an instance of Draft
//                 expect(draft).toBeInstanceOf(Draft);
//                 expect(draft.getName()).toBe('APMTmpDraft');
//                 expect(draft.getDirectDeps()).toEqual(new Map([['name', '1.0.0']]));
//                 expect(draft.getSrcDir()).toBe(tmpDir);
//                 expect(draft.getAgdaFiles()).toEqual([]);
//                 expect(draft.getMdFiles()).toEqual([]);
//             });

//             it('two package deps.txt file and no source files', () => {
//                 // Create the file
//                 writeFileInside('deps.txt', 'name0 1.0.0\nname1 1.0.1');

//                 // Load the draft
//                 const draft = Draft.load(tmpDir);

//                 // Expect the draft to be an instance of Draft
//                 expect(draft).toBeInstanceOf(Draft);
//                 expect(draft.getName()).toBe('APMTmpDraft');
//                 expect(draft.getDirectDeps()).toEqual(
//                     new Map([
//                         ['name0', '1.0.0'],
//                         ['name1', '1.0.1'],
//                     ]),
//                 );
//                 expect(draft.getSrcDir()).toBe(tmpDir);
//                 expect(draft.getAgdaFiles()).toEqual([]);
//                 expect(draft.getMdFiles()).toEqual([]);
//             });

//             it('two package deps.txt file and one agda file', () => {
//                 // Create the file
//                 writeFileInside('deps.txt', 'name0 1.0.0\nname1 1.0.1');

//                 // Write the agda file
//                 writeFileInside('file.agda', 'myNat : ℕ\nmyNat = 0');

//                 // Load the draft
//                 const draft = Draft.load(tmpDir);

//                 // Expect the draft to be an instance of Draft
//                 expect(draft).toBeInstanceOf(Draft);
//                 expect(draft.getName()).toBe('APMTmpDraft');
//                 expect(draft.getDirectDeps()).toEqual(
//                     new Map([
//                         ['name0', '1.0.0'],
//                         ['name1', '1.0.1'],
//                     ]),
//                 );
//                 expect(draft.getSrcDir()).toBe(tmpDir);
//                 expect(draft.getAgdaFiles()).toEqual(['file.agda']);
//                 expect(draft.getMdFiles()).toEqual([]);
//             });

//             it('two package deps.txt file and one md file', () => {
//                 // Create the file
//                 writeFileInside('deps.txt', 'name0 1.0.0\nname1 1.0.1');

//                 // Write the md file
//                 writeFileInside('file.md', '# My Document');

//                 // Load the draft
//                 const draft = Draft.load(tmpDir);

//                 // Expect the draft to be an instance of Draft
//                 expect(draft).toBeInstanceOf(Draft);
//                 expect(draft.getName()).toBe('APMTmpDraft');
//                 expect(draft.getDirectDeps()).toEqual(
//                     new Map([
//                         ['name0', '1.0.0'],
//                         ['name1', '1.0.1'],
//                     ]),
//                 );
//                 expect(draft.getSrcDir()).toBe(tmpDir);
//                 expect(draft.getAgdaFiles()).toEqual([]);
//                 expect(draft.getMdFiles()).toEqual(['file.md']);
//             });

//             it('two package deps.txt file and one agda file and one md file', () => {
//                 // Create the file
//                 writeFileInside('deps.txt', 'name0 1.0.0\nname1 1.0.1');

//                 // Write the agda file
//                 writeFileInside('file.agda', 'myNat : ℕ\nmyNat = 0');

//                 // Write the md file
//                 writeFileInside('file.md', '# My Document');

//                 // Load the draft
//                 const draft = Draft.load(tmpDir);

//                 // Expect the draft to be an instance of Draft
//                 expect(draft).toBeInstanceOf(Draft);
//                 expect(draft.getName()).toBe('APMTmpDraft');
//                 expect(draft.getDirectDeps()).toEqual(
//                     new Map([
//                         ['name0', '1.0.0'],
//                         ['name1', '1.0.1'],
//                     ]),
//                 );
//                 expect(draft.getSrcDir()).toBe(tmpDir);
//                 expect(draft.getAgdaFiles()).toEqual(['file.agda']);
//                 expect(draft.getMdFiles()).toEqual(['file.md']);
//             });

//             it('many package deps.txt file and multiple agda files', () => {
//                 // Create the file
//                 writeFileInside('deps.txt', 'name0 1.0.0\nname1 1.0.1\nname2 1.0.2\nname3 1.0.3\nname4 1.0.4');

//                 // Write the agda files
//                 writeFileInside('file1.agda', 'myNat : ℕ\nmyNat = 0');
//                 writeFileInside('file2.agda', 'myNat : ℕ\nmyNat = 0');
//                 writeFileInside('file3.agda', 'myNat : ℕ\nmyNat = 0');
//                 writeFileInside('file4.agda', 'myNat : ℕ\nmyNat = 0');
//                 writeFileInside('file5.agda', 'myNat : ℕ\nmyNat = 0');

//                 // Load the draft
//                 const draft = Draft.load(tmpDir);

//                 // Expect the draft to be an instance of Draft
//                 expect(draft).toBeInstanceOf(Draft);
//                 expect(draft.getName()).toBe('APMTmpDraft');
//                 expect(draft.getDirectDeps()).toEqual(
//                     new Map([
//                         ['name0', '1.0.0'],
//                         ['name1', '1.0.1'],
//                         ['name2', '1.0.2'],
//                         ['name3', '1.0.3'],
//                         ['name4', '1.0.4'],
//                     ]),
//                 );
//                 expect(draft.getSrcDir()).toBe(tmpDir);
//                 expect(draft.getAgdaFiles().sort()).toEqual(
//                     ['file1.agda', 'file2.agda', 'file3.agda', 'file4.agda', 'file5.agda'].sort(),
//                 );
//                 expect(draft.getMdFiles().sort()).toEqual([]);
//             });

//             it('many package deps.txt file and multiple agda files in random nested directories', () => {
//                 // Create the file
//                 writeFileInside('deps.txt', 'name0 1.0.0\nname1 1.0.1\nname2 1.0.2\nname3 1.0.3\nname4 1.0.4');

//                 // Write the agda files
//                 writeFileInside('subdir1/file1.agda', 'myNat : ℕ\nmyNat = 0');
//                 writeFileInside('subdir1/subdir2/subdir3/subdir4/file2.agda', 'myNat : ℕ\nmyNat = 0');
//                 writeFileInside('subdir2/file3.agda', 'myNat : ℕ\nmyNat = 0');
//                 writeFileInside('subdir4/file4.agda', 'myNat : ℕ\nmyNat = 0');
//                 writeFileInside('subdir3/file5.agda', 'myNat : ℕ\nmyNat = 0');

//                 // Load the draft
//                 const draft = Draft.load(tmpDir);

//                 // Expect the draft to be an instance of Draft
//                 expect(draft).toBeInstanceOf(Draft);
//                 expect(draft.getName()).toBe('APMTmpDraft');
//                 expect(draft.getDirectDeps()).toEqual(
//                     new Map([
//                         ['name0', '1.0.0'],
//                         ['name1', '1.0.1'],
//                         ['name2', '1.0.2'],
//                         ['name3', '1.0.3'],
//                         ['name4', '1.0.4'],
//                     ]),
//                 );
//                 expect(draft.getSrcDir()).toBe(tmpDir);
//                 expect(draft.getAgdaFiles().sort()).toEqual(
//                     [
//                         'subdir1/file1.agda',
//                         'subdir1/subdir2/subdir3/subdir4/file2.agda',
//                         'subdir2/file3.agda',
//                         'subdir4/file4.agda',
//                         'subdir3/file5.agda',
//                     ].sort(),
//                 );
//                 expect(draft.getMdFiles().sort()).toEqual([]);
//             });
//         });

//         describe('failure cases', () => {
//             const tmpDir = path.join(os.tmpdir(), 'failure-cases');

//             beforeEach(() => {
//                 // Remove the temporary directory if it exists
//                 if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true, force: true });

//                 // Create the temporary directory
//                 fs.mkdirSync(tmpDir, { recursive: true });
//             });

//             it('should throw a DraftLoadError if the path does not exist', () => {
//                 const srcPath = path.join(tmpDir, 'does-not-exist');

//                 expect(() => Draft.load(srcPath)).toThrow(DraftLoadError);
//             });

//             it('should throw a DraftLoadError if the path is not a directory', () => {
//                 const srcPath = path.join(tmpDir, 'not-a-directory');

//                 // Create the file
//                 fs.writeFileSync(srcPath, 'not-a-directory');

//                 // Expect the file to exist
//                 expect(fs.existsSync(srcPath)).toBe(true);

//                 expect(() => Draft.load(srcPath)).toThrow(DraftLoadError);
//             });

//             it('should throw a ReadDepsFileError if the path does not contain a deps.txt file', () => {
//                 const srcPath = path.join(tmpDir, 'no-deps-txt');

//                 // Create the file
//                 fs.mkdirSync(srcPath, { recursive: true });

//                 // Expect the file to exist
//                 expect(fs.existsSync(srcPath)).toBe(true);

//                 expect(() => Draft.load(srcPath)).toThrow(ReadDepsFileError);
//             });

//             it('should throw a ReadDepsFileError if the deps.txt is not a file', () => {
//                 const srcPath = path.join(tmpDir, 'no-deps-txt');
//                 const depsTxtPath = path.join(srcPath, 'deps.txt');

//                 // Create the file
//                 fs.mkdirSync(srcPath, { recursive: true });

//                 // Create the deps.txt folder (yes, this is strange, but it's just for testing)
//                 fs.mkdirSync(depsTxtPath, { recursive: true });

//                 // Expect the folder to exist
//                 expect(fs.existsSync(depsTxtPath)).toBe(true);

//                 expect(() => Draft.load(srcPath)).toThrow(ReadDepsFileError);
//             });

//             it('should throw a FailedToParseDepsError if the deps.txt file is invalid', () => {
//                 const srcPath = path.join(tmpDir, 'invalid-deps-txt');
//                 const depsTxtPath = path.join(srcPath, 'deps.txt');

//                 // Create the file
//                 fs.mkdirSync(srcPath, { recursive: true });

//                 // Create the deps.txt file
//                 fs.writeFileSync(depsTxtPath, 'pkgName');

//                 // Expect the file to exist
//                 expect(fs.existsSync(depsTxtPath)).toBe(true);

//                 expect(() => Draft.load(srcPath)).toThrow(FailedToParseDepsError);
//             });
//         });
//     });

//     describe('Draft.create()', () => {
//         const packDir = path.join(os.tmpdir(), 'apm-pack');
//         const extractDir = path.join(os.tmpdir(), 'apm-extract');

//         beforeEach(() => {
//             // Remove the temporary directory if it exists
//             if (fs.existsSync(packDir)) fs.rmSync(packDir, { recursive: true, force: true });
//             if (fs.existsSync(extractDir)) fs.rmSync(extractDir, { recursive: true, force: true });

//             // Create the temporary directory
//             fs.mkdirSync(packDir, { recursive: true });
//             fs.mkdirSync(extractDir, { recursive: true });
//         });

//         const writeFileInside = (relPath: string, content: string) => {
//             // Write the file inside the temporary directory
//             const filePath = path.join(packDir, relPath);
//             fs.mkdirSync(path.dirname(filePath), { recursive: true });
//             fs.writeFileSync(filePath, content);
//         };

//         const writeFilesInside = (entries: Map<string, string>) => {
//             for (const [relPath, content] of entries) writeFileInside(relPath, content);
//         };

//         const assertFileInside = (relPath: string, content: string) => {
//             const filePath = path.join(extractDir, relPath);
//             expect(fs.existsSync(filePath)).toBe(true);
//             expect(fs.readFileSync(filePath, 'utf8')).toBe(content);
//         };

//         const assertFilesPresent = (name: string, entries: Map<string, string>) => {
//             for (const [relPath, content] of entries) assertFileInside(path.join(name, relPath), content);
//         };

//         describe('success cases', () => {
//             // JUST TO DOCUMENT THIS BRIEFLY:
//             //
//             // The genericTest function is used to test the Draft.create() function.
//             // It writes the files to packDir (does not have the basename of the package), creates the tar, and then
//             // creates the draft in extractDir/packageName, which is why we must prefix all the relPaths with the package name.
//             const genericTest = async (
//                 name: string,
//                 deps: Map<string, string>,
//                 agdaFiles: Map<string, string>,
//                 mdFiles: Map<string, string>,
//             ) => {
//                 // Get the debugger
//                 const dbg = debug('apm:common:tests:models:Draft:create');

//                 // Write all files
//                 writeFilesInside(agdaFiles);
//                 writeFilesInside(mdFiles);

//                 // Get the file names contained list
//                 const fileNames = [...agdaFiles.keys(), ...mdFiles.keys()];

//                 // Create the tar using the original file names
//                 const tar = await (Package as any).packTar(packDir, fileNames);

//                 // Create the output directory
//                 const outDir = path.join(extractDir, name);

//                 // Create the draft
//                 const draft = await Draft.create(outDir, name, deps, tar);

//                 // Glob literally all files in the output directory
//                 const files = glob.sync('**/*', { cwd: extractDir, nodir: true });
//                 dbg(`Output Files: ${files}`);

//                 // sleep for 15 seconds
//                 // await new Promise((resolve) => setTimeout(resolve, 15000));

//                 // Expect the draft to be an instance of Draft
//                 expect(draft).toBeInstanceOf(Draft);
//                 expect(draft.getName()).toBe(name);
//                 expect(draft.getDirectDeps()).toEqual(deps);
//                 expect(draft.getSrcDir()).toBe(outDir);

//                 // Assert the files are loaded correctly (should use original file names)
//                 expect(draft.getAgdaFiles().sort()).toEqual(Array.from(agdaFiles.keys()).sort());
//                 expect(draft.getMdFiles().sort()).toEqual(Array.from(mdFiles.keys()).sort());

//                 // Assert the files are present INSIDE THE OUTPUT DRAFT DIRECTORY
//                 assertFilesPresent(name, agdaFiles);
//                 assertFilesPresent(name, mdFiles);

//                 // Construct the expected deps.txt file content
//                 let expectedDepsContent = '';
//                 for (const [name, version] of deps.entries()) expectedDepsContent += `${name} ${version}\n`;

//                 assertFilesPresent(name, new Map([['deps.txt', expectedDepsContent]]));

//                 // Print the actual deps.txt file content
//                 const actualDepsContent = fs.readFileSync(path.join(outDir, 'deps.txt'), 'utf8');
//                 dbg(`Actual Deps Content: ${actualDepsContent}`);
//             };

//             it('small name, no dependencies, no files', async () => {
//                 // Create the files map
//                 const name = 'Calculus';
//                 const deps: Map<string, string> = new Map();
//                 const agdaFiles: Map<string, string> = new Map();
//                 const mdFiles: Map<string, string> = new Map();

//                 // Run the generic test
//                 await genericTest(name, deps, agdaFiles, mdFiles);
//             });

//             it('small name, 1 dependency, no files', async () => {
//                 // Create the files map
//                 const name = 'Calculus';
//                 const deps: Map<string, string> = new Map([['dep0', '1.0.0']]);
//                 const agdaFiles: Map<string, string> = new Map();
//                 const mdFiles: Map<string, string> = new Map();

//                 // Run the generic test
//                 await genericTest(name, deps, agdaFiles, mdFiles);
//             });

//             it('small name, 0 dependencies, 1 agda file', async () => {
//                 // Create the files map
//                 const name = 'Calculus';
//                 const deps: Map<string, string> = new Map();
//                 const agdaFiles: Map<string, string> = new Map([['file.agda', 'myNat : ℕ\nmyNat = 0']]);
//                 const mdFiles: Map<string, string> = new Map();

//                 // Run the generic test
//                 await genericTest(name, deps, agdaFiles, mdFiles);
//             });

//             it('small name, 0 dependencies, 1 md file', async () => {
//                 // Create the files map
//                 const name = 'Calculus';
//                 const deps: Map<string, string> = new Map();
//                 const agdaFiles: Map<string, string> = new Map();
//                 const mdFiles: Map<string, string> = new Map([['file.md', '# Hello, World!']]);

//                 // Run the generic test
//                 await genericTest(name, deps, agdaFiles, mdFiles);
//             });

//             it('small name, 1 dependency, 1 agda file', async () => {
//                 // Create the files map
//                 const name = 'WorldLeaders';
//                 const deps: Map<string, string> = new Map([['dep0', '1.0.0']]);
//                 const agdaFiles: Map<string, string> = new Map([['file.agda', 'myNat : ℕ\nmyNat = 0']]);
//                 const mdFiles: Map<string, string> = new Map();

//                 // Run the generic test
//                 await genericTest(name, deps, agdaFiles, mdFiles);
//             });

//             it('small name, 1 dependency, 1 agda file, 1 md file, 1 subdir', async () => {
//                 // Create the files map
//                 const name = 'JurrasicPark';
//                 const deps: Map<string, string> = new Map([['dep0', '1.0.0']]);
//                 const agdaFiles: Map<string, string> = new Map([['subdir/file.agda', 'myNat : ℕ\nmyNat = 0']]);
//                 const mdFiles: Map<string, string> = new Map([['file.md', '# Hello, World!']]);

//                 // Run the generic test
//                 await genericTest(name, deps, agdaFiles, mdFiles);
//             });

//             it('small name, 3 dependencies, 1 agda file, 1 md file', async () => {
//                 // Create the files map
//                 const name = 'WorldLeaders';
//                 const deps: Map<string, string> = new Map([
//                     ['dep0', '1.0.0'],
//                     ['dep1', '1.0.1'],
//                     ['dep2', '1.0.2'],
//                 ]);
//                 const agdaFiles: Map<string, string> = new Map([['file.agda', 'myNat : ℕ\nmyNat = 0']]);
//                 const mdFiles: Map<string, string> = new Map([['file.md', '# Hello, World!']]);

//                 // Run the generic test
//                 await genericTest(name, deps, agdaFiles, mdFiles);
//             });

//             it('small name, 3 dependencies, 5 agda files, 1 md file, 2 subdirs with many nested subdirs', async () => {
//                 // Create the files map
//                 const name = 'WorldLeaders';
//                 const deps: Map<string, string> = new Map([
//                     ['dep0', '1.0.0'],
//                     ['dep1', '1.0.1'],
//                     ['dep2', '1.0.2'],
//                 ]);
//                 const agdaFiles: Map<string, string> = new Map([
//                     ['subdir1/file1.agda', 'myNat : ℕ\nmyNat = 0'],
//                     ['subdir2/file2.agda', 'myNat : ℕ\nmyNat = 0'],
//                     ['subdir1/subdir3/file3.agda', 'myNat : ℕ\nmyNat = 0'],
//                     ['subdir1/subdir4/file4.agda', 'myNat : ℕ\nmyNat = 0'],
//                     ['subdir2/subdir5/file5.agda', 'myNat : ℕ\nmyNat = 0'],
//                 ]);
//                 const mdFiles: Map<string, string> = new Map([['file.md', '# Hello, World!']]);

//                 // Run the generic test
//                 await genericTest(name, deps, agdaFiles, mdFiles);
//             });

//             it('small name, 4 dependencies, 15 agda files, 5 md files, 5 subdirs with 1 md file each', async () => {
//                 // Create the files map
//                 const name = 'WorldLeaders';
//                 const deps: Map<string, string> = new Map([
//                     ['dep0', '1.0.0'],
//                     ['dep1', '1.0.1'],
//                     ['dep2', '1.0.2'],
//                     ['dep3', '1.0.3'],
//                 ]);
//                 const agdaFiles: Map<string, string> = new Map([
//                     ['subdir1/file1.agda', 'myNat : ℕ\nmyNat = 0'],
//                     ['subdir1/file2.agda', 'myNat : ℕ\nmyNat = 0'],
//                     ['subdir1/file3.agda', 'myNat : ℕ\nmyNat = 0'],
//                     ['subdir2/file4.agda', 'myNat : ℕ\nmyNat = 0'],
//                     ['subdir2/file5.agda', 'myNat : ℕ\nmyNat = 0'],
//                     ['subdir2/file6.agda', 'myNat : ℕ\nmyNat = 0'],
//                     ['subdir3/file7.agda', 'myNat : ℕ\nmyNat = 0'],
//                     ['subdir3/file8.agda', 'myNat : ℕ\nmyNat = 0'],
//                     ['subdir3/file9.agda', 'myNat : ℕ\nmyNat = 0'],
//                     ['subdir4/file10.agda', 'myNat : ℕ\nmyNat = 0'],
//                     ['subdir4/file11.agda', 'myNat : ℕ\nmyNat = 0'],
//                     ['subdir4/file12.agda', 'myNat : ℕ\nmyNat = 0'],
//                     ['subdir5/file13.agda', 'myNat : ℕ\nmyNat = 0'],
//                     ['subdir5/file14.agda', 'myNat : ℕ\nmyNat = 0'],
//                     ['subdir5/file15.agda', 'myNat : ℕ\nmyNat = 0'],
//                 ]);
//                 const mdFiles: Map<string, string> = new Map([
//                     ['subdir1/file1.md', '# dir1!'],
//                     ['subdir2/file2.md', '# dir2!'],
//                     ['subdir3/file3.md', '# dir3!'],
//                     ['subdir4/file4.md', '# dir4!'],
//                     ['subdir5/file5.md', '# dir5!'],
//                 ]);

//                 // Run the generic test
//                 await genericTest(name, deps, agdaFiles, mdFiles);
//             });
//         });

//         describe('failure cases', () => {
//             it('throws DraftCreateError if the directory already exists', async () => {
//                 const pkgName = 'Calculus';
//                 const deps = new Map([
//                     ['dep0', '1.0.0'],
//                     ['dep1', '1.0.1'],
//                     ['dep2', '1.0.2'],
//                 ]);
//                 const payload = Buffer.from([]);

//                 // Compute the draft path
//                 const draftPath = path.join(extractDir, pkgName);

//                 // Create the directory
//                 fs.mkdirSync(draftPath, { recursive: true });

//                 // Create the package and expect it to throw a DraftCreateError
//                 await expect((Draft as any).create(pkgName, deps, payload, draftPath)).rejects.toThrow(
//                     DraftCreateError,
//                 );
//             });

//             it('throws DraftCreateError if the directory name does not match the package name', async () => {
//                 const pkgName = 'Calculus';
//                 const deps = new Map([
//                     ['dep0', '1.0.0'],
//                     ['dep1', '1.0.1'],
//                     ['dep2', '1.0.2'],
//                 ]);
//                 const payload = Buffer.from([]);

//                 // Compute the draft path
//                 const draftPath = path.join(extractDir, 'DifferentName');

//                 // Create the package and expect it to throw a DraftCreateError
//                 await expect((Draft as any).create(pkgName, deps, payload, draftPath)).rejects.toThrow(
//                     DraftCreateError,
//                 );
//             });
//         });
//     });
// });
