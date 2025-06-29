import os from 'os';

interface Config {
    port: number;
    registryPath: string;
}

const config: Config = {
    port: Number(process.env.PORT) || 4707,
    registryPath: process.env.REGISTRY_PATH || os.homedir() + '/.apm/registry',
};

export default config;
