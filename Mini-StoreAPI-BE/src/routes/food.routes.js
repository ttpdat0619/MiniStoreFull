import expess from "express";
import * as foodController from "../controllers/food.controller";
import { authorize, verifyToken } from "../middleware/auth.middleware";

const router = expess.Router();

//==========ROUTES TO GET ALL FOOD ITEM==========
router.get(
    "/",
    [verifyToken, authorize(["Admin", "Manager"])],
    foodController.getAllFoodItems
);

//==========ROUTES TO GET FOODITEM BY ID==========
router.get(
    "/:foodId",
    [verifyToken, authorize(["Admin", "Manager"])],
    foodController.getFoodItemById
);

export default router;