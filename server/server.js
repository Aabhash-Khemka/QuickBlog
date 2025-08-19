import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import connectDb from './configs/db.js';
import adminRouter from './routes/adminRoutes.js';
import blogRouter from './routes/blogRoutes.js';
import authRouter from './routes/authRoutes.js';
import seedAdmin from './configs/seedAdmin.js';


const app =express();

await connectDb()
await seedAdmin()

app.use(cors())
app.use(express.json())
//Routes
app.get('/',(req,res)=>res.send("API is working"))
app.use('/api/admin',adminRouter)
app.use('/api/blog',blogRouter)
app.use('/api/auth',authRouter)


const PORT = process.env.PORT || 3000;

app.listen(PORT , ()=>{
    console.log('Server is Running on pORT ' + PORT)
})



export default app ;