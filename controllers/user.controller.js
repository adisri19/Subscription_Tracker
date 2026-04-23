import user from "../models/user.model.js";
export const getUsers =async (req, res, next) => {
    try {
        const users = await user.find();
        res.status(200).json({
            success: true,
            message: "Users retrieved successfully",
            data: users
        });
    } catch (error) {
        next(error);
    }
};
export const getUser =async (req, res, next) => {
    try {
        const users = await user.findById(req.params.id).select("-password");
        if (!users) {       
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({
            success: true,
            message: "User retrieved successfully",
            data: users
        });
    } catch (error) {
        next(error);
    }
};
