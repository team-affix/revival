import { Package } from '../models/package';
import { boxed } from './box-text';

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
    toString(startPrefix: string = '', midPrefix: string = ''): string {
        // Create a result string
        let result = '';

        // Create a boxed string
        const box = boxed(this.value.name + '\n' + this.value.id);

        // Get the lines in the box
        const lines = box.split('\n');

        // Add the first line to the result with the start prefix
        result += startPrefix + lines[0] + '\n';

        // Iterate over remaining lines
        for (let i = 1; i < lines.length; i++) {
            // Add the line to the result
            result += midPrefix + lines[i] + '\n';
        }

        // Iterate over the children
        for (let i = 0; i < this.children.length; i++) {
            let childStartPrefix: string = midPrefix + '├───';
            let childMidPrefix: string = midPrefix + '│   ';

            if (i === this.children.length - 1) {
                childStartPrefix = midPrefix + '└───';
                childMidPrefix = midPrefix + '    ';
            }

            // Add the child to the result
            result += this.children[i].toString(childStartPrefix, childMidPrefix);
        }

        return result;
    }
}

// // A data structure that represents a package tree
// export class TestPackageTree {
//     // Construct a package tree
//     constructor(
//         public readonly name: string,
//         public readonly id: string,
//         public readonly children: TestPackageTree[],
//     ) {}

//     // Convert the package tree to a string representation
//     toString(startPrefix: string = '', midPrefix: string = ''): string {
//         // Create a result string
//         let result = '';

//         // Create a boxed string
//         const box = boxed(this.name + '\n' + this.id);

//         // Get the lines in the box
//         const lines = box.split('\n');

//         // Add the first line to the result with the start prefix
//         result += startPrefix + lines[0] + '\n';

//         // Iterate over remaining lines
//         for (let i = 1; i < lines.length; i++) {
//             // Add the line to the result
//             result += midPrefix + lines[i] + '\n';
//         }

//         // Iterate over the children
//         for (let i = 0; i < this.children.length; i++) {
//             let childStartPrefix: string = midPrefix + '├───';
//             let childMidPrefix: string = midPrefix + '│   ';

//             if (i === this.children.length - 1) {
//                 childStartPrefix = midPrefix + '└───';
//                 childMidPrefix = midPrefix + '    ';
//             }

//             // Add the child to the result
//             result += this.children[i].toString(childStartPrefix, childMidPrefix);
//         }

//         return result;
//     }
// }

// const test = new TestPackageTree('pkg0', 'sdfghkj4w5gi78gsdf78gfw4yu43kgfsdkgbfduydfgdfsbg', [
//     new TestPackageTree('pkg1', 'sdfghkj4w5gi78gsdf78gfw4yu43kgfsdkgbfduydfgdfsbg', [
//         new TestPackageTree('pkg2', 'sdfghkj4w5gi78gsdf78gfw4yu43kgfsdkgbfduydfgdfsbg', []),
//         new TestPackageTree('pkg3', 'sdfghkj4w5gi78gsdf78gfw4yu43kgfsdkgbfduydfgdfsbg', []),
//     ]),
//     new TestPackageTree('pkg3', 'sdfghkj4w5gi78gsdf78gfw4yu43kgfsdkgbfduydfgdfsbg', [
//         new TestPackageTree('pkg4', 'sdfghkj4w5gi78gsdf78gfw4yu43kgfsdkgbfduydfgdfsbg', [
//             new TestPackageTree('pkg5', 'sdfghkj4w5gi78gsdf78gfw4yu43kgfsdkgbfduydfgdfsbg', []),
//             new TestPackageTree('pkg6', 'sdfghkj4w5gi78gsdf78gfw4yu43kgfsdkgbfduydfgdfsbg', []),
//         ]),
//         new TestPackageTree('pkg7', 'sdfghkj4w5gi78gsdf78gfw4yu43kgfsdkgbfduydfgdfsbg', []),
//     ]),
// ]);

// console.log(test.toString());
