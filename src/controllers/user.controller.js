import bcrypt from "bcryptjs";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(401)
        .json(new ApiError(401, "Please Provide All User Details"));
    }

    const existedUserCheck = await User.findOne({ email });

    if (existedUserCheck) {
      return res.status(409).json(new ApiError(409, "User Already Exist"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      provider: "local",
    });
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: "strict",
      maxAge: 3600000,
    };

    await user.save();

    res
      .status(201)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(new ApiResponse(201, "User Created SuccessFully", true));
  } catch (error) {
    res
      .status(500)
      .json(new ApiError(500, error.message || "Internal Server Error"));
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(404)
      .json(new ApiError(404, "Please provide All Details"));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json(new ApiError(404, "User not Found"));
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    return res
      .status(401)
      .json(new ApiError(401, "User Entered Wrong Password"));
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  const options = {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 3600000,
  };

  user.refreshToken = refreshToken;

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, "User login SuccessFully", user, true));
};

// const saveDraft = async (req, res) => {
//   const { id, title, content, tags } = req.body;
//   const userId = req.user?._id;

//   if (!title || !content || !tags) {
//     return res
//       .status(400)
//       .json(new ApiError(400, "please provide all details"));
//   }

//   try {
//     if (id) {
//       const updatedDraft = await Blog.findByIdAndUpdate(
//         { id, author: userId },
//         {
//           title,
//           content,
//           tags: tags.split(",").map((tag) => tag.trim()),
//           status: "draft",
//         }
//       );

//       if (!updatedDraft) {
//         res.status(400).json(new ApiError(400, "Draft not Found"));
//       }

//       return res
//         .status(200)
//         .json(new ApiResponse(200, "Draft updated", updatedDraft, true));
//     } else {
//       const createdDraft = await Blog.create({
//         title,
//         content,
//         tags: tags.split(",").map((tag) => tag.trim()),
//         status: "draft",
//         author: userId,
//       });

//       if (!createdDraft) {
//         res
//           .status(400)
//           .json(new ApiError(400, "something went wrong with created Draft"));
//       }

//       return res
//         .status(201)
//         .json(
//           new ApiResponse(
//             201,
//             "Draft Uploded Success Fully",
//             createdDraft,
//             true
//           )
//         );
//     }
//   } catch (error) {
//     console.log(error);

//     return res
//       .status(400)
//       .json(new ApiError(400, "something went wrong in save draft"));
//   }
// };

// const publishArticle = async (req, res) => {
//   const { id, title, content, tags } = req.body;
//   const userId = req.user?._id;

//   if (!title || !content || !tags) {
//     return res
//       .status(400)
//       .json(new ApiError(400, "please provide all details"));
//   }

//   try {
//     if (id) {
//       const publishSavedArticle = await Blog.findByIdAndUpdate(
//         { id, author: userId },
//         {
//           title,
//           content,
//           tags: tags?.split(",").map((tag) => tag.trim()),
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
//         tags: tags?.split(",").map((tag) => tag.trim()),
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

// const getAllBlogs = async (req, res) => {
//   const userId = req.user?._id;
//   try {
//     if (!userId) {
//       return res.status(400).json(new ApiError(500, "user id not found"));
//     }
//     const blogs = await Blog.find({ author: userId }).select("-content -tags");

//     if (!blogs) {
//       return res.status(400).json(new ApiError(500, "no blogs found"));
//     }

//     return res
//       .status(200)
//       .json(new ApiResponse(200, "Get all blogs successFully", blogs, true));
//   } catch (error) {
//     return res
//       .status(400)
//       .json(new ApiError(500, "Something Went Wrong In get Blogs"));
//   }
// };

// const getBlogById = async (req, res) => {
//   const blogId = req.params.id;

//   if (!blogId) {
//     return res.status(400).json(new ApiError(400, "Not getting Blog id"));
//   }

//   const fetchedBlog = await Blog.findById({ blogId });

//   return res
//     .status(200)
//     .json(
//       new ApiResponse(200, "SuccessFully Fetched Blog By Id", fetchedBlog, true)
//     );
// };

export { registerUser, loginUser };
