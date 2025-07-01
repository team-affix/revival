// Package not found error
class PackageNotFoundError extends Error {
    constructor(name: string, version: string, path: string) {
        super(`Package ${name} ${version} not found at ${path}`);
        this.name = 'PackageNotFoundError';
    }
}

export default PackageNotFoundError;
