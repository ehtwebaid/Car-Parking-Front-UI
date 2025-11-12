import { CustomDateStrPipe } from './custom-date-str.pipe';

describe('CustomDateStrPipe', () => {
  it('create an instance', () => {
    const pipe = new CustomDateStrPipe();
    expect(pipe).toBeTruthy();
  });
});
