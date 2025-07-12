// Error for when a package cannot be put into the registry
class PutPackageError extends Error {
    constructor(name: string, version: string, message: string) {
        super(`Package ${name}@${version} cannot be put into the registry: ${message}`);
        this.name = 'PutPackageError';
    }
}

export default PutPackageError;
