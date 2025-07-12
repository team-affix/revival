// Error for when the project tree cannot be computed
class GetProjectTreeError extends Error {
    constructor(directDeps: Map<string, string>, message: string) {
        super(`${message}\nDirect dependencies: ${JSON.stringify(Object.fromEntries(directDeps))}`);
        this.name = 'GetProjectTreeError';
    }
}

export default GetProjectTreeError;
