const firstFunction = async () => {
  await new Promise((r) => setTimeout(r, 2000));
  console.log("Hello");
};

function secondFunction() {
  console.log("World");
}

(async () => {
  await firstFunction();
  secondFunction();
})();
