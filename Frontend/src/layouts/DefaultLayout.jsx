import Header from "../components/Header";

export default function DefaultLayout({children}) {
    return (
        <div className="flex flex-col h-screen">
            <Header/>
            <div className="flex-1 min-h-0">
                {children}
            </div>
        </div>
    )
}