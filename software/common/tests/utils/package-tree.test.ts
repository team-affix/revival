import { describe, it, beforeEach, expect } from '@jest/globals';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { Readable } from 'stream';
import { Package } from '../../src/models/package';
import { Source } from '../../src/models/source';
import { PackageTree, __test__ as PackageTreeTest } from '../../src/utils/package-tree';

describe('utils/PackageTree', () => {
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

    // Helper function to check if two arrays of packages are the same
    const packagesAreSame = (pkgs1: Package[], pkgs2: Package[]) => {
        // DO NOT SORT
        return (
            pkgs1.length === pkgs2.length &&
            pkgs1.every((pkg, index) => pkg.name === pkgs2[index].name && pkg.version === pkgs2[index].version)
        );
    };

    const testCasePath = path.join(os.tmpdir(), 'TestCaseTemp');

    beforeEach(async () => {
        // If the test case path exists, remove it
        if (fs.existsSync(testCasePath)) fs.rmSync(testCasePath, { recursive: true, force: true });
        // Create the test case path
        fs.mkdirSync(testCasePath, { recursive: true });
    });

    describe('getTopologicalSort', () => {
        // // Helper function to create dependent packages
        // const createDependentPackages = async (
        //     pkgs: { id: number; name: string; deps: number[] }[],
        // ): Promise<Package[]> => {
        //     // Create the packages
        //     const idPackageMap: Map<number, Package> = new Map();
        //     for (const pkgDesc of pkgs) {
        //         // Construct the file path
        //         const filePath = path.join(testCasePath, `${pkgDesc.id}.apm`);
        //         // Construct the direct dependencies
        //         const directDeps = new Map<string, string>();
        //         for (const id of pkgDesc.deps) {
        //             const depPkg = idPackageMap.get(id)!;
        //             directDeps.set(depPkg.name, depPkg.version);
        //         }
        //         // Construct the package
        //         const pkg = await createPackage(filePath, pkgDesc.name, directDeps);
        //         // Add the package to the map
        //         idPackageMap.set(pkgDesc.id, pkg);
        //     }
        //     // Return the packages
        //     return Array.from(idPackageMap.values());
        // };

        // // Generic test function
        // const genericTest = async (
        //     includedPkgs: { id: number; name: string; deps: number[] }[],
        //     rootId: number,
        //     expectedPkgIds: number[],
        // ) => {
        //     // Create the dependent packages
        //     const pkgs = await createDependentPackages(includedPkgs);

        //     // Get the root package
        //     const rootPkg = pkgs.get(rootId)!;

        //     // Get the expected packages
        //     const expectedPkgs = expectedPkgIds.map((id) => pkgs.get(id)!);

        //     // Create the package tree
        //     const tree = new PackageTree(
        //         rootPkg,
        //         expectedPkgs.map((pkg) => new PackageTree(pkg, [])),
        //     );

        //     // Get the topological sort
        //     const topologicalSort = tree.getTopologicalSort();

        //     // Assert the topological sort
        //     expect(packagesAreSame(topologicalSort, expectedPkgs)).toBe(true);
        // };

        const depend = (deps: Package[]) => {
            const result = new Map<string, string>();
            for (const dep of deps) result.set(dep.name, dep.version);
            return result;
        };

        it('just a root node', async () => {
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
