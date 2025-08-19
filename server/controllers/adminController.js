import jwt from 'jsonwebtoken'
import Blog from '../models/Blog.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';


export const  adminLogin = async(req,res)=>{
    try {
        // Backward compatibility endpoint; delegate to user login if matches admin
        const {email,password} = req.body;
        return res.redirect(307, '/api/auth/login')
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}
export const getAllBlogsAdmin = async(req,res)=>{
    try {
        const blogs = await Blog.find({}).sort({createdAt:-1}).populate('author','name email');
        res.json({success:true,blogs})
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}
export const getAllComments = async(req,res)=>{
    try {
        const comments = await Comment.find({}).populate("blog").sort({createdAt:-1});
        res.json({success:true,comments});
    } catch (error) {
        res.json({success:false,message:error.message});
    }
}
export const getDashboard = async(req,res)=>{
    try {
        const recentBlogs = await Blog.find({}).sort({createdAt:-1}).limit(5).populate('author','name email');
        const blogs = await Blog.countDocuments();
        const comments = await Comment.countDocuments()
        const drafts = await Blog.countDocuments({isPublished:false})
        const users = await User.countDocuments()

        const dashboardData = {
            blogs, comments , drafts , users , recentBlogs
        }
        res.json({success:true,dashboardData})
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}
export const deleteCommentById = async(req,res)=>{
 try {
    const {id} = req.body;
    await Comment.findByIdAndDelete(id);
    res.json({success:true,message:"Comment deleted succesfully"})
 } catch (error) {
    res.json({success:false,message:error.message})
 }
}
export const approveCommentById = async(req,res)=>{
 try {
    const {id} = req.body;
    await Comment.findByIdAndUpdate(id,{isApproved:true});
    res.json({success:true,message:"Comment Approved succesfully"})
 } catch (error) {
    res.json({success:false,message:error.message})
 }
}