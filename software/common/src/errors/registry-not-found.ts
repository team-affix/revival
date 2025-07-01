class RegistryNotFoundError extends Error {
    constructor(registryRoot: string) {
        super(`Registry at ${registryRoot} does not exist`);
        this.name = 'RegistryNotFoundError';
    }
}

export default RegistryNotFoundError;
