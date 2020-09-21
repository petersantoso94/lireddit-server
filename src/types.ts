import { Request, Response } from "express";
import { Redis } from "ioredis";

export type IContext = {
  req: Request;
  res: Response;
  redis: Redis;
};
