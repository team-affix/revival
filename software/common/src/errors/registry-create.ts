// Error for when a registry cannot be created
class RegistryCreateError extends Error {
    // Constructs a registry create error
    constructor(cwd: string, message: string) {
        super(`Failed to create registry at ${cwd}: ${message}`);
        this.name = 'RegistryCreateError';
    }
}

// Export the error
export default RegistryCreateError;
