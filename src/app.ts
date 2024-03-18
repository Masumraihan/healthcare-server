import cors from "cors";
import express, { Application, Request, Response } from "express";
import { userRoutes } from "./app/modules/User/user.route";
import { adminRoutes } from "./app/modules/admin/admin.route";

const app: Application = express();
app.use(cors());

// parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.send({
    Message: "health care server....",
  });
});

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/admin", adminRoutes);

export default app;
