import express from "express"
import { adminLogin, approveCommentById, deleteCommentById, getAllBlogsAdmin, getAllComments, getDashboard } from "../controllers/adminController.js";
import auth, { requireAdmin } from "../middleware/auth.js";
const adminRouter = express.Router();

adminRouter.post("/login",adminLogin);
adminRouter.get("/comments",auth, requireAdmin , getAllComments)
adminRouter.get("/blogs",auth, requireAdmin ,getAllBlogsAdmin)
adminRouter.post("/delete-comment",auth, requireAdmin ,deleteCommentById)
adminRouter.post("/approve-comment",auth, requireAdmin ,approveCommentById)
adminRouter.get("/dashboard",auth, requireAdmin ,getDashboard)
export default adminRouter
