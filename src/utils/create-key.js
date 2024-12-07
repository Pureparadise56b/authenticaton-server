const crypto = require("crypto");

// this function is used to generate a new key to verify the request
function createNewKey() {
  crypto.generateKey(
    "hmac",
    {
      length: 1024,
    },
    (err, key) => {
      if (err) {
        console.log("Error while generating key: ", err);
        return;
      }

      const keyString = key.export().toString("hex");

      console.log("New Jwt Key: ", keyString);
    }
  );
}

createNewKey();
