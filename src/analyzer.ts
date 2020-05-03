import stream from 'stream';
import util from 'util';
import { StaticCodeAnalyzer, Transformers, tool } from '@moneyforward/sca-action-core';

const debug = util.debuglog('stylelint-action');

interface Warning {
  line: number;
  column: number;
  rule: string;
  severity: 'warning' | 'error';
  text: string;
}

export interface Result {
  source: string;
  errored: boolean;
  warnings: Warning[];
  deprecations: {
    text: string;
    reference: string;
  }[];
  invalidOptionWarnings: {
    text: string;
  }[];
  ignored: boolean;
}

export type Results = Result[];

export default class Analyzer extends StaticCodeAnalyzer {
  constructor(options: string[] = []) {
    super('npx', ['stylelint'].concat(options).concat(['-f', 'json', '--no-color', '--allow-empty-input']), undefined, 2, undefined, 'stylelint');
  }

  protected async prepare(): Promise<unknown> {
    console.log('::group::Installing packages...');
    try {
      await tool.execute('npm', ['install']);
      await tool.execute('npx', ['stylelint', '--print-config', '.'], undefined, undefined, async child => {
        child.stdout && child.stdout.unpipe(process.stdout);
        const promise = child.stdout ? tool.stringify(child.stdout) : Promise.resolve('');
        child.once('exit', async exitStatus => {
          if (exitStatus === null || exitStatus > 0) {
            const message = await promise;
            console.error('%s', message);
          }
        });
      });
      return Promise.resolve();
    } finally {
      console.log('::endgroup::');
    }
  }

  protected createTransformStreams(): Transformers {
    const buffers: Buffer[] = [];
    return [new stream.Transform({
      readableObjectMode: true,
      transform: function (buffer, _encoding, done): void {
        buffers.push(buffer);
        done();
      },
      flush: function (done): void {
        const text = Buffer.concat(buffers).toString();
        try {
          const results: Results = JSON.parse(text);
          debug(`Detected %d problem(s).`, results.length);
          for (const result of results) for (const warning of result.warnings) this.push({
            file: result.source,
            line: warning.line,
            column: warning.column,
            severity: warning.severity,
            message: warning.text,
            code: warning.rule
          });
          this.push(null);
          done();
        } catch (error) {
          done(new Error(text));
        }
      }
    })];
  }
}
