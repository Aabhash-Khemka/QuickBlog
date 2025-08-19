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
      isPublished,
      author: req.user._id,
    });

    res.json({ success: true, message: "Blog Added Successfully", blogId: created._id });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getAllBlogs = async(req,res)=>{
    try {
        const blogs = await Blog.find({isPublished:true}).populate('author','name')
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

export const getBlogId = async(req,res)=>{
    try {
        const {blogId} = req.params;
        const blog = await Blog.findById(blogId).populate('author','name email')
        if(!blog){
            return res.json({success:false , message:"Blog Not Found"})
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