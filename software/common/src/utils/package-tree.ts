import { Package } from '../models/package';
import { boxed } from './box-text';
import { AsciiTree } from 'oo-ascii-tree';

// Convert a package tree to an ASCII tree
function getAsciiTree(packageTree: PackageTree): AsciiTree {
    // Create the root node
    const tree = new AsciiTree(boxed(packageTree.value.name + '\n' + packageTree.value.version));

    // Add the children
    for (const child of packageTree.children) tree.add(getAsciiTree(child));

    return tree;
}

// A data structure that represents a package tree
export class PackageTree {
    // Construct a package tree
    constructor(
        public readonly value: Package,
        public readonly children: PackageTree[],
    ) {}

    // Get the topological sort of the package tree
    getTopologicalSort(): Package[] {
        // Get the topological sort of the children
        const childrenSort = this.children.flatMap((child) => child.getTopologicalSort());

        // Return the topological sort of the package tree
        return [...childrenSort, this.value];
    }

    // Convert the package tree to a string representation
    toString(): string {
        return getAsciiTree(this).toString();
    }
}

export const __test__ = {
    getAsciiTree,
};
