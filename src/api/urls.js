import { Router } from "express";
import { GetUsers, GetChats, GetLogin } from "./handler.js";

const router = Router();

router.use("/getUsers", GetUsers);
router.use("/getChats", GetChats);
router.use("/userlogin", GetLogin);

export { router };
