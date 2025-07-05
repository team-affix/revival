import tarFs from 'tar-fs';
import { Readable, pipeline } from 'stream';
import { promisify } from 'util';

// Bundle models
import * as DraftModule from './draft';
import * as PackageModule from './package';

// Utility function for async pipeline
const pipelineAsync = promisify(pipeline);

// Pack the files into a tar
async function packTar(basePath: string, files: string[]): Promise<Buffer> {
    // Use tar-fs to create the pack stream
    const result = await tarFs.pack(basePath, { entries: files });

    // Pipe the stream contents to a buffer
    return new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        result.on('data', (chunk) => chunks.push(chunk));
        result.on('end', () => resolve(Buffer.concat(chunks)));
    });
}

// Extract a tar
async function extractTar(tar: Buffer, cwd: string): Promise<void> {
    return await pipelineAsync(Readable.from(tar), tarFs.extract(cwd));
}

export type { Draft } from './draft';
export type { Package } from './package';

export const __test__ = {
    packTar,
    extractTar,
    DraftModule,
    PackageModule,
};
