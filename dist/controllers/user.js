import { User } from "../models/user.js";
import ErrorHandler from "../utils/utitlity-class.js";
import { TryCatch } from "../middlewares/error.js";
export const newUser = TryCatch(async (req, res, next) => {
    const { _id, name, email, photo, gender, dob } = req.body;
    let user = await User.findById(_id);
    if (user) {
        return res.send(200).json({
            suceess: true,
            message: `Welcome ${user.name}`,
        });
    }
    if (!_id && !name && !email && photo && !gender && dob)
        return next(new ErrorHandler("Please add all fields", 400));
    user = await User.create({
        _id,
        name,
        email,
        photo,
        gender,
        dob,
    });
    return res.status(201).json({
        success: true,
        message: `Welcome, ${user.name}`,
    });
});
export const getAllUsers = TryCatch(async (req, res, next) => {
    const users = await User.find({});
    return res.status(200).json({
        success: true,
        data: users,
    });
});
