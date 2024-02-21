import React from 'react'
import SideBar from './Components/SideBar'
import RightSide from './Components/RightSide'

function App() {
  return (
    <div className='relative flex items-center justify-start w-full max-w-full h-screen bg-black'>
      <SideBar />
      <RightSide />
    </div>
  )
}

export default App