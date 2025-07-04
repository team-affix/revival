// Package not found error
class PackageLoadError extends Error {
    constructor(srcPath: string, message: string) {
        super(`Package load failed at ${srcPath}: ${message}`);
        this.name = 'PackageLoadError';
    }
}

export default PackageLoadError;
