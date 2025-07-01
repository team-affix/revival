// Define an error for when a deps.txt file fails to parse
class FailedToParseDeps extends Error {
    constructor(message: string) {
        super(`Failed to parse deps.txt: ${message}`);
        this.name = 'FailedToParseDeps';
    }
}

export default FailedToParseDeps;
