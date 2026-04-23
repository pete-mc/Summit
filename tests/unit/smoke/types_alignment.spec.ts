import * as fs from 'fs';
import * as path from 'path';

describe('type package alignment', () => {
  it('keeps @types packages aligned with runtime major versions', () => {
    const packageJsonPath = path.resolve(__dirname, '../../../package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) as {
      devDependencies?: Record<string, string>;
    };

    const devDependencies = packageJson.devDependencies ?? {};

    expect(devDependencies['@types/node']).toMatch(/^\^24\./);
    expect(devDependencies['@types/jest']).toMatch(/^\^29\./);
    expect(devDependencies['@types/react']).toMatch(/^\^18\./);
    expect(devDependencies['@types/react-dom']).toMatch(/^\^18\./);
  });
});
