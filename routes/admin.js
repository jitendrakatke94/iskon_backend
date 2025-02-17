import express from "express";
import {login, registartion, userList} from "../controller/login.js"
import { getEvents, addEvents, updateEvent, deleteEvent, locations } from "../controller/events.js"
// import {addEvents} from ""
const router = express.Router();

router.route("/login").post(login);
router.route("/registration").post(registartion);

router.route("/events").get(getEvents);
router.route("/addEvent").post(addEvents);
router.route("/updateEvent").put(updateEvent);
router.route("/deleteEvent").delete(deleteEvent);
router.route("/locations").get(locations);
router.route("/userList").get(userList);
export default router;