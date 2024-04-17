import { Server } from "http";
import app from "./app";

const port = 3000;

const main = async () => {
  const server: Server = app.listen(port, () => {
    console.log(`app is listening on port ${port}`);
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
