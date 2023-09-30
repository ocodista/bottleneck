const firstFunction = async () => {
  for (let i = 0; i < 1_000_000; i++);
  console.log("Hello");
};

function secondFunction() {
  console.log("World");
}

firstFunction();
secondFunction()