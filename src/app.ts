import cors from "cors";
import express, { Application, Request, Response, NextFunction } from "express";
import router from "./app/routes";
import cron from "node-cron";
import { StatusCodes } from "http-status-codes";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import cookieParser from "cookie-parser";
import { appointmentService } from "./app/modules/appointment/appointment.service";

const app: Application = express();
app.use(cors());

// parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send({
    Message: "health care server....",
  });
});

cron.schedule("* * * * *", () => {
  try {
    appointmentService.cancelUnpaidAppointment();
  } catch (error) {
    console.error(error);
  }
});

app.use("/api/v1", router);

// GLOBAL ERROR HANDLER
app.use(globalErrorHandler);
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: "API NOT FOUND",
    error: {
      path: req.originalUrl,
      message: "Your requested path is not found!",
    },
  });
});

export default app;
