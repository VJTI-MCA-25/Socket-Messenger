import React from 'react'

function ChatSelect() {
  return (
    <div className='flex mb-2 flex-row px-2 items-center w-full h-14 bg-slate-200/50 mx-3'>
      <h1 className='text-lg font-mono text-zinc-700'>Hello</h1>     
    </div>
  );  
}


function ProfileIcons(){
  const links=[
    "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",

  ]
  return (
    <div className="icon mb-3 w-14 h-14 rounded-xl bg-slate-400">
      <img src={links} className=' p-1 rounded-xl h-full w-full object-center' alt="image" srcSet="" />
    </div>
  );
}

function SideBar() {
  return (
    // left side bar section only
    <div className='flex p-1 top-0 z-1 left-0 min-w-[300px] w-1/5  h-full bg-slate-500' >
        
        <div className='left-side rounded-lg z-2 p-2 flex items-center flex-col h-full bg-slate-700'>
          <ProfileIcons />
          <ProfileIcons />
        </div>  

        <div className='ml-1 py-4  px-1 rounded-lg w-4/5 h-full z-2 flex flex-col items-center bg-slate-600'>
          <ChatSelect />
          <ChatSelect />
          <ChatSelect />
          <ChatSelect />
          <ChatSelect />
        </div>
    </div>
  )
}

export default SideBar