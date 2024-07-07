"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = require("./app");
const port = process.env.PORT || 8000;
app_1.app.listen(port, () => {
    console.log("[+] Server listening on port: ", port);
});
