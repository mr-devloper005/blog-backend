import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Blog } from "../models/blog.model.js";

const saveDraft = async (req, res) => {
  const { id, title, content, tags } = req.body;
  const userId = req.user?._id;

  if (!title || !content || !tags) {
    return res
      .status(400)
      .json(new ApiError(400, "please provide all details"));
  }

  try {
    if (id) {
      console.log(id);
      const updatedDraft = await Blog.findOneAndUpdate(
        { _id: id },
        {
          title,
          content,
          tags: tags.split(",").map((tag) => tag.trim()),
          status: "draft",
        }
      );

      if (!updatedDraft) {
        return res.status(400).json(new ApiError(400, "Draft not Found"));
      }

      return res
        .status(200)
        .json(new ApiResponse(200, "Draft updated", updatedDraft, true));
    } else {
      const createdDraft = await Blog.create({
        title,
        content,
        tags: tags.split(",").map((tag) => tag.trim()),
        status: "draft",
        author: userId,
      });

      if (!createdDraft) {
        res
          .status(400)
          .json(new ApiError(400, "something went wrong with created Draft"));
      }

      return res
        .status(201)
        .json(
          new ApiResponse(
            201,
            "Draft Uploded Success Fully",
            createdDraft,
            true
          )
        );
    }
  } catch (error) {
    console.log(error);

    return res
      .status(400)
      .json(new ApiError(400, "something went wrong in save draft"));
  }
};
const publishArticle = async (req, res) => {
  const { id, title, content, tags } = req.body;
  const userId = req.user?._id;

  if (!title || !content || !tags) {
    return res
      .status(400)
      .json(new ApiError(400, "please provide all details"));
  }

  try {
    if (id) {
      const publishSavedArticle = await Blog.findOneAndUpdate(
        { _id: id, author: userId },
        {
          title,
          content,
          tags: tags?.split(",").map((tag) => tag.trim()),
          status: "published",
        }
      );

      if (!publishSavedArticle) {
        return res
          .status(400)
          .json(new ApiError(400, "can not publish article"));
      }

      return res.status(200).json(new ApiResponse(200, publishSavedArticle));
    } else {
      console.log();
      const newPublishArticle = await Blog.create({
        title,
        content,
        tags: tags?.split(",").map((tag) => tag.trim()),
        status: "published",
        author: userId,
      });

      if (!newPublishArticle) {
        return res
          .status(400)
          .json(new ApiError(400, "Can not publish article"));
      }

      return res
        .status(201)
        .json(
          new ApiResponse(
            201,
            "Article published successfully",
            newPublishArticle
          )
        );
    }
  } catch (error) {
    console.log(error);

    console.log("hello hi");

    return res
      .status(500)
      .json(new ApiError(500, "Something Went Wrong In Publish Article"));
  }
};

// const publishArticle = async (req, res) => {
//   const { id, title, content, tags } = req.body;
//   const userId = req.user?._id;

//   console.log(id, title, content, tags)

//   if (!title || !content || !tags) {
//     return res
//       .status(400)
//       .json(new ApiError(400, "please provide all details"));
//   }

//   const parsedTags =
//     typeof tags === "string"
//       ? tags.split(",").map((tag) => tag.trim())
//       : Array.isArray(tags)
//       ? tags.map((tag) => tag.trim())
//       : [];

//   try {
//     if (id) {
//       const publishSavedArticle = await Blog.findByIdAndUpdate(
//         { id, author: userId },
//         {
//           title,
//           content,
//           tags: parsedTags,
//           status: "published",
//         }
//       );

//       if (!publishSavedArticle) {
//         return res
//           .status(400)
//           .json(new ApiError(400, "can not publish article"));
//       }

//       return res.status(200).json(new ApiResponse(200, publishSavedArticle));
//     } else {
//       const newPublishArticle = await Blog.create({
//         title,
//         content,
//         tags: parsedTags,
//         status: "published",
//         author: userId,
//       });

//       if (!newPublishArticle) {
//         return res
//           .status(400)
//           .json(new ApiError(400, "Can not publish article"));
//       }

//       return res
//         .status(201)
//         .json(
//           new ApiResponse(
//             201,
//             "Article published successfully",
//             newPublishArticle
//           )
//         );
//     }
//   } catch (error) {
//     console.log(error);

//     return res
//       .status(400)
//       .json(new ApiError(500, "Something Went Wrong In Publish Article"));
//   }
// };

const getAllBlogs = async (req, res) => {
  const userId = req.user?._id;
  try {
    if (!userId) {
      return res.status(500).json(new ApiError(500, "user id not found"));
    }
    const blogs = await Blog.find({ author: userId }).select("-content -tags");

    if (!blogs) {
      return res.status(400).json(new ApiError(500, "no blogs found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "Get all blogs successFully", blogs, true));
  } catch (error) {
    return res
      .status(400)
      .json(new ApiError(500, "Something Went Wrong In get Blogs"));
  }
};

const getBlogById = async (req, res) => {
  const blogId = req.params;

  const id = blogId.id;

  if (!id) {
    return res.status(400).json(new ApiError(400, "Not getting Blog id"));
  }

  const fetchedBlog = await Blog.findById(id);

  return res
    .status(200)
    .json(
      new ApiResponse(200, "SuccessFully Fetched Blog By Id", fetchedBlog, true)
    );
};

export { saveDraft, publishArticle, getAllBlogs, getBlogById };
