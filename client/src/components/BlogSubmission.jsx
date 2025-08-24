import React, { useRef, useState, useEffect } from 'react'
import { assets, blogCategories } from '../assets/assets'
import Quill from 'quill'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { parse } from 'marked'
import { useNavigate } from 'react-router-dom'

const BlogSubmission = () => {
  const { axios, token } = useAppContext()
  const navigate = useNavigate()
  const [isAdding, setIsAdding] = useState(false)
  const [loading, setLoading] = useState(false)
  const editorRef = useRef(null)
  const quillRef = useRef(null)
  const [image, setImage] = useState(false)
  const [title, setTitle] = useState("")
  const [subTitle, setSubTitle] = useState("")
  const [category, setCategory] = useState('Startup')

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!token) {
      navigate('/admin/login')
    }
  }, [token, navigate])

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setIsAdding(true)

      const blog = {
        title, subTitle,
        description: quillRef.current.root.innerHTML,
        category
      }
      const formData = new FormData()
      formData.append('blog', JSON.stringify(blog))
      formData.append('image', image)
      const { data } = await axios.post('/api/blog/add', formData);
      if (data.success) {
        toast.success(data.message);
        setImage(false)
        setTitle('')
        setSubTitle('')
        quillRef.current.root.innerHTML = ''
        setCategory('Startup')
        // Redirect to user's blog list
        navigate('/my-blogs')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Error submitting blog')
    } finally {
      setIsAdding(false);
    }
  }

  const generateContent = async () => {
    if (!title) {
      return toast.error('Please enter a title')
    }
    try {
      setLoading(true)
      const { data } = await axios.post('/api/blog/generate', { prompt: title })
      if (data.success) {
        quillRef.current.root.innerHTML = parse(data.content)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Error generating content')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, { theme: 'snow' })
    }
  }, [])

  if (!token) {
    return null // Will redirect in useEffect
  }

  return (
    <div className='min-h-screen bg-blue-50/50 py-8'>
      <div className='max-w-4xl mx-auto px-4'>
        <div className='bg-white rounded-lg shadow-lg p-6 md:p-8'>
          <div className='text-center mb-8'>
            <h1 className='text-3xl font-bold text-gray-800 mb-2'>Submit Your Blog</h1>
            <p className='text-gray-600'>Share your thoughts with the world! Your blog will be reviewed by our team before publishing.</p>
          </div>

          <form onSubmit={onSubmitHandler} className='space-y-6'>
            {/* Image Upload */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Blog Thumbnail *</label>
              <label htmlFor="image" className='cursor-pointer'>
                <div className='border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors'>
                  {!image ? (
                    <>
                      <img src={assets.upload_area} alt="Upload" className='mx-auto h-16 mb-2' />
                      <p className='text-gray-600'>Click to upload thumbnail image</p>
                      <p className='text-sm text-gray-500'>PNG, JPG up to 5MB</p>
                    </>
                  ) : (
                    <img src={URL.createObjectURL(image)} alt="Preview" className='mx-auto h-32 rounded' />
                  )}
                </div>
                <input onChange={(e) => setImage(e.target.files[0])} type="file" id='image' hidden required accept="image/*" />
              </label>
            </div>

            {/* Title */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Blog Title *</label>
              <input
                onChange={e => setTitle(e.target.value)}
                value={title}
                type="text"
                placeholder='Enter your blog title'
                required
                className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent'
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Subtitle</label>
              <input
                onChange={e => setSubTitle(e.target.value)}
                value={subTitle}
                type="text"
                placeholder='Enter a subtitle (optional)'
                className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent'
              />
            </div>

            {/* Category */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Category *</label>
              <select
                onChange={e => setCategory(e.target.value)}
                value={category}
                required
                className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent'
              >
                {blogCategories.map((item, index) => (
                  <option key={index} value={item}>{item}</option>
                ))}
              </select>
            </div>

            {/* Content Editor */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Blog Content *</label>
              <div className='relative'>
                <div className='border border-gray-300 rounded-lg'>
                  <div ref={editorRef} className='min-h-[300px] p-4'></div>
                </div>
                {loading && (
                  <div className='absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg'>
                    <div className='w-8 h-8 rounded-full border-2 border-t-primary animate-spin'></div>
                  </div>
                )}
                <button
                  disabled={loading}
                  type='button'
                  onClick={generateContent}
                  className='absolute bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50'
                >
                  {loading ? 'Generating...' : 'Generate with AI'}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className='text-center pt-6'>
              <button
                disabled={isAdding}
                type='submit'
                className='bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isAdding ? 'Submitting...' : 'Submit Blog for Review'}
              </button>
              <p className='text-sm text-gray-600 mt-3'>
                Your blog will be reviewed by our team within 24-48 hours
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default BlogSubmission
