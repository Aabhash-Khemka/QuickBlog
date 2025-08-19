import bcrypt from 'bcryptjs'
import User from '../models/User.js'

const seedAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD
  const adminName = process.env.ADMIN_NAME || 'Administrator'
  if(!adminEmail || !adminPassword){
    return
  }
  const exists = await User.findOne({email: adminEmail})
  if(exists){
    return
  }
  const hashed = await bcrypt.hash(adminPassword,10)
  await User.create({name: adminName, email: adminEmail, password: hashed, role: 'admin'})
}

export default seedAdmin


