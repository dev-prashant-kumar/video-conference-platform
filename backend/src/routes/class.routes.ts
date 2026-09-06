import { Router } from "express";

import { cancelClass, createClass, getClassById, getRegisteredClasses, joinClass, registerForClass, updateClass } from "../controllers/class.controller";

import { protectRoute } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";
import {
  getClasses,
} from "../controllers/class.controller";

const router = Router();

router.post(
  "/",
  protectRoute,
  authorizeRoles("ADMIN", "INSTRUCTOR"),
  createClass
);
router.get("/", protectRoute, getClasses);

router.get(
  "/registered",
  protectRoute,
  authorizeRoles("STUDENT"),
  getRegisteredClasses
);

router.post(
  "/:id/join",
  protectRoute,
  joinClass
);

router.get("/:id", protectRoute, getClassById);

router.patch(
  "/:id",
  protectRoute,
  authorizeRoles("ADMIN", "INSTRUCTOR"),
  updateClass
);

router.delete(
  "/:id",
  protectRoute,
  authorizeRoles("ADMIN", "INSTRUCTOR"),
  cancelClass
);

router.post(
  "/:id/register",
  protectRoute,
  authorizeRoles("STUDENT"),
  registerForClass
);



export default router;