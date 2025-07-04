// Error for when a draft cannot be loaded
class DraftLoadError extends Error {
    constructor(srcPath: string, message: string) {
        super(`Failed to load draft from ${srcPath}: ${message}`);
        this.name = 'DraftLoadError';
    }
}

export default DraftLoadError;
