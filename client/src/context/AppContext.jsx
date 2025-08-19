import { createContext, useContext } from "react"
import axios from "axios"
import {useNavigate} from 'react-router-dom'
import toast from "react-hot-toast";
import { useState , useEffect } from "react";
axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const AppContext = createContext();

export const AppProvider = ({children})=>{
const navigate = useNavigate()
const [token, setToken] = useState(null)
const [user, setUser] = useState(null)
const [blogs, setBlogs] = useState([])
const [input, setInput] = useState("")

const fetchBlogs = async(req,res)=>{
    try {
      const {data} =  await axios.get('/api/blog/all')
      data.success ? setBlogs(data.blogs) : toast.error(data.message)
    } catch (error) {
        toast.error(error.message)
    }
}
useEffect(() => {
  fetchBlogs();
  const token = localStorage.getItem('token')
  if(token){
    setToken(token);
    axios.defaults.headers.common['Authorization'] = `${token}`;
    axios.get('/api/auth/me').then(({data})=>{
      if(data.success){
        setUser(data.user)
      }
    }).catch(()=>{})
  }
}, [])

   const value = {
    axios,navigate,token,setToken,blogs,setBlogs,input,setInput,user,setUser
   }
   
    return (


        <AppContext.Provider value={value}>
            {children}
            </AppContext.Provider>
    )
}
export const useAppContext = ()=>{
    return useContext(AppContext)
};