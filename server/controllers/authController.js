import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'

const signToken = (userId) => jwt.sign({ id: userId }, process.env.JWT_SECRET)

export const register = async (req,res) => {
  try {
    const {name,email,password} = req.body
    if(!name || !email || !password){
      return res.json({success:false,message:'Missing required fields'})
    }
    const existing = await User.findOne({email})
    if(existing){
      return res.json({success:false,message:'Email already registered'})
    }
    const hashed = await bcrypt.hash(password,10)
    const user = await User.create({name,email,password:hashed})
    const token = signToken(user._id)
    res.json({success:true,token,user:{id:user._id,name:user.name,email:user.email,role:user.role}})
  } catch (error) {
    res.json({success:false,message:error.message})
  }
}

export const login = async (req,res) => {
  try {
    const {email,password} = req.body
    const user = await User.findOne({email})
    if(!user){
      return res.json({success:false,message:'Invalid credentials'})
    }
    const ok = await bcrypt.compare(password,user.password)
    if(!ok){
      return res.json({success:false,message:'Invalid credentials'})
    }
    const token = signToken(user._id)
    res.json({success:true,token,user:{id:user._id,name:user.name,email:user.email,role:user.role}})
  } catch (error) {
    res.json({success:false,message:error.message})
  }
}

export const me = async (req,res) => {
  try {
    res.json({success:true,user:req.user})
  } catch (error) {
    res.json({success:false,message:error.message})
  }
}


