import React, { useEffect, useState } from 'react'
import { dummyCreationData } from '../assets/assets'
import { Crown, Sparkles } from 'lucide-react'
import { Protect, useAuth } from '@clerk/clerk-react'
import CreationItem from '../components/CreationItem'
import axios from 'axios'
import toast from 'react-hot-toast'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;




const Dashboard = () => {
  const [creations, setCreations] = useState([])
  const [loading, setLoading]= useState(true)
//const [content, setContent] = useState('')

const {getToken} = useAuth()

  const getDashboardData = async () => {
    //setCreations(dummyCreationData)

    try {
      const {data} = await axios.get('/api/user/get-user-creations', {
        headers: {Authorization: `Bearer ${await getToken()}`}
      })

      if(data.success){
        setCreations(data.creations)
      }else {
        toast.error(data.message)
      }
    } catch (error) {
       toast.error(error.message)
    }
    setLoading(false)
  }

  useEffect(() => {
    getDashboardData()
  }, [])

  return (
    <div className='h-full overflow-y-scroll p-6'>
      <div className='flex justify-start gap-4 flex-wrap'>
        
        {/* Total Creations card */}
        <div className='flex justify-between items-center w-72 p-4 px-6 bg-white rounded-xl border border-gray-200 cursor-pointer'>
          <div className='text-slate-600'>
            <p className='text-sm'>Total Creations</p>
            <h2 className='text-xl font-semibold'>{creations.length}</h2>
          </div>
          <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-[#8c52ff] to-[#4103bb] flex justify-center items-center'>
            <Sparkles className='w-5 text-white' />
          </div>
        </div>

        {/* Active Plan card */}
        <div className='flex justify-between items-center w-72 p-4 px-6 bg-white rounded-xl border border-gray-200 cursor-pointer'>
          <div className='text-slate-600'>
            <p className='text-sm'>Active Plan</p>
            <h2 className='text-xl font-semibold'>
              <Protect plan='premium' fallback='free'>
                Premium
              </Protect>
            </h2>
          </div>
          <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-[#8c52ff] to-[#ff00e2] flex justify-center items-center'>
            <Crown className='w-5 text-white' />
          </div>
        </div>
      </div>

      {/* Recent Creations */}

      {
        loading ? (
          <div className="flex justify-center items-center h-3/4">
  <div className="w-12 h-12 rounded-full border-4 border-transparent animate-spin 
                  bg-gradient-to-tr from-purple-500 via-pink-500 to-yellow-500 
                  bg-[length:200%_200%]"></div>
</div>

        ) : (
          <div className='space-y-3'>
        <p className='mt-6 mb-4'>Recent Creations</p>
        {creations.map((item) => (
          <CreationItem key={item.id} item={item} />
        ))}
      </div>
        )
      }
      
    </div>
  )
}

export default Dashboard
