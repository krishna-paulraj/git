const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

// You can use print statements as follows for debugging, they'll be visible when running tests.
// console.log("Logs from your program will appear here!");

// Uncomment this block to pass the first stage
const command = process.argv[2];
const hash = process.argv[4];

switch (command) {
  case "init":
    createGitDirectory();
    break;
  case "cat-file":
    createObjectDirectory();
    break;
  default:
    throw new Error(`Unknown command ${command}`);
}

// functions
function createGitDirectory() {
  fs.mkdirSync(path.join(process.cwd(), ".git"), { recursive: true });
  fs.mkdirSync(path.join(process.cwd(), ".git", "objects"), {
    recursive: true,
  });
  fs.mkdirSync(path.join(process.cwd(), ".git", "refs"), { recursive: true });
  fs.writeFileSync(
    path.join(process.cwd(), ".git", "HEAD"),
    "ref: refs/heads/main\n",
  );
  console.log("Initialized git directory");
}

function createObjectDirectory() {
  const content = fs.readFileSync(
    path.join(
      process.cwd(),
      ".git",
      "objects",
      hash.slice(0, 2),
      hash.slice(2, hash.length + 1),
    ),
  );

  const res = zlib.inflateSync(content);
  process.stdout.write(res.toString().split("\x00")[1]);
}
