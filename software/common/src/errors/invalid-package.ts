// Error for an invalid package
class InvalidPackageError extends Error {
    constructor(packagePath: string) {
        super(`Invalid package: ${packagePath}`);
        this.name = 'InvalidPackageError';
    }
}

export default InvalidPackageError;
