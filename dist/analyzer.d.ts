import { StaticCodeAnalyzer, Transformers } from '@moneyforward/sca-action-core';
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
export declare type Results = Result[];
export default class Analyzer extends StaticCodeAnalyzer {
    constructor(options?: string[]);
    protected prepare(): Promise<unknown>;
    protected createTransformStreams(): Transformers;
}
export {};
