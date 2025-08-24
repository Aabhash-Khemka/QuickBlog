import React, { useState, useEffect } from 'react'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'
import { assets } from '../../assets/assets'

const PendingBlogs = () => {
  const { axios } = useAppContext()
  const [pendingBlogs, setPendingBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [rejectionReason, setRejectionReason] = useState('')
  const [selectedBlog, setSelectedBlog] = useState(null)

  useEffect(() => {
    fetchPendingBlogs()
  }, [])

  const fetchPendingBlogs = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get('/api/blog/pending')
      if (data.success) {
        setPendingBlogs(data.blogs)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Error fetching pending blogs')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (blogId) => {
    try {
      const { data } = await axios.post('/api/blog/approve', {
        blogId,
        action: 'approve'
      })
      if (data.success) {
        toast.success(data.message)
        fetchPendingBlogs() // Refresh the list
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Error approving blog')
    }
  }

  const handleReject = async (blogId) => {
    if (!rejectionReason.trim()) {
      return toast.error('Please provide a reason for rejection')
    }

    try {
      const { data } = await axios.post('/api/blog/approve', {
        blogId,
        action: 'reject',
        rejectionReason: rejectionReason.trim()
      })
      if (data.success) {
        toast.success(data.message)
        setRejectionReason('')
        setSelectedBlog(null)
        fetchPendingBlogs() // Refresh the list
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Error rejecting blog')
    }
  }

  const openRejectModal = (blog) => {
    setSelectedBlog(blog)
    setRejectionReason('')
  }

  const closeRejectModal = () => {
    setSelectedBlog(null)
    setRejectionReason('')
  }

  if (loading) {
    return (
      <div className='flex-1 bg-blue-50/50 flex items-center justify-center'>
        <div className='w-8 h-8 rounded-full border-2 border-t-primary animate-spin'></div>
      </div>
    )
  }

  return (
    <div className='flex-1 bg-blue-50/50 text-gray-600 h-full overflow-scroll p-6'>
      <div className='max-w-6xl mx-auto'>
        <div className='bg-white rounded-lg shadow-lg p-6'>
          <div className='flex items-center justify-between mb-6'>
            <h1 className='text-2xl font-bold text-gray-800'>Pending Blog Reviews</h1>
            <div className='text-sm text-gray-500'>
              {pendingBlogs.length} blog{pendingBlogs.length !== 1 ? 's' : ''} pending review
            </div>
          </div>

          {pendingBlogs.length === 0 ? (
            <div className='text-center py-12'>
              <img src={assets.blog_icon} alt="No blogs" className='w-16 h-16 mx-auto mb-4 opacity-50' />
              <h3 className='text-lg font-medium text-gray-600 mb-2'>No pending blogs</h3>
              <p className='text-gray-500'>All submitted blogs have been reviewed!</p>
            </div>
          ) : (
            <div className='space-y-4'>
              {pendingBlogs.map((blog) => (
                <div key={blog._id} className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'>
                  <div className='flex items-start gap-4'>
                    <img 
                      src={blog.image} 
                      alt={blog.title} 
                      className='w-20 h-20 object-cover rounded-lg flex-shrink-0'
                    />
                    <div className='flex-1 min-w-0'>
                      <h3 className='text-lg font-semibold text-gray-800 mb-1 line-clamp-2'>{blog.title}</h3>
                      {blog.subTitle && (
                        <p className='text-gray-600 mb-2 line-clamp-1'>{blog.subTitle}</p>
                      )}
                      <div className='flex items-center gap-4 text-sm text-gray-500 mb-3'>
                        <span>By: {blog.author.name}</span>
                        <span>Category: {blog.category}</span>
                        <span>Submitted: {new Date(blog.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className='flex items-center gap-3'>
                        <button
                          onClick={() => handleApprove(blog._id)}
                          className='bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium'
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => openRejectModal(blog)}
                          className='bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium'
                        >
                          Reject
                        </button>
                        <a
                          href={`/blog/${blog._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className='text-primary hover:underline text-sm'
                        >
                          Preview Blog
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Rejection Modal */}
      {selectedBlog && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg p-6 max-w-md w-full'>
            <h3 className='text-lg font-semibold text-gray-800 mb-4'>Reject Blog</h3>
            <p className='text-gray-600 mb-4'>
              Please provide a reason for rejecting "<strong>{selectedBlog.title}</strong>":
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder='Enter rejection reason...'
              className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent mb-4'
              rows={3}
            />
            <div className='flex gap-3 justify-end'>
              <button
                onClick={closeRejectModal}
                className='px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(selectedBlog._id)}
                className='bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors'
              >
                Reject Blog
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PendingBlogs
