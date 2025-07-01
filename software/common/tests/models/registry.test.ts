import path from 'path';
import os from 'os';
import fs from 'fs';
import { expect, describe, it, beforeEach } from '@jest/globals';
import Registry from '../../src/models/registry';
import RegistryNotFoundError from '../../src/errors/registry-not-found';

describe('models/registry', () => {
    const registryPath = path.join(os.tmpdir(), 'tmp-registry');

    beforeEach(() => {
        // remove the registry if it exists
        if (fs.existsSync(registryPath)) fs.rmSync(registryPath, { recursive: true, force: true });
    });

    it('constructor() should throw RegistryNotFoundError if the path does not exist', () => {
        // expect an error to be thrown
        expect(() => new Registry(registryPath)).toThrow(RegistryNotFoundError);
    });

    it('constructor() should throw RegistryNotFoundError if the path is not a directory', () => {
        // create a file in the path (not a directory)
        fs.writeFileSync(registryPath, 'test');

        // expect an error to be thrown
        expect(() => new Registry(registryPath)).toThrow(RegistryNotFoundError);
    });

    it('constructor() should succeed if the path is a directory', () => {
        // create a directory in the path
        fs.mkdirSync(registryPath);

        // expect no error to be thrown
        expect(() => new Registry(registryPath)).not.toThrow();
    });
});
