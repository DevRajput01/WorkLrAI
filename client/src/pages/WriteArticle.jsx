import React, { useState } from 'react'
import { CodeXml, Edit, Edit2Icon } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react';
import Markdown from 'react-markdown';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const WriteArticle = () => {
const articleLength = [
  {length:800, text: 'Short (500-800 word)'},
  {length:1200, text: 'Medium (800-1200 word)'},
  {length:1600, text: 'Long (1200+ word)'}
]


const [selectedLength, setSelectedLength] = useState(articleLength[0])
const [input, setInput] = useState('')
const [loading, setLoading]= useState(false)
const [content, setContent] = useState('')

const {getToken} = useAuth()



const onSubmitHandler = async(e)=> {
  e.preventDefault();
  try {
    setLoading(true)
    const prompt =  `Write an article about ${input} in ${selectedLength.text}`
    const {data} = await axios.post('/api/ai/generate-article', {prompt,
       length:selectedLength.length}, {
        headers:{Authorization:`Bearer ${await getToken()} `}
       })

       if(data.success){
        setContent(data.content)
       }else{
        toast.error(data.message)
       }


  } catch (error) {
     toast.error(data.message)
  }
  setLoading(false)
}

  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700'>
      <form  onSubmit={onSubmitHandler}  className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'  >
        <div className='flex items-center gap-3' >
          <CodeXml className='w-6 text-[#4a7aff]' />
          <h1 className='text-xl font-semibold'>Article Configuration</h1>
        </div>
        <p className='mt-6 text-sm font-medium'> Article Topic</p>
        <input onChange={(e)=> setInput(e.target.value)} value={input}  type="text" className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300' placeholder='The future of AI is.....' required />
        <p className='mt-4 text-sm font-medium'>Article length</p>
<div className='mt-3 flex gap-3 flex-wrap sm:max-w-9/11'  >
  {articleLength.map((item, index)=> (
    <span onClick={()=> setSelectedLength(item)} className={`text-xs px-4 py-1 border rounded-full cursor-pointer ${selectedLength.text === item.text ? 'bg-green-50 text-green-700 ' :'text-gray-500 border-gray-300'} `} key={index} >{item.text}</span>
  ) )}
</div>
<br />
<button disabled={loading}  className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#4103bb] to-[#4ade80]
 text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer'> 
 {
  loading ? <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin" ></span>
  :  <Edit className='w-5' />
 }
 Generate Article </button>

</form>



      <div className='w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 max-h-[600px]'>
<div className='flex items-center gap-3' > 
<Edit2Icon className='w-5 h-5 text-[#4a7aff]'  />
<h1 className='text-xl font-semibold' >Generated Article</h1>
</div>


{!content ? (
  <div className='flex-1 flex justify-center items-center' >
  <div className='flex-1 flex justify-center items-center gap-5 text-gray-400' >
<Edit2Icon className='w-9 h-9'  />
<p>Enter a topic and click "Geneerate Article" with WorkLr.ai</p>
  </div>
</div>

) : (
  <div className='mt-3 h-full overflow-y-scroll text-sm text-slate-600' >
    <div className='reset-tw' >
      <Markdown>{content}</Markdown>
    </div>

  </div>
)}
      </div>

    </div>
  )
}

export default WriteArticle