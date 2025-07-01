class RegistryNotFoundError extends Error {
    constructor(registryRoot: string) {
        super(`Registry root path ${registryRoot} does not exist`);
        this.name = 'RegistryNotFoundError';
    }
}

export default RegistryNotFoundError;
