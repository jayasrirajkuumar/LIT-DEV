import { Router } from "express";
import {
  getAddresses,
  getAddress,
  postAddress,
  patchAddress,
  removeAddress,
} from "../controllers/addressController.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAzureAuth, attachDbUser } from "../middleware/authMiddleware.js";
import {
  validateBody,
  validateParams,
  createAddressBodySchema,
  updateAddressBodySchema,
  addressIdParamSchema,
} from "../middleware/validateRequest.js";

const router = Router();

router.use(requireAzureAuth, attachDbUser);

router.get("/", asyncHandler(getAddresses));
router.get("/:id", validateParams(addressIdParamSchema), asyncHandler(getAddress));
router.post("/", validateBody(createAddressBodySchema), asyncHandler(postAddress));
router.patch(
  "/:id",
  validateParams(addressIdParamSchema),
  validateBody(updateAddressBodySchema),
  asyncHandler(patchAddress),
);
router.delete(
  "/:id",
  validateParams(addressIdParamSchema),
  asyncHandler(removeAddress),
);

export default router;
