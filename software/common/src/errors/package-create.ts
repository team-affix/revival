// Error thrown when creating a package from a directory is invalid
class PackageCreateError extends Error {
    constructor(filePath: string, reason: string) {
        super(`Package creation failed: ${filePath} (${reason})`);
        this.name = 'PackageCreateError';
    }
}

export default PackageCreateError;
