import mongoose, { mongo } from "mongoose";

const connectDb = async()=>{
    try{
        mongoose.connection.on('connected',()=>console.log("DataBase Connected"))
       await mongoose.connect(`${process.env.MONGODB_URI}/quickblog`)
    }catch(error){
      console.log(error.message);
    }
}
export default connectDb