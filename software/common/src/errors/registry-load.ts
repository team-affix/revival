// Error for when a registry fails to load
class RegistryLoadError extends Error {
    constructor(cwd: string, message: string) {
        super(`Registry at '${cwd}' failed to load: ${message}`);
        this.name = 'RegistryLoadError';
    }
}

export default RegistryLoadError;
