import fs from 'fs';
import path from 'path';

describe('lint stack loads', () => {
  it('loads eslint flat config and preserves TypeScript lint intent', () => {
    const configPath = path.resolve(process.cwd(), 'eslint.config.js');
    expect(fs.existsSync(configPath)).toBe(true);

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const config = require(configPath);

    expect(Array.isArray(config)).toBe(true);

    const sourceConfig = config.find((entry: { files?: string[] }) =>
      entry.files?.includes('src/**/*.ts'),
    );

    expect(sourceConfig).toBeDefined();
    expect(sourceConfig.rules['prettier/prettier']).toBe('error');
    expect(sourceConfig.rules.camelcase).toEqual(['error', { properties: 'never' }]);
  });
});
