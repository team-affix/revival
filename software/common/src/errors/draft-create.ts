// Error for when a draft is created
class DraftCreateError extends Error {
    constructor(dest: string, name: string, message: string) {
        super(`Failed to create draft '${name}' at '${dest}': ${message}`);
        this.name = 'DraftCreateError';
    }
}

export default DraftCreateError;
