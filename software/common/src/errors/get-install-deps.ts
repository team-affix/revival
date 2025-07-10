// Error for when installation dependencies cannot be fetched
class GetInstallDepsError extends Error {
    constructor(directDeps: Map<string, string>, message: string) {
        super(`${message}\nDirect dependencies: ${JSON.stringify(Object.fromEntries(directDeps))}`);
        this.name = 'GetInstallDepsError';
    }
}

export default GetInstallDepsError;
