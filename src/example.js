const firstFunction = async () => {
  await new Promise((r) => setTimeout(r, 2000));
  console.log("Hello");
};

function secondFunction() {
  console.log("World");
}

const thirdFunction = () => {
  for (let i = 10_000_000; i > 0; i--);
};
(async () => {
  await firstFunction();
  secondFunction();
  thirdFunction();
})();
