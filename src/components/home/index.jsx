import React from 'react'
import { useAuth } from '../../contexts/authContext'

const Home = () => {
    const { user } = useAuth()
    return (
        <div className='text-2xl font-bold pt-14'>Hello {user?.displayName || user?.email || 'User'}, you are now logged in.</div>
    )
}

export default Home