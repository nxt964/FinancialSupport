import toast from "react-hot-toast"

export default function Home() {
    const makeToastSuccess = () => toast.success("Successfully!");
    const makeToastError = () => toast.error("Error:...")
    return (
        <div className="p-4 flex flex-col gap-2" >
            <h1>Homepage</h1>
            <button className="w-fit" onClick={makeToastSuccess}>Make toast success</button>
            <button className="w-fit" onClick={makeToastError}>Make toast error</button>
        </div>
    )
}