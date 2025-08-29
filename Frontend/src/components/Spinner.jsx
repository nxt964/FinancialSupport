const Spinner = ({ width = 6, height = 6 }) => {
    return (
        <div className="flex justify-center items-center h-full w-full">
            <div className={`w-${width} h-${height} border-2 border-[var(--color-Line)] border-t-[var(--color-PrimaryColor)] rounded-full animate-spin`}></div>
        </div>
    );
}

export default Spinner