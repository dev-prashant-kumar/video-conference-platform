import { Router } from "express";
import { getMe, login, logout, register } from "../controllers/auth.controller";
import { protectRoute } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";

const router = Router();

router.post("/register", register);
router.post("/login",login);
router.post("/logout", logout);

router.get("/me", protectRoute, getMe);


export default router;