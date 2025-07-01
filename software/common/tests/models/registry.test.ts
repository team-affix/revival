import path from 'path';
import os from 'os';
import fs from 'fs';
import Registry from '../../src/models/registry';
import RegistryNotFoundError from '../../src/errors/registry-not-found';

describe('models/registry', () => {
    it('constructor() should throw RegistryNotFoundError if the path does not exist', () => {
        // construct a path that is not a directory
        const registryPath = path.join(os.tmpdir(), 'tmp-registry');

        // ensure the path is not a directory
        if (fs.existsSync(registryPath)) fs.rmSync(registryPath, { recursive: true, force: true });

        // expect an error to be thrown
        expect(() => new Registry(registryPath)).toThrow(RegistryNotFoundError);
    });

    it('constructor() should throw RegistryNotFoundError if the path is not a directory', () => {
        // construct a path that is not a directory
        const registryPath = path.join(os.tmpdir(), 'tmp-registry');

        // create a file in the path (not a directory)
        fs.writeFileSync(registryPath, 'test');

        // expect an error to be thrown
        expect(() => new Registry(registryPath)).toThrow(RegistryNotFoundError);
    });
});
