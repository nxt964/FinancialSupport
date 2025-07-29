import Header from "../components/Header";

export default function DefaultLayout({children}) {
    return (
        <div>
            <Header/>
            <div className="">
                {children}
            </div>
        </div>
    )
}