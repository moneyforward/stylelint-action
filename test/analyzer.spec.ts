import { expect } from 'chai';
import stream from 'stream';
import { Transformers } from '@moneyforward/sca-action-core';
import Analyzer, { Result } from '../src/analyzer'
import { AssertionError } from 'assert';

describe('Transform', () => {
  it('should return the problem object', async () => {
    const expected = {
      file: 'path/to/file.css',
      line: 3,
      column: 12,
      severity: 'error',
      message: 'You should not have an empty block (block-no-empty)',
      code: 'block-no-empty'
    };
    const result: Result = {
      source: 'path/to/file.css',
      errored: true,
      warnings: [{
        line: 3,
        column: 12,
        rule: 'block-no-empty',
        severity: 'error',
        text: 'You should not have an empty block (block-no-empty)'
      }],
      deprecations: [],
      invalidOptionWarnings: [],
      ignored: false
    }
    const text = JSON.stringify([result]);
    const analyzer = new (class extends Analyzer {
      public constructor() {
        super();
      }
      public createTransformStreams(): Transformers {
        return super.createTransformStreams();
      }
    })();
    const [prev, next = prev] = analyzer.createTransformStreams();
    stream.Readable.from(text).pipe(prev).pipe(next);
    for await (const problem of next) {
      expect(problem).to.deep.equal(expected);
      return;
    }
    throw new AssertionError({ message: 'There was no problem to expect.', expected });
  });
});
