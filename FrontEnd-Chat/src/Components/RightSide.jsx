import React from 'react'
import InputBar from './InputBar';

function Message(props) {
    return (
        <div className='w-full h-auto p-2 px-4 mb-2 flex flex-col rounded-lg bg-slate-800/60 text-white'>
            <div className="text-lg px-2">
                <h1>User</h1>
            </div>

            <div className='max-w-full font-mono rounded-md  p-2 max-h-fit my-2 bg-slate-600'>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. 
                    Eveniet non expedita eligendi repellendus. Ipsum reprehenderit 
                    voluptatem veniam, magni ex, quidem impedit vel, dolorem sunt 
                    earum cupiditate dolores. Perferendis, rerum iure.
                   
                    <br />
                    <br />

                    {props.val}

                    
            </div>
        </div>
    );
}

// main Root window of right side
function RightSide() {
 
    let usrMsg="";
    // get msg from input bar
    const getMessage = (data)=>{
        alert("data from Root : "+data);
    }
    usrMsg=getMessage();
    // console.log(getMessage(usrMsg));


    return (
        <div className='flex flex-col p-1 top-0 z-1 w-4/5 min-w-[500px] h-screen bg-slate-300' >
            {/* Top part */}
            <div className=' flex p-4 items-center justify-between w-full h-[10%] rounded-lg bg-slate-700' >
                <h1 className='text-gray-200'>UserName</h1>
                <input type="text" placeholder='Search' className=' px-5 p-2 text-zinc-200 bg-slate-500 font-mono rounded-lg outline-none' />
            </div>

            {/* lower part */}
            <div className='rounded-lg p-2 mt-1 w-full h-[80%] bg-slate-700 overflow-y-scroll scroll-m-1 '>
                <Message val={getMessage}/>
                {/* <Message />
                <Message />
                <Message />
                <Message />
                <Message /> */}
            </div>
            
            <InputBar onSubmit={getMessage} />
        </div>
    )

}

export default RightSide