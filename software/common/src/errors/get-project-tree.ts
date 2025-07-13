// Error for when the project tree cannot be computed
class GetProjectTreeError extends Error {
    constructor(id: string, message: string) {
        super(`${message}\nPackage: ${id}`);
        this.name = 'GetProjectTreeError';
    }
}

export default GetProjectTreeError;
