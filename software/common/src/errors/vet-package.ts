// Error for when a package fails to pass the vetting process
class VetPackageError extends Error {
    constructor(name: string, version: string, message: string) {
        super(`Package ${name}@${version} failed the vetting process: ${message}`);
        this.name = 'VetPackageError';
    }
}

export default VetPackageError;
