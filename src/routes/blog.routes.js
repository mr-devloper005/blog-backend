import express, { Router } from "express";
import {
  getAllBlogs,
  getBlogById,
  publishArticle,
  saveDraft,
} from "../controllers/blog.controller.js";
import verifyJwt from "../middleware/auth.middleware.js";

const blogRouter = Router();

blogRouter.route("/blogs/publish").post(verifyJwt, publishArticle);
blogRouter.route("/blogs").get(verifyJwt, getAllBlogs);
blogRouter.route("/blogs/savedraft").post(verifyJwt, saveDraft);
blogRouter.route("/blogs/:id").get(getBlogById);

export default blogRouter;
