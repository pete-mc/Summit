import verticalText from '@/helpers/VerticleText';

describe('verticalText', () => {
  it('transforms text into one character per line', () => {
    expect(verticalText('ABC')).toBe('A\nB\nC\n');
  });

  it('returns empty string when input is empty', () => {
    expect(verticalText('')).toBe('');
  });
});
