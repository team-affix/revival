// Error for when a direct dependencies file cannot be read
class ReadDepsFileError extends Error {
    constructor(dir: string, message: string) {
        super(`Failed to read dependencies file in ${dir}: ${message}`);
        this.name = 'ReadDepsFileError';
    }
}

export default ReadDepsFileError;
