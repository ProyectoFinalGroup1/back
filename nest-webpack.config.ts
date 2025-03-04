import * as cryptoBrowserify from 'crypto-browserify';
import * as streamBrowserify from 'stream-browserify';
import * as buffer from 'buffer';
import * as util from 'util';

const webpackConfig = (options: any) => {
  return {
    ...options,
    resolve: {
      ...options.resolve,
      fallback: {
        crypto: cryptoBrowserify,
        stream: streamBrowserify,
        buffer: buffer,
        util: util,
      },
    },
  };
};

export default webpackConfig;
