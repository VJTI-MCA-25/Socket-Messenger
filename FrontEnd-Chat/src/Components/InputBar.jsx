import { useState } from "react";

function InputBar(props) {

    const [msg, setMsg] = useState("");

    // displays input onchange input bar
    const handleChange = (e) => {
        setMsg(e.target.value);
    }

    // send the data from child inputBar to RightSide parent
    const handleMesage = (e)=>{
        // prevent reload on submission
        e.preventDefault();
        
        props.onSubmit(msg);

        // after sending clear the input bar
        setMsg("");
    }

    return (
        <div className='mt-1 px-2  rounded-lg bg-slate-500 w-full h-[10%] bottom-0'>
            <form onSubmit={handleMesage} className="w-full h-full flex justify-between items-center">
                <input type="text" value={msg} onChange={handleChange} placeholder='Enter you meassage' className='p-4 rounded-lg h-2/3 w-4/5 font-mono text-white bg-zinc-700 outline-none' />
                <button type="submit" className='text-white font-bold rounded-lg w-1/6 h-2/3 bg-slate-700'>Send</button>
            </form>
        </div>
    )
}

export default InputBar