import mongoose from "mongoose";
const schema = new mongoose.Schema({
    _id: {
        type: String,
        required: [true, "Please enter ID"],
    },
    name: {
        type: String,
        required: [true, "Please enter your Name"],
    },
    email: {
        type: String,
        unique: [true, "Email already exists"],
        required: [true, "Please enter your Email"],
    },
    photo: {
        type: String,
        required: [true, "Please add your Photo"],
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    gender: {
        type: String,
        enum: ["male", "female"],
        required: [true, "Please select your Gender"],
    },
    dob: {
        type: Date,
        required: [true, "Please enter your Date of Birth"],
    },
}, {
    timestamps: true,
});
export const User = mongoose.model("User", schema);
