import fs from "fs";
import imagekit from "../configs/imageKit.js";
import Blog from "../models/Blog.js";
import Comment from "../models/Comment.js";
import main from "../configs/gemini.js";

export const addBlog = async (req, res) => {
  try {
    const { title, subTitle, description, category, isPublished } = JSON.parse(req.body.blog);
    const imageFile = req.file;

    if (!title || !description || !category || !imageFile) {
      return res.json({ success: false, message: "Missing Required Fields" });
    }

    const fileBuffer = fs.readFileSync(imageFile.path);

    const response = await imagekit.upload({
      file: fileBuffer,
      fileName: imageFile.originalname,
      folder: "/blogs",
    });

    const optimizedImageUrl = imagekit.url({
      path: response.filePath,
      transformation: [
        { quality: "auto" },
        { format: "webp" },
        { width: "1280" },
      ],
    });

    const created = await Blog.create({
      title,
      subTitle,
      description,
      category,
      image: optimizedImageUrl,
      isPublished: false, // Always start as unpublished until approved
      isApproved: false, // New blogs need approval
      author: req.user._id,
    });

    res.json({ success: true, message: "Blog Submitted Successfully! It will be reviewed by admin before publishing.", blogId: created._id });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getAllBlogs = async(req,res)=>{
    try {
        // Only show approved and published blogs to public
        const blogs = await Blog.find({isPublished: true, isApproved: true}).populate('author','name')
        res.json({ success: true, blogs });
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

export const getMyBlogs = async (req,res) => {
  try {
    const blogs = await Blog.find({ author: req.user._id }).sort({createdAt:-1})
    res.json({ success: true, blogs })
  } catch (error) {
    res.json({success:false,message:error.message})
  }
}

// New function to get pending blogs for admin approval
export const getPendingBlogs = async (req,res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.json({success: false, message: 'Admin access required'})
    }
    const blogs = await Blog.find({isApproved: false}).populate('author','name email').sort({createdAt:-1})
    res.json({ success: true, blogs })
  } catch (error) {
    res.json({success:false,message:error.message})
  }
}

// New function to approve/reject blogs
export const approveBlog = async (req,res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.json({success: false, message: 'Admin access required'})
    }
    
    const {blogId, action, rejectionReason} = req.body;
    const blog = await Blog.findById(blogId);
    
    if (!blog) {
      return res.json({success: false, message: 'Blog not found'})
    }

    if (action === 'approve') {
      blog.isApproved = true;
      blog.approvedBy = req.user._id;
      blog.approvedAt = new Date();
      blog.rejectionReason = undefined;
      await blog.save();
      res.json({ success: true, message: "Blog approved successfully!" });
    } else if (action === 'reject') {
      blog.isApproved = false;
      blog.rejectionReason = rejectionReason || 'No reason provided';
      await blog.save();
      res.json({ success: true, message: "Blog rejected successfully!" });
    } else {
      res.json({ success: false, message: "Invalid action" });
    }
  } catch (error) {
    res.json({success:false,message:error.message})
  }
}

export const getBlogId = async(req,res)=>{
    try {
        const {blogId} = req.params;
        const blog = await Blog.findById(blogId).populate('author','name email')
        if(!blog){
            return res.json({success:false , message:"Blog Not Found"})
        }
        // Only show approved blogs to public
        if (!blog.isApproved && (!req.user || String(blog.author) !== String(req.user._id))) {
          return res.json({success:false, message:"Blog not available"})
        }
        res.json({ success: true, blog });
     } catch (error) {
        res.json({success:false,message:error.message})
    }
}

export const deleteBlogById = async(req,res)=>{
    try {
        const {id} = req.body;
       const blog = await Blog.findById(id)
       if(!blog){
         return res.json({success:false,message:'Blog not found'})
       }
       if(String(blog.author) !== String(req.user._id) && req.user.role !== 'admin'){
         return res.json({success:false,message:'Not allowed'})
       }
       await Blog.findByIdAndDelete(id);

await Comment.deleteMany({blog:id});

        res.json({ success: true, message:"Blog Deleted Successfully" });
     } catch (error) {
        res.json({success:false,message:error.message})
    }
}


export const togglePublish = async (req,res) => {
    try {
        const {id} = req.body;
        const blog = await Blog.findById(id);
        if(!blog){
          return res.json({success:false,message:'Blog not found'})
        }
        if(String(blog.author) !== String(req.user._id) && req.user.role !== 'admin'){
          return res.json({success:false,message:'Not allowed'})
        }
        // Only allow publishing if blog is approved
        if (!blog.isApproved && req.user.role !== 'admin') {
          return res.json({success:false,message:'Blog must be approved before publishing'})
        }
        blog.isPublished = !blog.isPublished;
        await blog.save();
        res.json({ success: true, message:"Blog Status Updated" });
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}
export const addComment = async(req,res)=>{
    try {
        const {blog,name,content} = req.body;
        await Comment.create({blog,name,content})
        res.json({success:true,message:'Comment Added for review'})
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

export const getBlogComments = async (req,res) => {
    try {
        const {blogId} = req.body;
        const comments = await Comment.find({blog:blogId,isApproved:true}).sort({createdAt:-1});
        res.json({ success: true, comments });
    } catch (error) {
         res.json({success:false,message:error.message})
    }
}


export const generateContent = async(req,res)=>{
  try {
    const {prompt} = req.body;
    const content = await main(prompt + 'Generate a blog content for this topic in simple text format')
    res.json({success:true,content})
  } catch (error) {
    res.json({success:false,message:error.message})
  }
}