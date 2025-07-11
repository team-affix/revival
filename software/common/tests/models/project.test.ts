import path from 'path';
import fs from 'fs';
import os from 'os';
import { expect, describe, it, beforeEach, beforeAll } from '@jest/globals';
import { __test__ as ProjectTest, Project } from '../../src/models/project';
import { glob } from 'glob';
import FailedToParseDepsError from '../../src/errors/failed-to-parse-deps';
import ReadDepsFileError from '../../src/errors/read-deps-file';
import WriteDepsFileError from '../../src/errors/write-deps-file';
import ProjectLoadError from '../../src/errors/project-load';
import SourceLoadError from '../../src/errors/source-load';
import ProjectInitError from '../../src/errors/project-init';
import { Package } from '../../src/models/package';
import { Source } from '../../src/models/source';
import { Readable } from 'stream';
import CheckProjectError from '../../src/errors/check-project';

describe('models/Project', () => {
    describe('parseDirectDeps()', () => {
        describe('success cases', () => {
            it('should parse as an empty map if the string is empty', () => {
                const raw = '';
                const deps = ProjectTest.parseDirectDeps(raw);
                expect(deps).toEqual(new Map());
            });

            it('should parse correctly with one dependency', () => {
                const raw = 'dep0 ver0';
                const deps = ProjectTest.parseDirectDeps(raw);
                expect(deps).toEqual(new Map([['dep0', 'ver0']]));
            });

            it('should parse correctly with two dependencies', () => {
                const raw = 'dep0 ver0\ndep1 ver1';
                const deps = ProjectTest.parseDirectDeps(raw);
                expect(deps).toEqual(
                    new Map([
                        ['dep0', 'ver0'],
                        ['dep1', 'ver1'],
                    ]),
                );
            });

            it('should parse correctly with many dependencies', () => {
                const raw = 'dep0 ver0\ndep1 ver1\ndep2 ver2\ndep3 ver3\ndep4 ver4\ndep5 ver5';
                const deps = ProjectTest.parseDirectDeps(raw);
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
                const deps = ProjectTest.parseDirectDeps(raw);
                expect(deps).toEqual(
                    new Map([
                        ['dep0', 'ver0'],
                        ['dep1', 'ver1'],
                    ]),
                );
            });

            it('should successfully parse if the string contains any redundant newlines', () => {
                const raw = 'dep0 ver0\n\n\ndep1 ver1\n\n\n\ndep2 ver2\n\n\n';
                const deps = ProjectTest.parseDirectDeps(raw);
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
                expect(() => ProjectTest.parseDirectDeps(raw)).toThrow(FailedToParseDepsError);
            });

            it('should throw a FailedToParseDepsError if the string contains any invalid dependencies', () => {
                const raw = 'dep0 ver0\ndep1';
                expect(() => ProjectTest.parseDirectDeps(raw)).toThrow(FailedToParseDepsError);
            });

            it('should throw a FailedToParseDepsError if the string contains only duplicate dependencies', () => {
                const raw = 'dep0 ver0\ndep0 ver1';
                expect(() => ProjectTest.parseDirectDeps(raw)).toThrow(FailedToParseDepsError);
            });

            it('should throw a FailedToParseDepsError if the string contains any duplicate dependencies', () => {
                const raw = 'dep0 ver0\ndep1 ver1\ndep0 ver2';
                expect(() => ProjectTest.parseDirectDeps(raw)).toThrow(FailedToParseDepsError);
            });

            it('should throw a FailedToParseDepsError if the string contains a single line with more than two parts', () => {
                const raw = 'dep0 ver0 etc\n';
                expect(() => ProjectTest.parseDirectDeps(raw)).toThrow(FailedToParseDepsError);
            });

            it('should throw a FailedToParseDepsError if the string contains any lines with more than two parts', () => {
                const raw = 'dep0 ver0\ndep1 ver1\ndep2 ver2 etc\ndep3 ver3';
                expect(() => ProjectTest.parseDirectDeps(raw)).toThrow(FailedToParseDepsError);
            });

            it('should throw a FailedToParseDepsError if the only line starts with a space', () => {
                const raw = ' dep0 ver0';
                expect(() => ProjectTest.parseDirectDeps(raw)).toThrow(FailedToParseDepsError);
            });

            it('should throw a FailedToParseDepsError if any lines start with a space', () => {
                const raw = 'dep0 ver0\n dep1 ver1\ndep2 ver2';
                expect(() => ProjectTest.parseDirectDeps(raw)).toThrow(FailedToParseDepsError);
            });
        });
    });

    describe('readDirectDepsFile()', () => {
        const tmpDir = path.join(os.tmpdir(), 'apm-test-read-deps-file');
        const depsPath = path.join(tmpDir, 'deps.txt');

        beforeEach(() => {
            // Remove the directory if it exists
            if (fs.existsSync(tmpDir)) fs.rmdirSync(tmpDir, { recursive: true });
            // Create a directory
            fs.mkdirSync(tmpDir);
        });

        describe('success cases', () => {
            it('empty dependencies file', () => {
                // Write the empty dependencies file
                fs.writeFileSync(depsPath, '');

                // Read the dependencies file
                const deps = ProjectTest.readDirectDepsFile(tmpDir);
                expect(deps).toEqual(new Map());
            });

            it('one dependency', () => {
                // Write the dependencies file
                fs.writeFileSync(depsPath, 'dep0 ver0');

                // Read the dependencies file
                const deps = ProjectTest.readDirectDepsFile(tmpDir);
                expect(deps).toEqual(new Map([['dep0', 'ver0']]));
            });

            it('many dependencies', () => {
                // Write the dependencies file
                fs.writeFileSync(depsPath, 'dep0 ver0\ndep1 ver1\ndep2 ver2');

                // Read the dependencies file
                const deps = ProjectTest.readDirectDepsFile(tmpDir);
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
            it('should throw a ReadDepsFileError if the file does not exist', () => {
                expect(() => ProjectTest.readDirectDepsFile(tmpDir)).toThrow(ReadDepsFileError);
            });

            it('should throw a ReadDepsFileError if the file is not a file', () => {
                // Create deps.txt folder
                fs.mkdirSync(depsPath);
                expect(() => ProjectTest.readDirectDepsFile(tmpDir)).toThrow(ReadDepsFileError);
            });

            it('should throw a FailedToParseDepsError if the file is not valid', () => {
                // Write the dependencies file
                fs.writeFileSync(depsPath, 'pkgName');

                // Read the dependencies file
                expect(() => ProjectTest.readDirectDepsFile(tmpDir)).toThrow(FailedToParseDepsError);
            });
        });
    });

    describe('writeDirectDepsFile()', () => {
        const tmpDir = path.join(os.tmpdir(), 'apm-test-write-deps-file');
        const depsPath = path.join(tmpDir, 'deps.txt');

        describe('success cases', () => {
            beforeEach(async () => {
                // Remove the directory if it exists
                if (fs.existsSync(tmpDir)) fs.rmdirSync(tmpDir, { recursive: true });
                // Create a directory
                fs.mkdirSync(tmpDir);
                // sleep for 15 seconds
                // await new Promise((resolve) => setTimeout(resolve, 15000));
            });

            it('empty dependencies file', async () => {
                // Construct the dependencies
                const deps = new Map();

                // Write the empty dependencies file
                await ProjectTest.writeDirectDepsFile(tmpDir, deps);

                // Read the dependencies file
                const depsRaw = fs.readFileSync(depsPath, 'utf8');

                // Check the result
                expect(depsRaw).toBe('');
            });

            it('one dependency', async () => {
                // Construct the dependencies
                const deps = new Map([['dep0', 'ver0']]);

                // Write the dependencies file
                await ProjectTest.writeDirectDepsFile(tmpDir, deps);

                // Read the dependencies file
                const depsRaw = fs.readFileSync(depsPath, 'utf8');

                // Check the result
                expect(depsRaw).toBe('dep0 ver0\n');
            });

            it('many dependencies', async () => {
                // Construct the dependencies
                const deps = new Map([
                    ['dep0', 'ver0'],
                    ['dep1', 'ver1'],
                    ['dep2', 'ver2'],
                ]);

                // Write the dependencies file
                await ProjectTest.writeDirectDepsFile(tmpDir, deps);

                // Read the dependencies file
                const depsRaw = fs.readFileSync(depsPath, 'utf8');

                // Check the result
                expect(depsRaw).toBe('dep0 ver0\ndep1 ver1\ndep2 ver2\n');
            });
        });

        describe('failure cases', () => {
            it('should throw a WriteDepsFileError if the directory does not exist', () => {
                // Remove the directory if it exists
                if (fs.existsSync(tmpDir)) fs.rmdirSync(tmpDir, { recursive: true });

                // Expect rejection
                expect(async () => await ProjectTest.writeDirectDepsFile(tmpDir, new Map())).rejects.toThrow(
                    WriteDepsFileError,
                );
            });

            it('should throw a WriteDepsFileError if the file already exists', () => {
                // Create the directory
                fs.mkdirSync(tmpDir);

                // Create the file
                fs.writeFileSync(depsPath, 'dep0 ver0');

                // Expect rejection
                expect(async () => await ProjectTest.writeDirectDepsFile(tmpDir, new Map())).rejects.toThrow(
                    WriteDepsFileError,
                );
            });
        });

        // it('should read the direct dependencies file correctly', () => {
        //     const deps = (Package as any).readDirectDepsFile(
        //         path.join(__dirname, '..', '..', '..', '..', 'test-data', 'deps.txt'),
        //     );
        //     expect(deps).toEqual(
        //         new Map([
        //             ['dep0', 'ver0'],
        //             ['dep1', 'ver1'],
        //         ]),
        //     );
        // });
    });

    describe('createAgdaLibFile()', () => {
        const tmpDir = path.join(os.tmpdir(), 'apm-test-create-agda-lib-file');

        beforeEach(() => {
            // Remove the temporary directory if it exists
            if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true, force: true });

            // Create the temporary directory
            fs.mkdirSync(tmpDir, { recursive: true });
        });

        describe('success cases', () => {
            it('should create the .agda-lib file', () => {
                ProjectTest.createAgdaLibFile(tmpDir, 'APMTmpProject');
                const agdaLibPath = path.join(tmpDir, '.agda-lib');
                const agdaLibContent = fs.readFileSync(agdaLibPath, 'utf8');
                expect(fs.existsSync(agdaLibPath)).toBe(true);
                expect(agdaLibContent).toBe('name: APMTmpProject\ninclude: . deps');
            });
        });

        describe('failure cases', () => {
            it('should throw a ProjectInitError if the path does not exist', () => {
                const invalidPath = path.join(tmpDir, 'does-not-exist');
                expect(() => ProjectTest.createAgdaLibFile(invalidPath, 'APMTmpProject')).toThrow(ProjectInitError);
            });

            it('should throw a ProjectInitError if the path is not a directory', () => {
                const invalidPath = path.join(tmpDir, 'not-a-directory');
                fs.writeFileSync(invalidPath, 'not-a-directory');
                expect(() => ProjectTest.createAgdaLibFile(invalidPath, 'APMTmpProject')).toThrow(ProjectInitError);
            });
        });
    });

    describe('readProjectName()', () => {
        const tmpDir = path.join(os.tmpdir(), 'apm-test-read-project-name');

        beforeEach(() => {
            // Remove the temporary directory if it exists
            if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true, force: true });

            // Create the temporary directory
            fs.mkdirSync(tmpDir, { recursive: true });
        });

        describe('success cases', () => {
            it('should read the project name from the .agda-lib file', () => {
                const projectName = 'APMTmpProject';
                const agdaLibPath = path.join(tmpDir, '.agda-lib');
                fs.writeFileSync(agdaLibPath, `name: ${projectName}\ninclude: . deps`);
                const recoveredProjectName = ProjectTest.readProjectName(tmpDir);
                expect(recoveredProjectName).toBe(projectName);
            });
        });

        describe('failure cases', () => {
            it('should throw a ProjectLoadError if the .agda-lib file does not exist', () => {
                const agdaLibPath = path.join(tmpDir, '.agda-lib');
                expect(() => ProjectTest.readProjectName(tmpDir)).toThrow(ProjectLoadError);
            });

            it('should throw a ProjectLoadError if the .agda-lib file is not a file', () => {
                const agdaLibPath = path.join(tmpDir, '.agda-lib');
                fs.mkdirSync(agdaLibPath);
                expect(() => ProjectTest.readProjectName(tmpDir)).toThrow(ProjectLoadError);
            });

            it('should throw a ProjectLoadError if the .agda-lib file is missing a name line', () => {
                const agdaLibPath = path.join(tmpDir, '.agda-lib');
                fs.writeFileSync(agdaLibPath, 'include: . deps');
                expect(() => ProjectTest.readProjectName(tmpDir)).toThrow(ProjectLoadError);
            });

            it('should throw a ProjectLoadError if the .agda-lib file is missing the actual project name', () => {
                const agdaLibPath = path.join(tmpDir, '.agda-lib');
                fs.writeFileSync(agdaLibPath, 'name:\ninclude: . deps');
                expect(() => ProjectTest.readProjectName(tmpDir)).toThrow(ProjectLoadError);
            });
        });
    });

    // PUBLIC INTERFACE TESTS
    describe('Project.load()', () => {
        describe('success cases', () => {
            const projectName = 'APMTmpProject';
            const tmpDir = path.join(os.tmpdir(), projectName);

            const writeFileInside = (relPath: string, content: string) => {
                const filePath = path.join(tmpDir, relPath);
                fs.mkdirSync(path.dirname(filePath), { recursive: true });
                fs.writeFileSync(filePath, content);
            };

            const createRootSource = (files: Map<string, string>) => {
                const rootSourceDir = path.join(tmpDir, projectName);
                // Create the dir if it doesnt exist
                if (!fs.existsSync(rootSourceDir)) fs.mkdirSync(rootSourceDir, { recursive: true });
                // Create the files
                for (const [relPath, content] of files.entries()) {
                    writeFileInside(path.join(projectName, relPath), content);
                }
            };

            beforeEach(() => {
                // Remove the temporary directory if it exists
                if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true, force: true });

                // Create the temporary directory
                fs.mkdirSync(tmpDir, { recursive: true });
            });

            it('empty deps.txt file and no source files', async () => {
                // Create the deps file
                await ProjectTest.writeDirectDepsFile(tmpDir, new Map());

                // Create the .agda-lib file
                ProjectTest.createAgdaLibFile(tmpDir, projectName);

                // Create the root source
                createRootSource(new Map());

                // Load the project
                const project = await Project.load(tmpDir);

                // Expect the project to be an instance of Project
                expect(project).toBeInstanceOf(Project);
                expect(project.name).toBe('APMTmpProject');
                expect(project.directDeps).toEqual(new Map());
                expect(project.cwd).toBe(tmpDir);
                expect(project.rootSource.agdaFiles).toEqual([]);
                expect(project.rootSource.mdFiles).toEqual([]);
            });

            it('empty deps.txt file and one dirt file (.txt)', async () => {
                // Create the deps file
                await ProjectTest.writeDirectDepsFile(tmpDir, new Map());

                // Create the .agda-lib file
                ProjectTest.createAgdaLibFile(tmpDir, projectName);

                // Create the root source
                createRootSource(new Map([['file.txt', 'Hello, world!']]));

                // Load the project
                const project = await Project.load(tmpDir);

                // Expect the project to be an instance of Project
                expect(project).toBeInstanceOf(Project);
                expect(project.name).toBe('APMTmpProject');
                expect(project.directDeps).toEqual(new Map());
                expect(project.cwd).toBe(tmpDir);
                expect(project.rootSource.agdaFiles).toEqual([]);
                expect(project.rootSource.mdFiles).toEqual([]);
            });

            it('empty deps.txt file and one agda file', async () => {
                // Create the deps file
                await ProjectTest.writeDirectDepsFile(tmpDir, new Map());

                // Create the .agda-lib file
                ProjectTest.createAgdaLibFile(tmpDir, projectName);

                // Create the root source
                createRootSource(new Map([['file.agda', 'myNat : ℕ\nmyNat = 0']]));

                // Load the project
                const project = await Project.load(tmpDir);

                // Expect the project to be an instance of Project
                expect(project).toBeInstanceOf(Project);
                expect(project.name).toBe('APMTmpProject');
                expect(project.directDeps).toEqual(new Map());
                expect(project.cwd).toBe(tmpDir);
                expect(project.rootSource.agdaFiles).toEqual(['file.agda']);
                expect(project.rootSource.mdFiles).toEqual([]);
            });

            it('empty deps.txt file and one md file', async () => {
                // Create the deps file
                await ProjectTest.writeDirectDepsFile(tmpDir, new Map());

                // Create the .agda-lib file
                ProjectTest.createAgdaLibFile(tmpDir, projectName);

                // Create the root source
                createRootSource(new Map([['file.md', '# My Document']]));

                // Load the project
                const project = await Project.load(tmpDir);

                // Expect the project to be an instance of Project
                expect(project).toBeInstanceOf(Project);
                expect(project.name).toBe('APMTmpProject');
                expect(project.directDeps).toEqual(new Map());
                expect(project.cwd).toBe(tmpDir);
                expect(project.rootSource.agdaFiles).toEqual([]);
                expect(project.rootSource.mdFiles).toEqual(['file.md']);
            });

            it('empty deps.txt file and one agda file and one md file', async () => {
                // Create the deps file
                await ProjectTest.writeDirectDepsFile(tmpDir, new Map());

                // Create the .agda-lib file
                ProjectTest.createAgdaLibFile(tmpDir, projectName);

                // Create the root source
                createRootSource(
                    new Map([
                        ['file.agda', 'myNat : ℕ\nmyNat = 0'],
                        ['file.md', '# My Document'],
                    ]),
                );

                // Load the project
                const project = await Project.load(tmpDir);

                // Expect the project to be an instance of Project
                expect(project).toBeInstanceOf(Project);
                expect(project.name).toBe('APMTmpProject');
                expect(project.directDeps).toEqual(new Map());
                expect(project.cwd).toBe(tmpDir);
                expect(project.rootSource.agdaFiles).toEqual(['file.agda']);
                expect(project.rootSource.mdFiles).toEqual(['file.md']);
            });

            it('empty deps.txt file and one agda file in nested directory', async () => {
                // Create the deps file
                await ProjectTest.writeDirectDepsFile(tmpDir, new Map());

                // Create the .agda-lib file
                ProjectTest.createAgdaLibFile(tmpDir, projectName);

                // Create the root source
                createRootSource(new Map([['subdir/file.agda', 'myNat : ℕ\nmyNat = 0']]));

                // Load the project
                const project = await Project.load(tmpDir);

                // Expect the project to be an instance of Project
                expect(project).toBeInstanceOf(Project);
                expect(project.name).toBe('APMTmpProject');
                expect(project.directDeps).toEqual(new Map());
                expect(project.cwd).toBe(tmpDir);
                expect(project.rootSource.agdaFiles).toEqual(['subdir/file.agda']);
                expect(project.rootSource.mdFiles).toEqual([]);
            });

            it('empty deps.txt file and one md file in nested directory', async () => {
                // Create the deps file
                await ProjectTest.writeDirectDepsFile(tmpDir, new Map());

                // Create the .agda-lib file
                ProjectTest.createAgdaLibFile(tmpDir, projectName);

                // Create the root source
                createRootSource(new Map([['subdir/file.md', '# My Document']]));

                // Load the project
                const project = await Project.load(tmpDir);

                // Expect the project to be an instance of Project
                expect(project).toBeInstanceOf(Project);
                expect(project.name).toBe('APMTmpProject');
                expect(project.directDeps).toEqual(new Map());
                expect(project.cwd).toBe(tmpDir);
                expect(project.rootSource.agdaFiles).toEqual([]);
                expect(project.rootSource.mdFiles).toEqual(['subdir/file.md']);
            });

            it('empty deps.txt file and one agda file and one md file in nested directory', async () => {
                // Create the deps file
                await ProjectTest.writeDirectDepsFile(tmpDir, new Map());

                // Create the .agda-lib file
                ProjectTest.createAgdaLibFile(tmpDir, projectName);

                // Create the root source
                createRootSource(
                    new Map([
                        ['subdir/file1.agda', 'myNat : ℕ\nmyNat = 0'],
                        ['subdir/file2.md', '# My Document'],
                    ]),
                );

                // Load the project
                const project = await Project.load(tmpDir);

                // Expect the project to be an instance of Project
                expect(project).toBeInstanceOf(Project);
                expect(project.name).toBe('APMTmpProject');
                expect(project.directDeps).toEqual(new Map());
                expect(project.cwd).toBe(tmpDir);
                expect(project.rootSource.agdaFiles).toEqual(['subdir/file1.agda']);
                expect(project.rootSource.mdFiles).toEqual(['subdir/file2.md']);
            });

            it('empty deps.txt file and one agda file in doubly-nested directory', async () => {
                // Create the deps file
                await ProjectTest.writeDirectDepsFile(tmpDir, new Map());

                // Create the .agda-lib file
                ProjectTest.createAgdaLibFile(tmpDir, projectName);

                // Create the root source
                createRootSource(new Map([['subdir/subdir2/file.agda', 'myNat : ℕ\nmyNat = 0']]));

                // Load the project
                const project = await Project.load(tmpDir);

                // Expect the project to be an instance of Project
                expect(project).toBeInstanceOf(Project);
                expect(project.name).toBe('APMTmpProject');
                expect(project.directDeps).toEqual(new Map());
                expect(project.cwd).toBe(tmpDir);
                expect(project.rootSource.agdaFiles).toEqual(['subdir/subdir2/file.agda']);
                expect(project.rootSource.mdFiles).toEqual([]);
            });

            it('empty deps.txt file and multiple agda files', async () => {
                // Create the deps file
                await ProjectTest.writeDirectDepsFile(tmpDir, new Map());

                // Create the .agda-lib file
                ProjectTest.createAgdaLibFile(tmpDir, projectName);

                // Create the root source
                createRootSource(
                    new Map([
                        ['file1.agda', 'myNat : ℕ\nmyNat = 0'],
                        ['file2.agda', 'myNat : ℕ\nmyNat = 0'],
                        ['file3.agda', 'myNat : ℕ\nmyNat = 0'],
                    ]),
                );

                // Load the project
                const project = await Project.load(tmpDir);

                // Expect the project to be an instance of Project
                expect(project).toBeInstanceOf(Project);
                expect(project.name).toBe('APMTmpProject');
                expect(project.directDeps).toEqual(new Map());
                expect(project.cwd).toBe(tmpDir);
                expect(project.rootSource.agdaFiles.sort()).toEqual(['file1.agda', 'file2.agda', 'file3.agda'].sort());
                expect(project.rootSource.mdFiles.sort()).toEqual([]);
            });

            it('empty deps.txt file and multiple md files', async () => {
                // Create the deps file
                await ProjectTest.writeDirectDepsFile(tmpDir, new Map());

                // Create the .agda-lib file
                ProjectTest.createAgdaLibFile(tmpDir, projectName);

                // Create the root source
                createRootSource(
                    new Map([
                        ['file1.md', '# My Document'],
                        ['file2.md', '# My Document'],
                        ['file3.md', '# My Document'],
                    ]),
                );

                // Load the project
                const project = await Project.load(tmpDir);

                // Expect the project to be an instance of Project
                expect(project).toBeInstanceOf(Project);
                expect(project.name).toBe('APMTmpProject');
                expect(project.directDeps).toEqual(new Map());
                expect(project.cwd).toBe(tmpDir);
                expect(project.rootSource.agdaFiles.sort()).toEqual([]);
                expect(project.rootSource.mdFiles.sort()).toEqual(['file1.md', 'file2.md', 'file3.md'].sort());
            });

            it('empty deps.txt file and multiple agda files and multiple md files', async () => {
                // Create the deps file
                await ProjectTest.writeDirectDepsFile(tmpDir, new Map());

                // Create the .agda-lib file
                ProjectTest.createAgdaLibFile(tmpDir, projectName);

                // Create the root source
                createRootSource(
                    new Map([
                        ['file1.agda', 'myNat : ℕ\nmyNat = 0'],
                        ['file2.agda', 'myNat : ℕ\nmyNat = 0'],
                        ['file3.agda', 'myNat : ℕ\nmyNat = 0'],
                        ['file1.md', '# My Document'],
                        ['file2.md', '# My Document'],
                        ['file3.md', '# My Document'],
                    ]),
                );

                // Load the project
                const project = await Project.load(tmpDir);

                // Expect the project to be an instance of Project
                expect(project).toBeInstanceOf(Project);
                expect(project.name).toBe('APMTmpProject');
                expect(project.directDeps).toEqual(new Map());
                expect(project.cwd).toBe(tmpDir);
                expect(project.rootSource.agdaFiles.sort()).toEqual(['file1.agda', 'file2.agda', 'file3.agda'].sort());
                expect(project.rootSource.mdFiles.sort()).toEqual(['file1.md', 'file2.md', 'file3.md'].sort());
            });

            it('empty deps.txt file and multiple agda files and multiple md files in nested directories', async () => {
                // Create the deps file
                await ProjectTest.writeDirectDepsFile(tmpDir, new Map());

                // Create the .agda-lib file
                ProjectTest.createAgdaLibFile(tmpDir, projectName);

                // Create the root source
                createRootSource(
                    new Map([
                        ['subdir1/file1.agda', 'myNat : ℕ\nmyNat = 0'],
                        ['subdir1/README.md', '# My Document'],
                        ['subdir2/file2.agda', 'myNat : ℕ\nmyNat = 0'],
                        ['subdir2/README.md', '# My Document'],
                        ['subdir2/subdir3/file3.agda', 'myNat : ℕ\nmyNat = 0'],
                        ['subdir2/subdir3/README.md', '# My Document'],
                    ]),
                );

                // Load the project
                const project = await Project.load(tmpDir);

                // Expect the project to be an instance of Project
                expect(project).toBeInstanceOf(Project);
                expect(project.name).toBe('APMTmpProject');
                expect(project.directDeps).toEqual(new Map());
                expect(project.cwd).toBe(tmpDir);
                expect(project.rootSource.agdaFiles.sort()).toEqual(
                    ['subdir1/file1.agda', 'subdir2/file2.agda', 'subdir2/subdir3/file3.agda'].sort(),
                );
                expect(project.rootSource.mdFiles.sort()).toEqual(
                    ['subdir1/README.md', 'subdir2/README.md', 'subdir2/subdir3/README.md'].sort(),
                );
            });

            it('single package deps.txt file and no source files', async () => {
                // Create the deps file
                await ProjectTest.writeDirectDepsFile(tmpDir, new Map([['name', '1.0.0']]));

                // Create the .agda-lib file
                ProjectTest.createAgdaLibFile(tmpDir, projectName);

                // Create the root source
                createRootSource(new Map());

                // Load the project
                const project = await Project.load(tmpDir);

                // Expect the project to be an instance of Project
                expect(project).toBeInstanceOf(Project);
                expect(project.name).toBe('APMTmpProject');
                expect(project.directDeps).toEqual(new Map([['name', '1.0.0']]));
                expect(project.cwd).toBe(tmpDir);
                expect(project.rootSource.agdaFiles).toEqual([]);
                expect(project.rootSource.mdFiles).toEqual([]);
            });

            it('two package deps.txt file and no source files', async () => {
                // Create the deps file
                await ProjectTest.writeDirectDepsFile(
                    tmpDir,
                    new Map([
                        ['name0', '1.0.0'],
                        ['name1', '1.0.1'],
                    ]),
                );

                // Create the .agda-lib file
                ProjectTest.createAgdaLibFile(tmpDir, projectName);

                // Create the root source
                createRootSource(new Map());

                // Load the project
                const project = await Project.load(tmpDir);

                // Expect the project to be an instance of Project
                expect(project).toBeInstanceOf(Project);
                expect(project.name).toBe('APMTmpProject');
                expect(project.directDeps).toEqual(
                    new Map([
                        ['name0', '1.0.0'],
                        ['name1', '1.0.1'],
                    ]),
                );
                expect(project.cwd).toBe(tmpDir);
                expect(project.rootSource.agdaFiles).toEqual([]);
                expect(project.rootSource.mdFiles).toEqual([]);
            });

            it('two package deps.txt file and one agda file', async () => {
                // Create the deps file
                await ProjectTest.writeDirectDepsFile(
                    tmpDir,
                    new Map([
                        ['name0', '1.0.0'],
                        ['name1', '1.0.1'],
                    ]),
                );

                // Create the .agda-lib file
                ProjectTest.createAgdaLibFile(tmpDir, projectName);

                // Create the root source
                createRootSource(new Map([['file.agda', 'myNat : ℕ\nmyNat = 0']]));

                // Load the project
                const project = await Project.load(tmpDir);

                // Expect the project to be an instance of Project
                expect(project).toBeInstanceOf(Project);
                expect(project.name).toBe('APMTmpProject');
                expect(project.directDeps).toEqual(
                    new Map([
                        ['name0', '1.0.0'],
                        ['name1', '1.0.1'],
                    ]),
                );
                expect(project.cwd).toBe(tmpDir);
                expect(project.rootSource.agdaFiles).toEqual(['file.agda']);
                expect(project.rootSource.mdFiles).toEqual([]);
            });

            it('two package deps.txt file and one md file', async () => {
                // Create the deps file
                await ProjectTest.writeDirectDepsFile(
                    tmpDir,
                    new Map([
                        ['name0', '1.0.0'],
                        ['name1', '1.0.1'],
                    ]),
                );

                // Create the .agda-lib file
                ProjectTest.createAgdaLibFile(tmpDir, projectName);

                // Create the root source
                createRootSource(new Map([['file.md', '# My Document']]));

                // Load the project
                const project = await Project.load(tmpDir);

                // Expect the project to be an instance of Project
                expect(project).toBeInstanceOf(Project);
                expect(project.name).toBe('APMTmpProject');
                expect(project.directDeps).toEqual(
                    new Map([
                        ['name0', '1.0.0'],
                        ['name1', '1.0.1'],
                    ]),
                );
                expect(project.cwd).toBe(tmpDir);
                expect(project.rootSource.agdaFiles).toEqual([]);
                expect(project.rootSource.mdFiles).toEqual(['file.md']);
            });

            it('two package deps.txt file and one agda file and one md file', async () => {
                // Create the deps file
                await ProjectTest.writeDirectDepsFile(
                    tmpDir,
                    new Map([
                        ['name0', '1.0.0'],
                        ['name1', '1.0.1'],
                    ]),
                );

                // Create the .agda-lib file
                ProjectTest.createAgdaLibFile(tmpDir, projectName);

                // Create the root source
                createRootSource(
                    new Map([
                        ['file.agda', 'myNat : ℕ\nmyNat = 0'],
                        ['file.md', '# My Document'],
                    ]),
                );

                // Load the project
                const project = await Project.load(tmpDir);

                // Expect the project to be an instance of Project
                expect(project).toBeInstanceOf(Project);
                expect(project.name).toBe('APMTmpProject');
                expect(project.directDeps).toEqual(
                    new Map([
                        ['name0', '1.0.0'],
                        ['name1', '1.0.1'],
                    ]),
                );
                expect(project.cwd).toBe(tmpDir);
                expect(project.rootSource.agdaFiles).toEqual(['file.agda']);
                expect(project.rootSource.mdFiles).toEqual(['file.md']);
            });

            it('many package deps.txt file and multiple agda files', async () => {
                // Create the deps file
                await ProjectTest.writeDirectDepsFile(
                    tmpDir,
                    new Map([
                        ['name0', '1.0.0'],
                        ['name1', '1.0.1'],
                        ['name2', '1.0.2'],
                        ['name3', '1.0.3'],
                        ['name4', '1.0.4'],
                    ]),
                );

                // Create the .agda-lib file
                ProjectTest.createAgdaLibFile(tmpDir, projectName);

                // Create the root source
                createRootSource(
                    new Map([
                        ['file1.agda', 'myNat : ℕ\nmyNat = 0'],
                        ['file2.agda', 'myNat : ℕ\nmyNat = 0'],
                        ['file3.agda', 'myNat : ℕ\nmyNat = 0'],
                        ['file4.agda', 'myNat : ℕ\nmyNat = 0'],
                        ['file5.agda', 'myNat : ℕ\nmyNat = 0'],
                    ]),
                );

                // Load the project
                const project = await Project.load(tmpDir);

                // Expect the project to be an instance of Project
                expect(project).toBeInstanceOf(Project);
                expect(project.name).toBe('APMTmpProject');
                expect(project.directDeps).toEqual(
                    new Map([
                        ['name0', '1.0.0'],
                        ['name1', '1.0.1'],
                        ['name2', '1.0.2'],
                        ['name3', '1.0.3'],
                        ['name4', '1.0.4'],
                    ]),
                );
                expect(project.cwd).toBe(tmpDir);
                expect(project.rootSource.agdaFiles.sort()).toEqual(
                    ['file1.agda', 'file2.agda', 'file3.agda', 'file4.agda', 'file5.agda'].sort(),
                );
                expect(project.rootSource.mdFiles.sort()).toEqual([]);
            });

            it('many package deps.txt file and multiple agda files in random nested directories', async () => {
                // Create the deps file
                await ProjectTest.writeDirectDepsFile(
                    tmpDir,
                    new Map([
                        ['name0', '1.0.0'],
                        ['name1', '1.0.1'],
                        ['name2', '1.0.2'],
                        ['name3', '1.0.3'],
                        ['name4', '1.0.4'],
                    ]),
                );

                // Create the .agda-lib file
                ProjectTest.createAgdaLibFile(tmpDir, projectName);

                // Create the root source
                createRootSource(
                    new Map([
                        ['subdir1/file1.agda', 'myNat : ℕ\nmyNat = 0'],
                        ['subdir1/subdir2/subdir3/subdir4/file2.agda', 'myNat : ℕ\nmyNat = 0'],
                        ['subdir2/file3.agda', 'myNat : ℕ\nmyNat = 0'],
                        ['subdir4/file4.agda', 'myNat : ℕ\nmyNat = 0'],
                        ['subdir3/file5.agda', 'myNat : ℕ\nmyNat = 0'],
                    ]),
                );

                // Load the project
                const project = await Project.load(tmpDir);

                // Expect the project to be an instance of Project
                expect(project).toBeInstanceOf(Project);
                expect(project.name).toBe('APMTmpProject');
                expect(project.directDeps).toEqual(
                    new Map([
                        ['name0', '1.0.0'],
                        ['name1', '1.0.1'],
                        ['name2', '1.0.2'],
                        ['name3', '1.0.3'],
                        ['name4', '1.0.4'],
                    ]),
                );
                expect(project.cwd).toBe(tmpDir);
                expect(project.rootSource.agdaFiles.sort()).toEqual(
                    [
                        'subdir1/file1.agda',
                        'subdir1/subdir2/subdir3/subdir4/file2.agda',
                        'subdir2/file3.agda',
                        'subdir4/file4.agda',
                        'subdir3/file5.agda',
                    ].sort(),
                );
                expect(project.rootSource.mdFiles.sort()).toEqual([]);
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

            it('should throw a ProjectLoadError if the path does not exist', async () => {
                const srcPath = path.join(tmpDir, 'does-not-exist');
                // Ensure the path does not exist
                if (fs.existsSync(srcPath)) fs.rmSync(srcPath, { recursive: true, force: true });

                // Expect a rejection
                await expect(Project.load(srcPath)).rejects.toThrow(ProjectLoadError);
            });

            it('should throw a ProjectLoadError if the path is not a directory', async () => {
                const srcPath = path.join(tmpDir, 'not-a-directory');

                // Ensure the path does not exist
                if (fs.existsSync(srcPath)) fs.rmSync(srcPath, { recursive: true, force: true });

                // Create the file
                fs.writeFileSync(srcPath, 'not-a-directory');

                // Expect the file to exist
                expect(fs.existsSync(srcPath)).toBe(true);

                // Expect a rejection
                await expect(Project.load(srcPath)).rejects.toThrow(ProjectLoadError);
            });

            it('should throw a ReadDepsFileError if the path does not contain a deps.txt file', async () => {
                const srcPath = path.join(tmpDir, 'no-deps-txt');

                // Create the file
                fs.mkdirSync(srcPath, { recursive: true });

                // Create the .agda-lib file
                ProjectTest.createAgdaLibFile(srcPath, 'FailProject');

                // Expect the file to exist
                expect(fs.existsSync(srcPath)).toBe(true);

                // Expect a rejection
                await expect(Project.load(srcPath)).rejects.toThrow(ReadDepsFileError);
            });

            it('should throw a ReadDepsFileError if the deps.txt is not a file', async () => {
                const srcPath = path.join(tmpDir, 'no-deps-txt');
                const depsTxtPath = path.join(srcPath, 'deps.txt');

                // Create the file
                fs.mkdirSync(srcPath, { recursive: true });

                // Create the .agda-lib file
                ProjectTest.createAgdaLibFile(srcPath, 'FailProject');

                // Create the deps.txt folder (yes, this is strange, but it's just for testing)
                fs.mkdirSync(depsTxtPath, { recursive: true });

                // Expect the folder to exist
                expect(fs.existsSync(depsTxtPath)).toBe(true);

                // Expect a rejection
                await expect(Project.load(srcPath)).rejects.toThrow(ReadDepsFileError);
            });

            it('should throw a FailedToParseDepsError if the deps.txt file is invalid', async () => {
                const srcPath = path.join(tmpDir, 'invalid-deps-txt');
                const depsTxtPath = path.join(srcPath, 'deps.txt');

                // Create the file
                fs.mkdirSync(srcPath, { recursive: true });

                // Create the .agda-lib file
                ProjectTest.createAgdaLibFile(srcPath, 'FailProject');

                // Create the deps.txt file
                fs.writeFileSync(depsTxtPath, 'pkgName');

                // Expect the file to exist
                expect(fs.existsSync(depsTxtPath)).toBe(true);

                // Expect a rejection
                await expect(Project.load(srcPath)).rejects.toThrow(FailedToParseDepsError);
            });

            it('should throw a SourceLoadError if the path does not contain a root source directory', async () => {
                const srcPath = path.join(tmpDir, 'no-root-source');

                // Create the folder
                fs.mkdirSync(srcPath, { recursive: true });

                // Create the .agda-lib file
                ProjectTest.createAgdaLibFile(srcPath, 'FailProject');

                // Create the deps.txt file
                fs.writeFileSync(path.join(srcPath, 'deps.txt'), 'pkgName ver0');

                // Expect a rejection
                await expect(Project.load(srcPath)).rejects.toThrow(SourceLoadError);
            });
        });
    });

    describe('Project.init()', () => {
        const packDir = path.join(os.tmpdir(), 'apm-project-init-pack-dir');
        const extractDir = path.join(os.tmpdir(), 'apm-project-init-extract-dir');
        let pkg: Package; // a helper package that can be used for all tests
        let pkgFiles: Map<string, string>; // the files in the helper package
        const projectName = 'APMTmpProject';

        beforeEach(() => {
            // Remove the temporary directory if it exists
            if (fs.existsSync(packDir)) fs.rmSync(packDir, { recursive: true, force: true });
            if (fs.existsSync(extractDir)) fs.rmSync(extractDir, { recursive: true, force: true });
            // Create the temporary directory
            fs.mkdirSync(packDir, { recursive: true });
            fs.mkdirSync(extractDir, { recursive: true });
        });

        beforeAll(async () => {
            // Construct the helper package that will be used for all tests
            const directDeps = new Map([
                ['name0', '1.0.0'],
                ['name1', '1.0.1'],
                ['name2', '1.0.2'],
                ['name3', '1.0.3'],
                ['name4', '1.0.4'],
            ]);

            // Make the helper package dir path
            const helperDir = path.join(os.tmpdir(), 'project-init-helper');

            // If the helper dir exists, remove it
            if (fs.existsSync(helperDir)) fs.rmSync(helperDir, { recursive: true, force: true });

            // Create the helper dir
            fs.mkdirSync(helperDir, { recursive: true });

            // Make the source dir path
            const sourceDir = path.join(helperDir, 'source');

            // Make the helper package path
            const helperPackagePath = path.join(helperDir, `temp.apm`);

            // Remove the source dir if it exists
            if (fs.existsSync(sourceDir)) fs.rmSync(sourceDir, { recursive: true, force: true });

            // Create the source dir
            fs.mkdirSync(sourceDir, { recursive: true });

            pkgFiles = new Map([
                ['file1.agda', 'myNat : ℕ\nmyNat = 0'],
                ['file2.agda', 'myNat : ℕ\nmyNat = 0'],
                ['file3.md', '# My Document'],
                ['subdir/file4.agda', 'myNat : ℕ\nmyNat = 0'],
                ['subdir/file5.md', '# My Document'],
            ]);

            // Add files to source dir
            writeFilesInside(sourceDir, pkgFiles);

            // Construct source object
            const source: Source = await Source.load(sourceDir);

            // Create the archive
            const archive: Readable = source.getArchive();

            // Create the helper package
            pkg = await Package.create(helperPackagePath, projectName, directDeps, archive);
        });

        const writeFileInside = (baseDir: string, relPath: string, content: string) => {
            // Write the file inside the temporary directory
            const filePath = path.join(baseDir, relPath);
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
            fs.writeFileSync(filePath, content);
        };

        const writeFilesInside = (baseDir: string, entries: Map<string, string>) => {
            for (const [relPath, content] of entries) writeFileInside(baseDir, relPath, content);
        };

        describe('success cases', () => {
            const assertFileInside = (baseDir: string, relPath: string, content: string) => {
                const filePath = path.join(baseDir, relPath);
                expect(fs.existsSync(filePath)).toBe(true);
                expect(fs.readFileSync(filePath, 'utf8')).toBe(content);
            };

            const assertFilesMatchExactly = (baseDir: string, entries: Map<string, string>) => {
                for (const [relPath, content] of entries) assertFileInside(baseDir, relPath, content);
                // Get the list of files in the extract directory using glob
                const extractDirRelFiles = glob.sync('**/*', { cwd: baseDir, nodir: true }).sort();
                // Get the list of files in the pack directory using glob
                const expectedRelFiles = Array.from(entries.keys()).sort();
                // Assert that the list of files in the extract directory matches the list of files in the pack directory
                expect(extractDirRelFiles).toEqual(expectedRelFiles);
            };

            it('no archive supplied', async () => {
                // Make the project path
                const projectPath = path.join(extractDir, projectName);
                // Create the project folder
                fs.mkdirSync(projectPath, { recursive: true });
                // Create the project
                const project = await Project.init(projectPath, { projectName });
                // Expect the project to be an instance of Project
                expect(project).toBeInstanceOf(Project);
                // Expect the project name to be APMTmpProject
                expect(project.name).toBe(projectName);
                // Expect the project path to be the temporary directory
                expect(project.cwd).toBe(projectPath);
                // Expect the project to have a root source
                const rootSourcePath = path.join(projectPath, projectName);
                expect(fs.existsSync(rootSourcePath)).toBe(true);
                // Expect the project to have a deps.txt file
                const depsTxtPath = path.join(projectPath, 'deps.txt');
                expect(fs.existsSync(depsTxtPath)).toBe(true);
                // Expect the project to have a .agda-lib file
                const agdaLibPath = path.join(projectPath, '.agda-lib');
                expect(fs.existsSync(agdaLibPath)).toBe(true);
            });

            it('archive supplied', async () => {
                // Make the project path
                const projectPath = path.join(extractDir, projectName);
                // Create the project folder
                fs.mkdirSync(projectPath, { recursive: true });
                // Create the project
                const project = await Project.init(projectPath, { pkg });
                // Expect the project to be an instance of Project
                expect(project).toBeInstanceOf(Project);
                // Expect the project name to be APMTmpProject
                expect(project.name).toBe(projectName);
                // Expect the project path to be the temporary directory
                expect(project.cwd).toBe(projectPath);
                // Expect the project to have a root source
                const rootSourcePath = path.join(projectPath, projectName);
                expect(fs.existsSync(rootSourcePath)).toBe(true);
                // Expect the project to have a deps.txt file
                const depsTxtPath = path.join(projectPath, 'deps.txt');
                expect(fs.existsSync(depsTxtPath)).toBe(true);
                // Expect the project to have a .agda-lib file
                const agdaLibPath = path.join(projectPath, '.agda-lib');
                expect(fs.existsSync(agdaLibPath)).toBe(true);

                // Assert that the files in the project match the files in the package
                assertFilesMatchExactly(rootSourcePath, pkgFiles);
            });
        });

        describe('failure cases', () => {
            it('should throw a ProjectInitError if the path does not exist', async () => {
                // Make the path
                const srcPath = path.join(extractDir, 'does-not-exist');
                // Expect a rejection
                await expect(Project.init(srcPath, { projectName })).rejects.toThrow(ProjectInitError);
            });

            it('should throw a ProjectInitError if the path is not a directory', async () => {
                // Make the path
                const srcPath = path.join(extractDir, 'not-a-directory');
                // Create the file
                fs.writeFileSync(srcPath, 'not-a-directory');
                // Expect a rejection
                await expect(Project.init(srcPath, { projectName })).rejects.toThrow(ProjectInitError);
            });

            it('should throw a ProjectInitError if the directory already contains a dependencies file', async () => {
                // Make the project path
                const projectPath = path.join(extractDir, projectName);
                // Create the project folder
                fs.mkdirSync(projectPath, { recursive: true });
                // Get path to the dependencies file
                const depsTxtPath = path.join(projectPath, 'deps.txt');
                // Create the dependencies file
                fs.writeFileSync(depsTxtPath, '');
                // Expect a rejection
                await expect(Project.init(projectPath, { projectName })).rejects.toThrow(ProjectInitError);
            });

            it('should throw a ProjectInitError if the directory already contains a root source directory', async () => {
                // Make the project path
                const projectPath = path.join(extractDir, projectName);
                // Create the project folder
                fs.mkdirSync(projectPath, { recursive: true });
                // Get path to the root source directory
                const rootSourcePath = path.join(projectPath, projectName);
                // Create the root source directory
                fs.mkdirSync(rootSourcePath, { recursive: true });
                // Expect a rejection
                await expect(Project.init(projectPath, { projectName })).rejects.toThrow(ProjectInitError);
            });

            it('should throw a ProjectInitError if the directory already contains a .agda-lib file', async () => {
                // Make the project path
                const projectPath = path.join(extractDir, projectName);
                // Create the project folder
                fs.mkdirSync(projectPath, { recursive: true });
                // Get path to the .agda-lib file
                const agdaLibPath = path.join(projectPath, '.agda-lib');
                // Create the .agda-lib file
                fs.writeFileSync(agdaLibPath, '');
                // Expect a rejection
                await expect(Project.init(projectPath, { projectName })).rejects.toThrow(ProjectInitError);
            });
        });
    });

    describe('Project.check()', () => {
        const projectName = 'APMTmpProject';
        const projectDir = path.join(os.tmpdir(), projectName);
        let project: Project;

        const writeFileInside = (relPath: string, content: string) => {
            const filePath = path.join(projectDir, relPath);
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
            fs.writeFileSync(filePath, content);
        };

        const setRootSource = (files: Map<string, string>) => {
            const rootSourceDir = path.join(projectDir, projectName);
            // If the dir exists, remove it
            if (fs.existsSync(rootSourceDir)) fs.rmSync(rootSourceDir, { recursive: true, force: true });
            // Create the dir
            fs.mkdirSync(rootSourceDir, { recursive: true });
            // Create the files
            for (const [relPath, content] of files.entries()) {
                writeFileInside(path.join(projectName, relPath), content);
            }
        };

        beforeEach(async () => {
            // Remove the temporary directory if it exists
            if (fs.existsSync(projectDir)) fs.rmSync(projectDir, { recursive: true, force: true });
            // Create the temporary directory
            fs.mkdirSync(projectDir, { recursive: true });
            // Create the project
            project = await Project.init(projectDir, { projectName });
        });

        describe('success cases', () => {
            const genericTest = async (files: Map<string, string>) => {
                // Set the root source
                setRootSource(files);
                // reload the project
                project = await Project.load(projectDir);
                // Expect the project to check
                await expect(project.check()).resolves.toBeUndefined();
            };

            it('zero files in root source', async () => await genericTest(new Map()));

            it('one agda file', async () =>
                await genericTest(new Map([['file1.agda', `module ${projectName}.file1 where`]])));

            it('one agda file that defines a Nat', async () =>
                await genericTest(
                    new Map([
                        [
                            'file1.agda',
                            `
                            module ${projectName}.file1 where
                            open import Agda.Builtin.Nat
                            myNat : Nat
                            myNat = 0
                            `,
                        ],
                    ]),
                ));

            it('two agda files that both define Nats', async () =>
                await genericTest(
                    new Map([
                        [
                            'file1.agda',
                            `
                                module ${projectName}.file1 where
                                open import Agda.Builtin.Nat
                                myNat : Nat
                                myNat = 1
                                `,
                        ],
                        [
                            'file2.agda',
                            `
                                module ${projectName}.file2 where
                                open import Agda.Builtin.Nat
                                myNat : Nat
                                myNat = 2
                                `,
                        ],
                    ]),
                ));

            it('one agda file in subdir is correct', async () =>
                await genericTest(
                    new Map([
                        [
                            'subdir/file1.agda',
                            `
                                module ${projectName}.subdir.file1 where
                                open import Agda.Builtin.Nat
                                myNat : Nat
                                myNat = 1
                                `,
                        ],
                    ]),
                ));
        });

        describe('failure cases', () => {
            const genericTest = async (files: Map<string, string>) => {
                // Set the root source
                setRootSource(files);
                // reload the project
                project = await Project.load(projectDir);
                // Expect the project to check
                await expect(project.check()).rejects.toThrow(CheckProjectError);
            };

            it('empty agda file', async () => await genericTest(new Map([['file1.agda', ``]])));

            it('single agda file with invalid module name (omitting project name)', async () =>
                await genericTest(new Map([['file1.agda', `module file2 where`]])));

            it('single agda file with invalid module name (wrong file name)', async () =>
                await genericTest(new Map([['file1.agda', `module ${projectName}.file2 where`]])));

            it('single agda file importing nonexistent library', async () =>
                await genericTest(
                    new Map([
                        [
                            'file1.agda',
                            `
                            module ${projectName}.file1 where
                            open import MyAwesomeLibrary`,
                        ],
                    ]),
                ));

            it('two agda files where first in lexical order is wrong', async () =>
                await genericTest(
                    new Map([
                        [
                            'file1.agda',
                            `
                                    module ${projectName}.file1 where
                                    open import Agda.Builtin.Nat
                                    myNat : Nat
                                    myNat = abc
                                    `,
                        ],
                        [
                            'file2.agda',
                            `
                                    module ${projectName}.file2 where
                                    open import Agda.Builtin.Nat
                                    myNat : Nat
                                    myNat = 2
                                    `,
                        ],
                    ]),
                ));

            it('two agda files where second in lexical order is wrong', async () =>
                await genericTest(
                    new Map([
                        [
                            'file1.agda',
                            `
                                        module ${projectName}.file1 where
                                        open import Agda.Builtin.Nat
                                        myNat : Nat
                                        myNat = 1
                                        `,
                        ],
                        [
                            'file2.agda',
                            `
                                        module ${projectName}.file2 where
                                        open import Agda.Builtin.Nat
                                        myNat : Nat
                                        myNat = abc
                                        `,
                        ],
                    ]),
                ));

            it('one agda file in subdir is wrong', async () =>
                await genericTest(
                    new Map([
                        [
                            'subdir/file1.agda',
                            `
                            module ${projectName}.subdir.file1 where
                            open import Agda.Builtin.Nat
                            myNat : Nat
                            myNat = abc
                            `,
                        ],
                    ]),
                ));
        });
    });
});
