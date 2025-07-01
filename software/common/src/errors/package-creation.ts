// Error thrown when creating a package from a directory is invalid
class PackageCreationError extends Error {
    constructor(srcDir: string, reason: string) {
        super(`Invalid package creation: ${srcDir} (${reason})`);
        this.name = 'PackageCreationError';
    }
}

export default PackageCreationError;
