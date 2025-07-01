module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'js'],
    testMatch: ['<rootDir>/tests/**/*.test.ts'],
    globals: {
        // 'ts-jest': {
        //     tsconfig: 'tsconfig.json',
        // },
    },
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
    },
};
