const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const crypto = require("crypto");

// You can use print statements as follows for debugging, they'll be visible when running tests.
// console.log("Logs from your program will appear here!");

// Uncomment this block to pass the first stage
const command = process.argv[2];

switch (command) {
  case "init":
    createGitDirectory();
    break;
  case "cat-file":
    createObjectDirectory();
    break;
  case "hash-object":
    createHashObject();
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
  const hash = process.argv[4];
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

function createHashObject() {
  const file = process.argv[4];
  const size = fs.readFileSync(file).length;
  const sha1 = crypto.createHash("sha1");
  sha1.update(`blob ${size}\0${fs.readFileSync(file).toString()}`);
  const hash = sha1.digest("hex");

  const objectDir = path.join(".git", "objects", hash.slice(0, 2));
  const objectFile = path.join(objectDir, hash.slice(2));

  fs.mkdirSync(path.join(objectDir), {
    recursive: true,
  });

  const content = zlib.deflateSync(
    `blob ${size}\0${fs.readFileSync(file).toString()}`,
  );

  fs.writeFileSync(objectFile, content);

  process.stdout.write(hash);
}
