import { glob } from 'glob';
import * as tarFs from 'tar-fs';
import { Readable, pipeline } from 'stream';
import { promisify } from 'util';

// Utility function for async pipeline
const pipelineAsync = promisify(pipeline);

// Pack the files into a tar
async function packTar(cwd: string, files: string[]): Promise<Buffer> {
    // Use tar-fs to create the pack stream
    const result = await tarFs.pack(cwd, { entries: files });

    // Pipe the stream contents to a buffer
    return new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        result.on('data', (chunk) => chunks.push(chunk));
        result.on('end', () => resolve(Buffer.concat(chunks)));
    });
}

// Extract a tar
async function extractTar(cwd: string, tar: Buffer): Promise<void> {
    return await pipelineAsync(Readable.from(tar), tarFs.extract(cwd));
}

// A source type, which is just a directory of source files
export class Source {
    private constructor(
        private cwd: string,
        private agdaFiles: string[],
        private mdFiles: string[],
    ) {}

    // Create a source from a cwd
    static async load(cwd: string): Promise<Source> {
        // Get the agda files
        const agdaFiles = await glob('**/*.agda', { cwd, nodir: true });

        // Get the md files
        const mdFiles = await glob('**/*.md', { cwd, nodir: true });

        // Return the source
        return new Source(cwd, agdaFiles, mdFiles);
    }

    // Create a source from a payload
    static async extract(cwd: string, payload: Buffer): Promise<Source> {
        // Extract the payload
        await extractTar(cwd, payload);

        // Return the source
        return Source.load(cwd);
    }

    // Pack the source into a payload
    static async pack(source: Source): Promise<Buffer> {
        // Concatenate the agda files and the md files
        const files = [...source.getAgdaFiles(), ...source.getMdFiles()];

        // Pack the files into a tar
        return await packTar(source.getCwd(), files);
    }

    // Get the cwd of the source
    getCwd(): string {
        return this.cwd;
    }

    // Get the agda files of the source
    getAgdaFiles(): string[] {
        return this.agdaFiles;
    }

    // Get the md files of the source
    getMdFiles(): string[] {
        return this.mdFiles;
    }
}

export const __test__ = {
    packTar,
    extractTar,
};
