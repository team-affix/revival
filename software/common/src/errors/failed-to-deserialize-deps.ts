// Error for when we fail to deserialize the dependencies from the binary
class FailedToDeserializeDepsError extends Error {
    constructor(depsRaw: string, message: string) {
        super(`Failed to deserialize deps from '${depsRaw}': ${message}`);
        this.name = 'FailedToDeserializeDepsError';
    }
}

export default FailedToDeserializeDepsError;
