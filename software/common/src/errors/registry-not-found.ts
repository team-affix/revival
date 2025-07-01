class RegistryNotFoundError extends Error {
    constructor(path: string) {
        super(`Registry root path ${path} does not exist`);
        this.name = 'RegistryNotFoundError';
    }
}

export default RegistryNotFoundError;
