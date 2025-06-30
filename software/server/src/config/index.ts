import os from 'os';
import fs from 'fs';
import debug from 'debug';

interface Config {
    port: number;
    registryPath: string;
}

const config: Config = {
    port: Number(process.env.PORT) || 4707,
    registryPath: process.env.REGISTRY_PATH || os.homedir() + '/.apm/registry',
};

export default config;

// Create debugger
const dbg = debug('apm:config');

// If the registry path does not exist, create it
if (!fs.existsSync(config.registryPath)) {
    dbg(`Creating registry path: ${config.registryPath}`);
    fs.mkdirSync(config.registryPath, { recursive: true });
}

dbg(`Config: ${JSON.stringify(config, null, 2)}`);
