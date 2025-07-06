export abstract class PackageBase {
    // Constructs a package base
    protected constructor(
        private name: string,
        private directDeps: Map<string, string>,
    ) {}

    // Get the name of the package
    getName(): string {
        return this.name;
    }

    // Get the dependencies of the package
    getDirectDeps(): Map<string, string> {
        return this.directDeps;
    }
}
