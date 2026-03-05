import express from "express";
import * as formulaController from "../controllers/formula.controller";
import { authorize, verifyToken } from "../middleware/auth.middleware";

const router = express.Router();

//==========ROUTES TO GET FORMULA BY FOODID==========
router.get(
    "/:foodId",
    [verifyToken, authorize(["Admin"])],
    formulaController.getFormulaByFoodId
);

//==========ROUTES TO CREATE FORMULA==========
router.post(
    "/Create-Formula",
    [verifyToken, authorize(["Admin"])],
    formulaController.createFormula
);

//=========ROUTES TO UPDATE FORMULA========
router.put(
    "/:foodId",
    [verifyToken, authorize(["Admin"])],
    formulaController.updateFormula
);

export default router;