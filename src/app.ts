import express from "express";
// import config from "config";

import connect from "./utils/connect";
import log from "./utils/logger";
import { createServer } from "http";
import routes from "./routes";
import deserializeUser from "./middleware/deserializeUser";
import requireUser from "./middleware/requireUser";
import cors from "cors";

import { io } from "./utils/socket";
import { agenda } from "./utils/agenda";
import { Job, JobAttributes, JobAttributesData } from "agenda";
import { OrderDocument, OrderStatus } from "./models/order.model";
import { TimelineMsg } from "./models/timeline.model";
import { createTimeline } from "./service/timeline.service";
import {
  findAndUpdateMultipleOrders,
  notifyDailyArrivedOrders,
} from "./service/order.service";
import _default from "./config/default";
// import { notifyCustomerSMS } from "./service/customerBarCode.service";

const app = express();

app.use(express.json());
app.use(deserializeUser);
app.use(
  cors({
    origin: "https://1991logistics.com",
    //origin: "http://localhost:3000",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  })
);

app.options(
  "*",
  cors({
    origin: "https://1991logistics.com",
    //origin: "http://localhost:3000",
  })
);

const port = _default.port;
app.set("port", port);
app.use("/qrCode", requireUser);
app.use("/qrCode", express.static("assets"));

const httpServer = createServer(app);

// export const io = new Server(httpServer, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//     allowedHeaders: ["Access-Control-Allow-Origin"],
//     credentials: true,
//   },
//   allowEIO3: true,
// });

io.attach(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Access-Control-Allow-Origin"],
    credentials: true,
  },
  allowEIO3: true,
});

// io.on("connection", (socket) => {
//   logger.info("SOCKET connected");
//   socket.emit("QR_SCANNED", { data: "Hello world" });
// });

interface createTimelineScheduleJobs extends JobAttributes {
  schuduleDate: Date;
  orders: OrderDocument[];
  timelineMsg: TimelineMsg;
}

httpServer.listen(port, async () => {
  log.info("App is running at port: " + port);
  await connect();
  routes(app);

  agenda.define("create-timeline-china", async (job: Job) => {
    if (!job.attrs.data) {
      job.fail("No data passed");
      return;
    }
    if (
      !job.attrs.data.orders &&
      !job.attrs.data.message_cn &&
      !job.attrs.data.message_kz &&
      !job.attrs.data.timelineMsg &&
      !job.attrs.data.message_ru
    ) {
      job.fail("Invalid data passed");
      return;
    }
    const { message_cn, orders, message_kz, message_ru, timelineMsg, sort } =
      job.attrs.data;
    if (timelineMsg === TimelineMsg.BORDER) {
      await findAndUpdateMultipleOrders(
        { orderGroup: orders[0].orderGroup },
        { status: OrderStatus.BORDER },
        { new: true }
      );
    }

    await createTimeline(orders, message_cn, message_ru, message_kz, sort);
  });

  // agenda.define("notify-sms-received-orders", async (job: Job) => {
  //   const orders = await notifyDailyArrivedOrders();

  //   let ordersbarcodes = orders.map((code) => code.barCode);

  //   notifyCustomerSMS({
  //     orders: ordersbarcodes,
  //   });
  // });

  agenda.start();

  await agenda.every("0 14 * * *", "notify-sms-received-orders");

  agenda.on("success:create-timeline-china", (job: Job) => {
    job.remove();
  });

  agenda.on("fail:notify-sms-received-orders", (err, job: Job) => {
    console.log(`Job failed with error: ${err.message}`);
    if (job.attrs.failCount) {
      job.attrs.failCount = job.attrs.failCount + 1;
      if (job.attrs.failCount <= 3) {
        (async () => {
          await agenda.schedule(
            `in 3 hours`,
            "notify-sms-received-orders",
            job.attrs.data
          );
          console.log("Job successfully saved");
        })();
      } else {
        console.log("rretry 4x - cancell the retry");
      }
    }
  });

  agenda.on("fail:create-timeline-china", (err, job: Job) => {
    console.log(`Job failed with error: ${err.message}`);
    if (job.attrs.failCount) {
      job.attrs.failCount = job.attrs.failCount + 1;
      if (job.attrs.failCount <= 3) {
        (async () => {
          await agenda.schedule(
            `in 3 days`,
            "create-timeline-china",
            job.attrs.data
          );
          console.log("Job successfully saved");
        })();
      } else {
        console.log("rretry 4x - cancell the retry");
      }
    }
  });
});
