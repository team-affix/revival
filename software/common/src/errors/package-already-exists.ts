// Error thrown when a package already exists
class PackageAlreadyExistsError extends Error {
    constructor(registryRoot: string, packageName: string, packageVersion: string) {
        super(`Package ${packageName}@${packageVersion} already exists in ${registryRoot}`);
        this.name = 'PackageAlreadyExistsError';
    }
}

export default PackageAlreadyExistsError;
