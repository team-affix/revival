// Error for when a draft is created
class DraftCreateError extends Error {
    constructor(parentDir: string, name: string, message: string) {
        super(`Failed to create draft '${name}' in '${parentDir}': ${message}`);
        this.name = 'DraftCreateError';
    }
}

export default DraftCreateError;
