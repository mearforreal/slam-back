import { FilterQuery, ObjectId, QueryOptions } from "mongoose";
import {
  OrderDocument,
  OrderStatus,
  WarehouseChina,
  WarehouseKazakstan,
} from "../models/order.model";
import { QrCodeDocument, QrCodeType } from "../models/qrCode.model";
import TimelineModel, {
  DAYS_HORGOS_TO_BORDER,
  DAYS_TO_URUMQI,
  DAYS_URUMQI_TO_HORGOS,
  TimelineDocument,
  TimelineInput,
  TimelineMsg,
} from "../models/timeline.model";
import {
  findAndUpdateMultipleOrders,
  findAndUpdateOrder,
  findOrder,
  findOrdersByOrderGroup,
} from "./order.service";
import log from "../utils/logger";
import { OrderGroupDocument } from "../models/orderGroup.model";
import dayjs from "dayjs";
import { agenda } from "../utils/agenda";
export interface qrCodeDataInterface {
  orderGroupId: OrderGroupDocument["_id"];
  qrType: QrCodeType;
  warehouse: WarehouseChina | WarehouseKazakstan;
}

export async function createTimeline(
  orders: OrderDocument[],
  msg: string,
  msg_ru: string,
  msg_kz: string,
  sort: number
) {
  try {
    //input.status = TimelineStatus.PENDING;
    // let data = {
    //   status: order.status,
    //   message: msg,
    //   message_ru: msg_ru,
    //   order: order._id,
    // };
    let data: TimelineInput[] = [];

    for (let i = 0; i < orders.length; i++) {
      data.push({
        status: orders[i].status || "",
        message: msg,
        message_ru: msg_ru,
        message_kz: msg_kz,
        sort: sort,
        order: orders[i]._id,
      });
    }

    const result = await TimelineModel.create(data);
    return result;
  } catch (e) {
    throw e;
  }
}

export async function findTimelineOrder(
  query: FilterQuery<OrderDocument>,
  options: QueryOptions = { lean: true }
) {
  try {
    const result = await TimelineModel.find(query, {}, options).sort({
      sort: 1,
    });
    return result;
  } catch (e) {
    throw e;
  }
}

async function createTimelineScheduleJobs(
  schuduleDate: Date,
  orders: OrderDocument[],
  timelineMsg: TimelineMsg,
  sort: number
) {
  let message_cn = "";
  let message_ru = "";
  let message_kz = "";

  switch (timelineMsg) {
    case TimelineMsg.WAREHOUSE_URUMQI:
      message_cn = `货物已达到“9515国际物流有限公司”【乌鲁木齐市】库房`;
      message_ru = `Груз прибыл на склад компании «9515 Международная логистическая компания, ТОО»【город Урумчи】`;
      message_kz = `Жүк "9515 халықаралық логистикалық компания, ЖШС"【Үрімші қаласы】 қоймасына келді.`;
      break;

    case TimelineMsg.HORGOS:
      message_cn = `货物已达到“9515国际物流有限公司”【霍尔果斯口岸】`;
      message_ru = `Груз прибыл на склад компании «9515 Международная логистическая компания, ТОО»【Порт Хоргос】`;
      message_kz = `Жүк "9515 халықаралық логистикалық компания, ЖШС"【Қорғас порты】 қоймасына келді.`;
      break;
    case TimelineMsg.BORDER:
      message_cn = `报关中`;
      message_ru = `В таможенной декларации`;
      message_kz = `Кедендік декларацияда`;
      break;
    default:
      break;
  }

  // scheduleJob(schuduleDate, async function () {
  //   await createTimeline(orders, message_cn, message_ru,message_kz);
  // });

  agenda.schedule(schuduleDate, "create-timeline-china", {
    orders,
    message_cn,
    message_ru,
    message_kz,
    timelineMsg,
    sort,
  });
}

function scheduleWarehouseTranserfer(
  warehouse: WarehouseChina | WarehouseKazakstan,
  crearetedDate: Date,
  orders: OrderDocument[]
) {
  // todo day - sec
  let date_to_horgos = dayjs(),
    date_to_border = dayjs();
  let date_to_horgos_sort = 0;
  let date_to_border_sort = 0;

  if (warehouse === WarehouseChina.URUMQI) {
    date_to_horgos = dayjs(crearetedDate).add(DAYS_URUMQI_TO_HORGOS, "day");
    date_to_border = dayjs(date_to_horgos).add(DAYS_HORGOS_TO_BORDER, "day");
    date_to_horgos_sort = 3;
    date_to_border_sort = date_to_horgos_sort + 1;
  } else if (
    warehouse === WarehouseChina.GUANZHOU ||
    warehouse === WarehouseChina.YIWU
  ) {
    const date_to_urumqi = dayjs(crearetedDate).add(DAYS_TO_URUMQI, "day");
    date_to_horgos = dayjs(date_to_urumqi).add(DAYS_URUMQI_TO_HORGOS, "day");
    date_to_border = dayjs(date_to_horgos).add(DAYS_HORGOS_TO_BORDER, "day");

    createTimelineScheduleJobs(
      date_to_urumqi.toDate(),
      orders,
      TimelineMsg.WAREHOUSE_URUMQI,
      3
    );
    date_to_horgos_sort = 4;
    date_to_border_sort = date_to_horgos_sort + 1;
  } else {
    throw new Error("Not Warehouse in China");
  }

  createTimelineScheduleJobs(
    date_to_horgos.toDate(),
    orders,
    TimelineMsg.HORGOS,
    date_to_horgos_sort
  );
  createTimelineScheduleJobs(
    date_to_border.toDate(),
    orders,
    TimelineMsg.BORDER,
    date_to_border_sort
  );
}
export function getWareHouseNameInMessage(
  warehouse: WarehouseChina | WarehouseKazakstan
) {
  //Заказ прибыл в
  //订单到达
  let message_cn = "";
  let message_ru = "";
  let message_kz = "";
  switch (warehouse) {
    case WarehouseChina.GUANZHOU:
      (message_cn = "广州市"),
        (message_ru = "город Гуанчжоу"),
        (message_kz = "Гуанчжоу қаласы");
      break;
    case WarehouseChina.YIWU:
      (message_cn = "义务市"),
        (message_ru = "город Иу"),
        (message_kz = "Иу қаласы");
      break;
    case WarehouseChina.URUMQI:
      (message_cn = "乌鲁木齐市"),
        (message_ru = "город Урумчи"),
        (message_kz = "Урумчи қаласы");
      break;
    case WarehouseKazakstan.ALMATY:
      (message_cn = "阿拉木图市"),
        (message_ru = "город Алматы"),
        (message_kz = "Алматы қаласы");
      break;
    case WarehouseKazakstan.ASTANA:
      (message_cn = "阿斯塔纳市"),
        (message_ru = "город Астана"),
        (message_kz = "Астана қаласы");
      break;
  }

  return { message_cn, message_ru, message_kz };
}

// todo
export async function createTimeLineAfterScan(
  qrCodeData: QrCodeDocument,
  warehouse: WarehouseChina | WarehouseKazakstan
) {
  const orders = await findOrdersByOrderGroup({
    orderGroup: qrCodeData.orderGroup,
  });
  if (!orders) {
    throw Error;
  }

  // add Timeline

  // todo
  const warehouseMsg = getWareHouseNameInMessage(warehouse);
  const message_cn =
    qrCodeData.type === QrCodeType.CHINA_SIDE
      ? `货物以从“9515国际物流有限公司”【${warehouseMsg.message_cn}】库房发出，在途中`
      : `货物已达到“9515国际物流有限公司”哈萨克斯坦【${warehouseMsg.message_cn}】`;
  const message_ru =
    qrCodeData.type === QrCodeType.CHINA_SIDE
      ? `Груз был отправлен со склада «9515 Международная логистическая компания, ТОО»【${warehouseMsg.message_ru}】`
      : `Груз прибыл в Казахстан, «9515 Международная логистическая компания, ТОО»【${warehouseMsg.message_ru}】`;

  const message_kz =
    qrCodeData.type === QrCodeType.CHINA_SIDE
      ? `Жүк «9515 халықаралық логистикалық компания, ЖШС» қоймасынан жөнелтілді.【${warehouseMsg.message_kz}】`
      : `Жүк Қазақстанға келді, «9515 халықаралық логистикалық компания, ЖШС»【${warehouseMsg.message_kz}】`;

  // if (
  //   qrCodeData.type === QrCodeType.KAZAKHSTAN_SIDE &&
  //   orders[0].status !== OrderStatus.BORDER
  // ) {
  //   console.log(orders[0].status);

  //   throw Error("status not boder");
  // }

  const sort = qrCodeData.type === QrCodeType.CHINA_SIDE ? 2 : 6;

  const timeline = await createTimeline(
    orders,
    message_cn,
    message_ru,
    message_kz,
    sort
  );
  if (
    warehouse === WarehouseChina.URUMQI ||
    warehouse === WarehouseChina.GUANZHOU ||
    warehouse === WarehouseChina.YIWU
  ) {
    scheduleWarehouseTranserfer(warehouse, timeline[0].createdAt, orders);
  }

  return [{ ...timeline }];
  // Socket.emit("QR_SCANNED", {
  //   qrCode: qrCodeData.qrCode,
  //   timeline: [{ ...timeline }],
  // });
}
