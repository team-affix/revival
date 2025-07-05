// Error for when a direct dependencies file cannot be written
class WriteDepsFileError extends Error {
    constructor(dir: string, message: string) {
        super(`Failed to write dependencies file in ${dir}: ${message}`);
        this.name = 'WriteDepsFileError';
    }
}

export default WriteDepsFileError;
