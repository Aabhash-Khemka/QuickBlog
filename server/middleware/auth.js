import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const auth = async (req , res , next) =>{
 const token = req.headers.authorization;

 if(!token){
  return res.json({success:false,message:"No token provided"})
 }

 try {
    const decoded = jwt.verify(token,process.env.JWT_SECRET)
    if(!decoded?.id){
      return res.json({success:false,message:"Invalid token payload"})
    }
    const user = await User.findById(decoded.id).select('-password')
    if(!user){
      return res.json({success:false,message:"User not found"})
    }
    req.user = user
    next();

 } catch (error) {
    res.json({success:false,message:"Invalid Token"})
 }
}

export const requireAdmin = (req,res,next)=>{
  if(!req.user || req.user.role !== 'admin'){
    return res.json({success:false,message:'Admin access required'})
  }
  next();
}

export default auth