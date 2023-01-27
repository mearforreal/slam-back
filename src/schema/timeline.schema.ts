import { object, number, string, TypeOf, nativeEnum } from "zod";
import { WarehouseChina, WarehouseKazakstan } from "../models/order.model";
import { QrCodeType } from "../models/qrCode.model";

const payload = {
  body: object({
    qrId: string({
      required_error: "qrId is required",
    }),
    warehouse: nativeEnum({ ...WarehouseChina, ...WarehouseKazakstan }),
  }),
};

export const createTimelineSchema = object({
  ...payload,
});

export type CreateTimelineInput = TypeOf<typeof createTimelineSchema>;
