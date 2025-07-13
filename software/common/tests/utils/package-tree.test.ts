import { describe, it, beforeEach, expect } from '@jest/globals';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { Readable } from 'stream';
import { Package } from '../../src/models/package';
import { Source } from '../../src/models/source';
import { PackageTree, __test__ as PackageTreeTest } from '../../src/utils/package-tree';
import { boxed } from '../../src/utils/box-text';

describe('utils/PackageTree', () => {
    // Helper function to create a package with no source files
    const createPackage = async (filePath: string, name: string, deps: Set<string>) => {
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

    // Helper function to check if two arrays of packages are the same
    const packagesAreSame = (pkgs1: Package[], pkgs2: Package[]) => {
        // DO NOT SORT
        return (
            pkgs1.length === pkgs2.length &&
            pkgs1.every((pkg, index) => pkg.name === pkgs2[index].name && pkg.id === pkgs2[index].id)
        );
    };

    const depend = (deps: Package[]) => {
        const result = new Set<string>();
        for (const dep of deps) result.add(dep.id);
        return result;
    };

    const testCasePath = path.join(os.tmpdir(), 'TestCaseTemp');

    beforeEach(async () => {
        // If the test case path exists, remove it
        if (fs.existsSync(testCasePath)) fs.rmSync(testCasePath, { recursive: true, force: true });
        // Create the test case path
        fs.mkdirSync(testCasePath, { recursive: true });
    });

    //     describe('getAsciiTree()', () => {
    //         it('just a root node', async () => {
    //             // Create the package
    //             const pkg0 = await createPackage(path.join(testCasePath, 'pkg0.apm'), 'pkg0', depend([]));
    //             // Create the package tree
    //             const tree = new PackageTree(pkg0, []);
    //             // Get the ASCII tree
    //             const asciiTree = PackageTreeTest.getAsciiTree(tree);
    //             console.log(asciiTree.toString());
    //             // Assert the ASCII tree
    //             // expect(asciiTree.toString()).toBe(boxed(pkg0.name + '\n' + pkg0.id));
    //         });

    //         it('a root with one child', async () => {
    //             // Create the packages
    //             const pkg0 = await createPackage(path.join(testCasePath, 'pkg0.apm'), 'pkg0', depend([]));
    //             const pkg1 = await createPackage(path.join(testCasePath, 'pkg1.apm'), 'pkg1', depend([pkg0]));
    //             // Create the package tree
    //             const tree = new PackageTree(pkg1, [new PackageTree(pkg0, [])]);
    //             // Get the ASCII tree
    //             const asciiTree = PackageTreeTest.getAsciiTree(tree);
    //             console.log(asciiTree.toString());
    //             // Assert the ASCII tree
    //             // expect(asciiTree.toString()).toBe(boxed(pkg0.name + '\n' + pkg0.id));
    //         });

    //         it('a root with two children', async () => {
    //             // Create the packages
    //             const pkg0 = await createPackage(path.join(testCasePath, 'pkg0.apm'), 'pkg0', depend([]));
    //             const pkg1 = await createPackage(path.join(testCasePath, 'pkg1.apm'), 'pkg1', depend([]));
    //             const pkg2 = await createPackage(path.join(testCasePath, 'pkg2.apm'), 'pkg2', depend([pkg0, pkg1]));
    //             // Create the package tree
    //             const tree = new PackageTree(pkg2, [new PackageTree(pkg0, []), new PackageTree(pkg1, [])]);
    //             // Get the ASCII tree
    //             const asciiTree = PackageTreeTest.getAsciiTree(tree);
    //             console.log(asciiTree.toString());
    //             // Assert the ASCII tree
    //             // expect(asciiTree.toString()).toBe(boxed(pkg0.name + '\n' + pkg0.id));
    //         });

    //         it('a root with one child and one grandchild', async () => {
    //             // Create the packages
    //             const pkg0 = await createPackage(path.join(testCasePath, 'pkg0.apm'), 'pkg0', depend([]));
    //             const pkg1 = await createPackage(path.join(testCasePath, 'pkg1.apm'), 'pkg1', depend([pkg0]));
    //             const pkg2 = await createPackage(path.join(testCasePath, 'pkg2.apm'), 'pkg2', depend([pkg1]));
    //             // Create the package tree
    //             const tree = new PackageTree(pkg2, [new PackageTree(pkg1, [new PackageTree(pkg0, [])])]);
    //             // Get the ASCII tree
    //             const asciiTree = PackageTreeTest.getAsciiTree(tree);
    //             console.log(asciiTree.toString());
    //             // Assert the ASCII tree
    //             const expected = `┌────────────────────────────────────────────────────────────────┐
    // |                                                            pkg2│
    // |${pkg2.id}│
    // └────────────────────────────────────────────────────────────────┘
    // ├── ┌────────────────────────────────────────────────────────────────┐
    // │   |                                                            pkg0│
    // │   |${pkg0.id}│
    // │   └────────────────────────────────────────────────────────────────┘
    // └── ┌────────────────────────────────────────────────────────────────┐
    //     |                                                            pkg1│
    //     |${pkg1.id}│
    //     └────────────────────────────────────────────────────────────────┘`;
    //             expect(asciiTree.toString()).toBe(expected);
    //         });

    //         it('a root with two children and four grandchildren', async () => {
    //             // Create the packages
    //             const pkg0 = await createPackage(path.join(testCasePath, 'pkg0.apm'), 'pkg0', depend([]));
    //             const pkg1 = await createPackage(path.join(testCasePath, 'pkg1.apm'), 'pkg1', depend([]));
    //             const pkg2 = await createPackage(path.join(testCasePath, 'pkg2.apm'), 'pkg2', depend([]));
    //             const pkg3 = await createPackage(path.join(testCasePath, 'pkg3.apm'), 'pkg3', depend([]));
    //             const pkg4 = await createPackage(path.join(testCasePath, 'pkg4.apm'), 'pkg4', depend([pkg0, pkg1]));
    //             const pkg5 = await createPackage(path.join(testCasePath, 'pkg5.apm'), 'pkg5', depend([pkg2, pkg3]));
    //             const pkg6 = await createPackage(path.join(testCasePath, 'pkg6.apm'), 'pkg6', depend([pkg4, pkg5]));
    //             // Create the package tree
    //             const tree = new PackageTree(pkg6, [
    //                 new PackageTree(pkg4, [new PackageTree(pkg0, []), new PackageTree(pkg1, [])]),
    //                 new PackageTree(pkg5, [new PackageTree(pkg2, []), new PackageTree(pkg3, [])]),
    //             ]);
    //             // Get the ASCII tree
    //             const asciiTree = PackageTreeTest.getAsciiTree(tree);
    //             console.log(asciiTree.toString());
    //             // Assert the ASCII tree
    //             // expect(asciiTree.toString()).toBe(boxed(pkg0.name + '\n' + pkg0.id));
    //         });
    //     });

    describe('getTopologicalSort', () => {
        it('just a root node', async () => {
            console.log(fs.readdirSync(testCasePath));
            // Create the package
            const pkg0 = await createPackage(path.join(testCasePath, 'pkg0.apm'), 'pkg0', depend([]));
            // Create the package tree
            const tree = new PackageTree(pkg0, []);
            // Get the topological sort
            const topologicalSort = tree.getTopologicalSort();
            // Assert the topological sort
            expect(packagesAreSame(topologicalSort, [pkg0])).toBe(true);
        });

        it('a root with one child', async () => {
            // Create the packages
            const pkg0 = await createPackage(path.join(testCasePath, 'pkg0.apm'), 'pkg0', depend([]));
            const pkg1 = await createPackage(path.join(testCasePath, 'pkg1.apm'), 'pkg1', depend([pkg0]));
            // Create the package tree
            const tree = new PackageTree(pkg1, [new PackageTree(pkg0, [])]);
            // Get the topological sort
            const topologicalSort = tree.getTopologicalSort();
            // Assert the topological sort
            expect(packagesAreSame(topologicalSort, [pkg0, pkg1])).toBe(true);
        });

        it('a root with two children', async () => {
            // Create the packages
            const pkg0 = await createPackage(path.join(testCasePath, 'pkg0.apm'), 'pkg0', depend([]));
            const pkg1 = await createPackage(path.join(testCasePath, 'pkg1.apm'), 'pkg1', depend([]));
            const pkg2 = await createPackage(path.join(testCasePath, 'pkg2.apm'), 'pkg2', depend([pkg0, pkg1]));
            // Create the package tree
            const tree = new PackageTree(pkg2, [new PackageTree(pkg0, []), new PackageTree(pkg1, [])]);
            // Get the topological sort
            const topologicalSort = tree.getTopologicalSort();
            // Assert the topological sort
            expect(packagesAreSame(topologicalSort, [pkg0, pkg1, pkg2])).toBe(true);
        });

        it('a root with one child and one grandchild', async () => {
            // Create the packages
            const pkg0 = await createPackage(path.join(testCasePath, 'pkg0.apm'), 'pkg0', depend([]));
            const pkg1 = await createPackage(path.join(testCasePath, 'pkg1.apm'), 'pkg1', depend([pkg0]));
            const pkg2 = await createPackage(path.join(testCasePath, 'pkg2.apm'), 'pkg2', depend([pkg1]));
            // Create the package tree
            const tree = new PackageTree(pkg2, [new PackageTree(pkg1, [new PackageTree(pkg0, [])])]);
            // Get the topological sort
            const topologicalSort = tree.getTopologicalSort();
            // Assert the topological sort
            expect(packagesAreSame(topologicalSort, [pkg0, pkg1, pkg2])).toBe(true);
        });

        it('a root with two children and four grandchildren', async () => {
            // Create the packages
            const pkg0 = await createPackage(path.join(testCasePath, 'pkg0.apm'), 'pkg0', depend([]));
            const pkg1 = await createPackage(path.join(testCasePath, 'pkg1.apm'), 'pkg1', depend([]));
            const pkg2 = await createPackage(path.join(testCasePath, 'pkg2.apm'), 'pkg2', depend([]));
            const pkg3 = await createPackage(path.join(testCasePath, 'pkg3.apm'), 'pkg3', depend([]));
            const pkg4 = await createPackage(path.join(testCasePath, 'pkg4.apm'), 'pkg4', depend([pkg0, pkg1]));
            const pkg5 = await createPackage(path.join(testCasePath, 'pkg5.apm'), 'pkg5', depend([pkg2, pkg3]));
            const pkg6 = await createPackage(path.join(testCasePath, 'pkg6.apm'), 'pkg6', depend([pkg4, pkg5]));
            // Create the package tree
            const tree = new PackageTree(pkg6, [
                new PackageTree(pkg4, [new PackageTree(pkg0, []), new PackageTree(pkg1, [])]),
                new PackageTree(pkg5, [new PackageTree(pkg2, []), new PackageTree(pkg3, [])]),
            ]);
            // Get the topological sort
            const topologicalSort = tree.getTopologicalSort();
            // Assert the topological sort
            expect(packagesAreSame(topologicalSort, [pkg0, pkg1, pkg4, pkg2, pkg3, pkg5, pkg6])).toBe(true);
        });
    });
});
