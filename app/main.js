const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const crypto = require("crypto");
const { defaultMaxListeners } = require("events");
const { spawn } = require("child_process");

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
  case "ls-tree":
    {
      const flag = process.argv[3];
      const treeSHA = process.argv[4];

      if (flag === "--name-only") {
        readTree(treeSHA);
      } else {
        throw new Error(`unknown flag ${flag}`);
      }
    }
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

function readTree(sha) {
  const file = fs.readFileSync(
    path.join(".git", "objects", sha.slice(0, 2), sha.slice(2)),
  );

  const decompressedFile = zlib.inflateSync(file).toString();

  decompressedFile.split(" ");

  let names = decompressedFile
    .split("\x00")
    .filter(
      (ele) =>
        ele.includes("100644") ||
        ele.includes("100755") ||
        ele.includes("120000") ||
        ele.includes("40000"),
    )
    .map((y) => y.split(" ")[1]);

  names.map((ele) => process.stdout.write(`${ele}\n`));
}
