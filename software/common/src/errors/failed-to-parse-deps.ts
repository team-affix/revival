// Define an error for when a deps.txt file fails to parse
class FailedToParseDepsError extends Error {
    constructor(message: string) {
        super(`Failed to parse deps.txt: ${message}`);
        this.name = 'FailedToParseDeps';
    }
}

export default FailedToParseDepsError;
