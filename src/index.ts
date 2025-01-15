import fs from "node:fs";
import { MariaDBHandler } from "./providers/mariadb";

const handler = new MariaDBHandler();
handler.init().then(() => {
    handler.mainLoop().then();
});
