import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
    title: {type:String,required:true},
    subTitle: {type:String},
    description: {type:String,required:true},
    category: {type:String,required:true},
    image: {type:String,required:true},
    isPublished: {type:Boolean,required:true},
    isApproved: {type:Boolean, default: false}, // New field for admin approval
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Admin who approved
    approvedAt: { type: Date }, // When it was approved
    rejectionReason: { type: String }, // Reason if rejected

},{timestamps:true});

const Blog = mongoose.model('blog',blogSchema)

export default Blog; 