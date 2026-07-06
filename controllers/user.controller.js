import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloud.js";

export const register = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, password, role,  } = req.body;
        if (!fullname || !email || !phoneNumber || !password || !role) {
            return res.status(400).json({ message: "missing required fields", success: false });
        }
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists", success: false });
        }
        const file = req.file;


        const fileUri = getDataUri(file);
        const cloudResponse = await cloudinary.uploader.upload(fileUri.content);

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            fullname,
            email,
            phoneNumber,
            password: hashedPassword,
            role,
            profile: {
            profilePicture : cloudResponse.secure_url,
            },
        });
        await newUser.save();
        return res.status(201).json({ message: `${fullname} registered successfully`, success: true });
    }catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error register", success: false });
    }
}

export const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        if (!email || !password || !role) {
            return res.status(400).json({ message: "missing required fields", success: false });
        }
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials", success: false });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials", success: false });
        }

        if (user.role !== role) {
            return res.status(403).json({
                message: "You don't have the necessary role to access this resource",
                success: false,
            });
        }

        const tokenData = {
            userId: user._id,
        };
        const token = await jwt.sign(tokenData, process.env.JWT_SECRET, { expiresIn: "1d" });


        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        }

return res
            .status(200)
            .cookie("token", token, {
                maxAge: 1 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                sameSite: "none",
                secure: true,
            })
            .json({ message: `Login successful ${user.fullname}`, user, success: true, token });

    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error login failed", success: false });
    }  
}

export const logout = async (req,res) => {
    try {
        return res.status(200).cookie("token", "", { maxAge: 0 }).json({ message: "Logout successful", success: true });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error logout", success: false });
    }
}

export const updateProfile = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, bio, skills } = req.body;
        const file = req.file;
        //cloudinary upload   
        const fileUri = getDataUri(file);
        const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {resource_type: "auto"});


        // 1. Safe parsing of skills string to array
        let skillsArray;
        if (skills && typeof skills === "string") {
            skillsArray = skills.split(",");
        }
        const userId = req.id; //middleware
        let user = await User.findById (userId)
        if (!user){
            return res.status(404).json({
                message : "user not found",
                success : false
            })
        }
        if (fullname) user.fullname = fullname;
        if (email) user.email = email;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (bio) user.profile.bio = bio;
        if (cloudResponse){
            user.profile.resume = cloudResponse.secure_url;
            user.profile.resumeOriginalName = file.originalname;
        }

        if (skillsArray) {
            user.profile.skills = skillsArray;
        }
        await user.save();

        const updatedUser = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile,
        };

        return res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser,
            success: true,
        });
    }catch(err){
        console.log(err)
        res.status(500).json({
            message : "server error update profile",
            success : false
        })
    }
}