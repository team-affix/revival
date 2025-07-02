// Package not found error
class PackageNotFoundError extends Error {
    constructor(path: string) {
        super(`Package not found at ${path}`);
        this.name = 'PackageNotFoundError';
    }
}

export default PackageNotFoundError;
