import React from 'react'
import { assets } from '../../assets/assets'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from '../../components/admin/Sidebar';
import { useAppContext } from '../../context/AppContext';

const Layout = () => {
  
  const {axios,setToken,navigate} =useAppContext()
  const logout = () => {
   localStorage.removeItem('token')
   axios.defaults.headers.common['Authorization'] = null;
   setToken(null)
   navigate('/')
  }

  return (
    <>
      <div className='flex items-center justify-between py-2 h-[70px] px-4 sm:px-12 border-b border-gray-200'>
        <img src={assets.logo} alt="" className='cursor-pointer w-32 sm:w-40' onClick={() => navigate('/')} />
        <button onClick={logout} className='rounded-full text-sm cursor-pointer bg-primary text-white px-10 py-2.5'>Logout</button>
      </div>
      <div className='flex h-[calc(100vh-70px)]'>
      <Sidebar/>
        <Outlet />
      </div>
    </>
  )
}

export default Layout
