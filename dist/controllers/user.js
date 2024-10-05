import { User } from "../models/user.js";
export const newUser = async (req, res, next) => {
    try {
        // return next(new ErrorHandler('my custom error', 500));
        const { _id, name, email, photo, gender, dob } = req.body;
        const user = await User.create({
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
    }
    catch (error) {
        // return next(error);
        return res.status(400).json({
            success: false,
            message: error,
        });
    }
};
