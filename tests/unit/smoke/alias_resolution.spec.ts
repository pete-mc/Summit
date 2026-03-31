import HasPropAtPath from '@/helpers/HasPropAtPath';

describe('alias resolution', () => {
  it('resolves @/* imports to src/*', () => {
    const target = { a: { b: 'value' } };

    expect(HasPropAtPath(target, 'a.b', 'value')).toBe(true);
  });
});
