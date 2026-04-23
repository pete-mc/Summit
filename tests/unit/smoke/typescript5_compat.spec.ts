import * as fs from 'fs';
import * as path from 'path';

describe('TypeScript 5 toolchain compatibility', () => {
  it('pins the TypeScript toolchain to TS5-compatible major versions', () => {
    const packageJsonPath = path.resolve(__dirname, '../../../package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) as {
      devDependencies?: Record<string, string>;
    };

    const devDependencies = packageJson.devDependencies ?? {};

    expect(devDependencies.typescript).toMatch(/^\^5\./);
    expect(devDependencies['ts-jest']).toMatch(/^\^29\./);
    expect(devDependencies['ts-loader']).toMatch(/^\^9\./);
  });
});
