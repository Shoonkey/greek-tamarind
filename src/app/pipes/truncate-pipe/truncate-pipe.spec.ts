import { TruncatePipe } from './truncate-pipe';

describe('TruncatePipe', () => {
  const examples = {
    bigText: 'I am a very beautiful butterfly!',
    smallText: 'Hello :)',
  };

  let pipe: TruncatePipe;

  beforeEach(() => {
    pipe = new TruncatePipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should fail if `maxChars` <= 0', () => {
    expect(() => pipe.transform(examples.smallText, 0)).toThrow();
  });

  it("should fail if `overflowSuffix`'s length is greater than `maxChars`", () => {
    const overflowSuffix = '____';
    expect(() => pipe.transform(examples.smallText, 2, overflowSuffix)).toThrow();
  });

  it('should not truncate when text is smaller or equal to `maxChars`', () => {
    expect(pipe.transform(examples.smallText, 20)).toBe(examples.smallText);
    expect(pipe.transform(examples.smallText, examples.smallText.length)).toBe(examples.smallText);
  });

  it('should truncate when text is bigger than `maxChars`', () => {
    expect(pipe.transform(examples.bigText, 20)).toBe('I am a very beaut...');
  });

  it('should truncate with custom `overflowSuffix` if one is passed', () => {
    expect(pipe.transform(examples.bigText, 20, '___')).toBe('I am a very beaut___');
  });
});
