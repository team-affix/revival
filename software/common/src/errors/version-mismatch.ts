// Error for when a version mismatch occurs
class VersionMismatchError extends Error {
    constructor(expected: string, actual: string, message: string) {
        super(`${message}: expected ${expected}, got ${actual}`);
        this.name = 'VersionMismatchError';
    }
}

export default VersionMismatchError;
