const fs = require('fs');

/* Patch fs.watch to keep a list of watched files */
const watchList = new Set
let timeout;
fs.watch = (watch => (path, ...rest) => {
  watchList.add(path)
  const watcher = watch.call(fs, path, ...rest);
  watcher.close = (close => () => {
    watchList.delete(path)
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      if (watchList.size) {
        console.log(`These paths are still being monitored:`);
        console.log(watchList);
      } else {
        console.log('It should close successfully');
      }
    }, 1000);
    return close.call(watcher);
  })(watcher.close);
  return watcher;
})(fs.watch);


const { watch } = require('chokidar');

const watcher = watch(['test', 'tests', 'test*.*', '**/*.test.*']);

setTimeout(() => {
  console.log('Closing...');
  watcher.close();
}, 1000);

watcher.once('ready', () => {
  console.log('ready fired');
});
