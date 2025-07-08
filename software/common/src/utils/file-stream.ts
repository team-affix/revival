// import * as fs from 'fs/promises';

// // Utility function to read a slice of a file
// export async function readFileSlice(filePath: string, start: number, length: number): Promise<Buffer> {
//     const file = await fs.open(filePath, 'r');

//     return new Promise((resolve, reject) => {
//         const stream = fs.createReadStream(filePath, {
//             start,
//             end: start + length - 1,
//         });

//         const chunks: Buffer[] = [];

//         stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
//         stream.on('end', () => resolve(Buffer.concat(chunks)));
//         stream.on('error', reject);
//     });
// }
