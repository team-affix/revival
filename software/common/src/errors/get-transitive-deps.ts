// Error for when transitive dependencies cannot be fetched
class GetTransitiveDepsError extends Error {
    constructor(directDeps: Map<string, string>, message: string) {
        super(`${message}\nDirect dependencies: ${JSON.stringify(Object.fromEntries(directDeps))}`);
        this.name = 'GetTransitiveDepsError';
    }
}

export default GetTransitiveDepsError;
