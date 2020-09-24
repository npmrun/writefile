const readline = require("readline");
const fs = require("fs");
const path = require("path");
const os = require("os");

const rl = readline.createInterface({
  input: fs.createReadStream("./src/.env.test"),
});
console.log(os.homedir());
rl.on("line", (line: string) => {
  console.log(line);
});

rl.on("close", () => {
  console.log("closed");
});
export {}