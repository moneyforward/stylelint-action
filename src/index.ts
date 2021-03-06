import fs from 'fs';
import stream from 'stream';
import util from 'util';
import Command from '@moneyforward/command';
import { analyzer } from '@moneyforward/code-review-action';
import StaticCodeAnalyzer from '@moneyforward/sca-action-core';
import { transform } from '@moneyforward/stream-util';

type AnalyzerConstructorParameter = analyzer.AnalyzerConstructorParameter;

const debug = util.debuglog('@moneyforward/code-review-action-stylelint-plugin');

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

export default abstract class Analyzer extends StaticCodeAnalyzer {
  constructor(...args: AnalyzerConstructorParameter[]) {
    super('npx', ['stylelint'].concat(args.map(String)).concat(['-f', 'json', '--no-color', '--allow-empty-input']), undefined, exitStatus => exitStatus === 0 || exitStatus === 2, undefined, 'stylelint');
  }

  protected async prepare(): Promise<void> {
    console.log('::group::Installing packages...');
    try {
      const [command, args] = fs.existsSync('yarn.lock') ? ['yarn', ['--frozen-lockfile']] : ['npm', ['ci']];
      await Command.execute(command, args);
    } finally {
      console.log('::endgroup::');
    }
  }

  protected createTransformStreams(): stream.Transform[] {
    return [
      new transform.JSON(),
      new stream.Transform({
        objectMode: true,
        transform: function (results: Results, encoding, done): void {
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
        }
      })
    ];
  }
}
