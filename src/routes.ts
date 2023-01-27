import { Express, Request, Response } from "express";
import {
  createCustomerHandler,
  loginCustomerHandler,
  // getCustomerHandler,
  // sendCodeSMSCustomerHandler,
  // verifyCustomerHandler,
} from "./controller/customer.controller";
import {
  createCustomerBarCodeHandler,
  deleteCustomerBarCodeHandler,
  getCustomerBarCodeFilter,
  getCustomerBarCodeHandler,
} from "./controller/customerBarCode.controller";
import {
  createOrderHandler,
  getOrderFilter,
  getOrderHandler,
  receiveOrderHandler,
  searchOrderHandler,
  updateOrderHandler,
} from "./controller/order.controller";
import {
  createOrderGroupHandler,
  deleteOrderGroupHandler,
  getOrderByOrderGroupHandler,
  getOrderGroupFilter,
  getOrderGroupHandler,
  openOrderGroupOnWebHandler,
} from "./controller/orderGroup.controller";
import {
  calculatorHandler,
  createPriceListHandler,
  deletePriceListHandler,
  getCalculatorHistoryFilterHandler,
  getPriceListFilterHandler,
  getPriceListHandler,
  updatePriceListHandler,
} from "./controller/priceList.controller";
import {
  fetchOrderQrcodesHandler,
  getQrCodeHandler,
  scanAndSearchBarCodeHandler,
  scanQrHandler,
} from "./controller/qrCode.controller";
import {
  createUserSessionHandler,
  deleteSessionHandler,
  getUserSessionsHandler,
} from "./controller/session.controller";
import {
  createTimeLineAfterScanHandler,
  fetchOrderTimelineHandler,
} from "./controller/timeline.controller";
import { createUserHandler } from "./controller/user.controller";
import isVerified from "./middleware/isVerified";
import requireUser from "./middleware/requireUser";
import validateResource from "./middleware/validateResource";
import { WarehouseKazakstan } from "./models/order.model";
import {
  createCustomerSchema,
  verifyCustomerSchema,
  getCustomerBytelephoneSchema,
  sendSmsCustomerSchema,
} from "./schema/customer.schema";
import {
  createCustomerBarCodeSchema,
  deleteCustomerBarCodeSchema,
  getCustomerBarCodeSchema,
  paginateCustomerBarCodeSchema,
  updateCustomerBarCodeSchema,
} from "./schema/customerBarCode.schema";
import {
  createOrderSchema,
  getOrderSchema,
  receiveOrderSchema,
  searchBarCodeOrderSchema,
  updateOrderSchema,
} from "./schema/order.schema";
import {
  createOrderGroupSchema,
  getOrderGroupSchema,
} from "./schema/orderGroup.schema";
import {
  calculatorSchema,
  createPriceListSchema,
  deletePriceListSchema,
  getPriceListSchema,
  updatePriceListSchema,
} from "./schema/priceList.schema";
import {
  createSessioCustomerSchema,
  createSessionSchema,
} from "./schema/session.schema";
import { createTimelineSchema } from "./schema/timeline.schema";
import { createUserSchema } from "./schema/user.schema";
// import { notifyCustomerSMS } from "./service/customerBarCode.service";
// import { sendSmsXML, SMS, SMSType } from "./utils/sms";
function routes(app: Express) {
  app.get("/healthCheck", (req: Request, res: Response) => res.sendStatus(200));
  app.post("/api/users", validateResource(createUserSchema), createUserHandler);
  app.post(
    "/api/sessions",
    validateResource(createSessionSchema),
    createUserSessionHandler
  );

  app.post(
    "/api/customer/register",
    validateResource(createCustomerSchema),
    createCustomerHandler
  );

  app.post(
    "/api/customer/login",
    validateResource(createSessioCustomerSchema),
    loginCustomerHandler
  );

  app.get("/api/sessions", requireUser, getUserSessionsHandler);

  app.get("/api/qrCode/:fileName", getQrCodeHandler);

  app.delete("/api/sessions", requireUser, deleteSessionHandler);

  app.post(
    "/api/orders",
    [requireUser, validateResource(createOrderSchema)],
    createOrderHandler
  );

  app.put(
    "/api/orders/:orderId",
    [requireUser, validateResource(updateOrderSchema)],
    updateOrderHandler
  );

  app.get(
    "/api/orders/:orderId",
    [requireUser, validateResource(getOrderSchema)],
    getOrderHandler
  );

  app.get("/api/orders-filter", requireUser, getOrderFilter);

  app.get("/api/order-qrCodes", requireUser, fetchOrderQrcodesHandler);

  //todo
  app.post("/api/scanned-qr-code", requireUser, scanQrHandler);

  app.get("/api/order-timeline", fetchOrderTimelineHandler);

  app.post(
    "/api/scan-and-search-order",
    [requireUser, validateResource(searchBarCodeOrderSchema)],
    scanAndSearchBarCodeHandler
  );

  //todo
  app.post(
    "/api/create-timeline-afterScan",
    [requireUser, validateResource(createTimelineSchema)],
    createTimeLineAfterScanHandler
  );

  //priceList

  // orderGroup
  // todo
  app.get("/api/orderGroup-filter", requireUser, getOrderGroupFilter);
  app.get("/api/orderGroup/:orderGroupId", requireUser, getOrderGroupHandler);
  app.post(
    "/api/orderGroup",
    [requireUser, validateResource(createOrderGroupSchema)],
    createOrderGroupHandler
  );
  app.get(
    "/api/order-by-orderGroup/:orderGroupId",
    [requireUser, validateResource(getOrderGroupSchema)],
    getOrderByOrderGroupHandler
  );
  app.delete(
    "/api/orderGroup/:orderGroupId",
    requireUser,
    deleteOrderGroupHandler
  );
  app.get(
    "/api/open-orderGroup-on-web/:orderGroupId",
    [requireUser, validateResource(getOrderGroupSchema)],
    openOrderGroupOnWebHandler
  );

  //customer

  //verifyCustomerHandler
  // app.post(
  //   "/api/verify-customer",
  //   [validateResource(verifyCustomerSchema)],
  //   verifyCustomerHandler
  // );

  //sendCodeSMSCustomerHandler
  // app.post(
  //   "/api/sms-customer",
  //   [validateResource(sendSmsCustomerSchema)],
  //   sendCodeSMSCustomerHandler
  // );

  //getCustomerHandler
  // app.get(
  //   "/api/fetch-customer/:telephone",
  //   [validateResource(getCustomerBytelephoneSchema)],
  //   getCustomerHandler
  // );

  //getCustomerHandler
  // app.post("/api/test-customer/:telephone", function (req, res) {
  //   console.log(req.params + "\n" + req.body);
  // });

  // customer barcode

  //createCustomerBarCodeHandler
  app.post(
    "/api/customer-barCode",
    [isVerified, validateResource(createCustomerBarCodeSchema)],
    createCustomerBarCodeHandler
  );

  //updateCustomerBarCodeHandler

  app.put(
    "/api/customer-barCode/:customerBarCodeId",
    [isVerified, validateResource(updateCustomerBarCodeSchema)],
    updatePriceListHandler
  );

  //getCustomerBarCodeHandler

  // todo slma
  app.post(
    "/api/customer-barCode/findOne",
    [isVerified, validateResource(getCustomerBarCodeSchema)],
    getCustomerBarCodeHandler
  );

  //deleteCustomerBarCodeHandler
  // app.delete(
  //   "/api/customer-barCode/:customerId/:customerBarCodeId",
  //   [isVerified, validateResource(deleteCustomerBarCodeSchema)],
  //   deleteCustomerBarCodeHandler
  // );

  //getCustomerBarCodeFilter
  app.get(
    "/api/customer-barCode/paginate/:type",
    [isVerified, validateResource(paginateCustomerBarCodeSchema)],
    getCustomerBarCodeFilter
  );

  // receiveOrder
  app.post(
    "/api/receive-order",
    [requireUser, validateResource(receiveOrderSchema)],
    receiveOrderHandler
  );

  //search
  app.post(
    "/api/search-order",
    [requireUser, validateResource(searchBarCodeOrderSchema)],
    searchOrderHandler
  );

  // app.get("/api/test-sms", [], function (req: any, res: any) {
  //   notifyCustomerSMS({
  //     orderGroup: "637a6d8cc1a740d4d7ae8804",
  //     warehouse: WarehouseKazakstan.ALMATY,
  //   });
  //   // const smsData: SMS = {
  //   //   recipient: "77477334496",
  //   //   text: "test hello world",
  //   //   type: SMSType.REGULAR,
  //   // };
  //   // setTimeout(() => sendSmsXML(smsData), 0);
  //   return res.status(200).send("ok");
  // });
}

export default routes;
