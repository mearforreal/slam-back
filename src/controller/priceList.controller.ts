import { Request, Response } from "express";
import { CargoType } from "../models/priceList.model";
import {
  CalculatorInput,
  CreatePriceListInput,
  UpdatePriceListInput,
} from "../schema/priceList.schema";
import {
  createCalculator,
  findFilterCalculators,
} from "../service/calculator.service";
import {
  calculator,
  CalculatorInterface,
  createPriceList,
  deletePriceList,
  findAndUpdatePriceList,
  findFilterPriceLists,
  findPriceList,
  getDensity,
} from "../service/priceList.service";

import log from "../utils/logger";

export async function createPriceListHandler(
  req: Request<{}, {}, CreatePriceListInput["body"]>,
  res: Response
) {
  try {
    const userId = res.locals.user._id;

    const body = req.body;

    const priceList = await createPriceList({ ...body });

    return res.send(priceList);
  } catch (error: any) {
    log.error(error);
    if (error.name === "MongoServerError" && error.code === 11000) {
      // Duplicate username
      return res.status(422).send({ succes: false, message: "条码已存在！！" });
    }

    return res.status(500).send("出错");
  }
}

export async function updatePriceListHandler(
  req: Request<UpdatePriceListInput["params"]>,
  res: Response
) {
  const userId = res.locals.user._id;

  const priceListId = req.params.priceListId;
  const update = req.body;

  const priceList = await findPriceList({ priceListId });

  if (!priceList) {
    return res.sendStatus(404);
  }

  const updatedPriceList = await findAndUpdatePriceList(
    { priceListId },
    update,
    {
      new: true,
    }
  );

  return res.send(updatedPriceList);
}

export async function getPriceListHandler(
  req: Request<UpdatePriceListInput["params"]>,
  res: Response
) {
  const id = req.params.priceListId;
  const priceList = await findPriceList({ _id: id });

  if (!priceList) {
    return res.sendStatus(404);
  }

  const result = {
    data: priceList,
  };

  return res.send(result);
}

export async function deletePriceListHandler(
  req: Request<UpdatePriceListInput["params"]>,
  res: Response
) {
  const userId = res.locals.user._id;
  const priceListId = req.params.priceListId;

  const priceList = await findPriceList({ priceListId });

  if (!priceList) {
    return res.sendStatus(404);
  }
  await deletePriceList({ priceListId });

  return res.sendStatus(200);
}

export async function getPriceListFilterHandler(req: Request, res: Response) {
  const { page = 1, limit = 12, cargo_type = CargoType.BIG_CARGO } = req.query;

  if (
    typeof page === "string" &&
    typeof limit === "string" &&
    typeof cargo_type === "string" &&
    parseInt(page) >= 0
  ) {
    const priceLists = await findFilterPriceLists(
      parseInt(limit),
      parseInt(page),
      cargo_type
    );
    return res.send({ data: priceLists });
  }
  return res.sendStatus(400);
}

export async function calculatorHandler(
  req: Request<{}, {}, CalculatorInput["body"]>,
  res: Response
) {
  try {
    const ip = req.socket.remoteAddress;
    const density = getDensity(req.body);
    const response = await calculator(req.body);
    if (!ip) {
      return res.send({ data: "Ошибка", status: 500 });
    }

    if (!response) {
      createCalculator({
        ...req.body,
        ip,
        result: "无法计算",
        density: density,
      });
      return res.send({ data: "Ошибка", status: 500 });
    }
    createCalculator({
      ...req.body,
      ip,
      result: response.result.toString(),
      density: response.density,
    });
    return res.send({ data: response.result.toString(), status: 200 });
  } catch (error) {
    log.error(error);
    return res.sendStatus(500);
  }
}

export async function getCalculatorHistoryFilterHandler(
  req: Request,
  res: Response
) {
  const { page = 1, limit = 12 } = req.query;

  if (
    typeof page === "string" &&
    typeof limit === "string" &&
    parseInt(page) >= 0
  ) {
    const calculatorHistories = await findFilterCalculators(
      parseInt(limit),
      parseInt(page)
    );
    return res.send({ data: calculatorHistories });
  }
  return res.sendStatus(400);
}
