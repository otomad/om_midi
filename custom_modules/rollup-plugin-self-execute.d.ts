import type { Plugin } from 'rollup';

declare function selfExecute(options: { [key: string]: string }): Plugin;

export default selfExecute;
