import { Server } from "http";
import app from "./app";
import config from "./config";

const main = async () => {
  const server: Server = app.listen(config.port, () => {
    console.log(`app is listening on port ${config.port}`);
  });

  const existHandler = () => {
    if (server) {
      server.close(() => {
        console.log("Server closed");
      });
      process.exit(1);
    }
  };

  process.on("uncaughtException", (error) => {
    console.log(error);
    existHandler();
  });
  process.on("unhandledRejection", (error) => {
    console.log(error);
    existHandler();
  });
};

main();
