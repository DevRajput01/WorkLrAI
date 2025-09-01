import { BookA, CodeXmlIcon } from 'lucide-react';
import React, { useState } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import Markdown from 'react-markdown'



axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;




const ReviewResume = () => {
   const [input, setInput] = useState('')
//  const [object, setObject] = useState('')
  const [loading, setLoading]= useState(false)
  const [content, setContent] = useState('')
     
     const {getToken} = useAuth()


    const onSubmitHandler = async(e)=> {
      e.preventDefault();

      try {
        setLoading(true)
  

      const formData = new FormData()
      formData.append('resume', input)
    

    const { data } = await axios.post('/api/ai/resume-review', formData,
      {headers: {Authorization: `Bearer ${await getToken()}`}})


      if( data.success){
        setContent(data.content)
      }else{
        toast.error(data.message)
      }
      setLoading(false)
      } catch (error) {
        toast.error(error.message)
      }
      setLoading(false)
    }
    
  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700'>
         <form  onSubmit={onSubmitHandler}  className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'  >
           <div className='flex items-center gap-3' >
             <CodeXmlIcon className='w-6 text-[#5500fd]' />
             <h1 className='text-xl font-semibold'>Resume Review</h1>
           </div>
           <p className='mt-6 text-sm font-medium'>Upload your Resume</p>
   
           <input onChange={(e)=> setInput(e.target.files[0])}  type='file' accept='application/pdf'  className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 text-gray-600' required />
           
   


<p  className='text-xs text-gray-500 font-light mt-1' >  Supports PDF Resume only</p>


   
   <button disabled={loading} className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#4103bb] to-[#4ade80]
    text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer' > 

    {
      loading ? <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin' ></span> : <BookA className='w-5' /> 
    }
    Review Resume </button>
   </form>
   
   
   
   {/* result area */}
   
  <div className='w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 max-h-[600px]'>
   <div className='flex items-center gap-3' > 
   <BookA className='w-5 h-5 text-[#5500fd]'  />
   <h1 className='text-xl font-semibold' >Analysis Resume</h1>
   </div>

{
  !content ? (
    <div className='flex-1 flex justify-center items-center' >
     <div className='flex-1 flex justify-center items-center gap-5 text-gray-400' >
   <BookA className='w-9 h-9'  />
   <p>Upload your Resume and click "Resume Review" with WorkLr.ai</p>
     </div>
   </div>
  ) : (
    <div className='mt-3 h-full overflow-y-scroll text-sm text-slate-600'>
        <div className='reset-tw'>
  <Markdown>{content || "No analysis generated."}</Markdown>
</div>

    </div>
  )
}
   

         </div>
   
       </div>
  )
}

export default ReviewResume