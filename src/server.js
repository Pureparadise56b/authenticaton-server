const WebApplication = require("./app");
const { PORT, DB_URL } = require("./variables");

const webApplication = new WebApplication(PORT);

webApplication.start(() => {
  console.log(`Authentication Server started at port: ${PORT}`);
}, DB_URL);
