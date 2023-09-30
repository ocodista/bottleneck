
  let executions = []
  async function measureTime(fn, fnName = 'anonFunction', ...args) {
    const start = performance.now();
    const result = await fn(...args);
    const end = performance.now();
    const duration = end - start;
    executions.push({ name: fnName, duration })
    return result;
  }
const firstFunction = async () => {
    await new Promise(r => setTimeout(r, 2000));
    console.log('Hello');
};
function secondFunction() {
    console.log('World');
}
(async () => {
    await measureTime(firstFunction, 'firstFunction');
    await measureTime(secondFunction, 'secondFunction');
    Bun.write('output.txt', JSON.stringify(executions));
})();