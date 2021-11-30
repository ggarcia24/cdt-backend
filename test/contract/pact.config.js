const path = require("path");

// Please note that depending on what you are using you should consider options
// for pactWith and messagePactWith
module.exports = {
  consumer: "cdt-backend",
  log: path.resolve(process.cwd(), "logs", "pact.log"),
  loglevel: "DEBUG",
  dir: path.resolve(process.cwd(), "test/contract"),
};
