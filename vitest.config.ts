import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        dir: 'src',
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: ['node_modules/', 'dist/', '**/*.test.ts', '**/*.spec.ts'],
        },
    },
});
