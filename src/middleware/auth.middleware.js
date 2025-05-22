import jwt, { decode } from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";

const verifyJwt = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      return res.status(400).json(new ApiError(400, "AccessToken Missing"));
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (!decodedToken) {
      return res.status(400).json(new ApiError(400, "Invalid accessToken"));
    }

    req.user = decodedToken;

    next();
  } catch (error) {
    console.log(error.message);

    return res
      .status(400)
      .json(new ApiError(400, "Invalid accessToken or token missing"));
  }
};

export default verifyJwt;
