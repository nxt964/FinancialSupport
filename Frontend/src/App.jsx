import { Route, Routes } from "react-router-dom";
import "./App.css";
import DefaultLayout from "./layouts/DefaultLayout";
import routes from "./utils/routesUtils";
import { Toaster } from "react-hot-toast";
import { ScrollToTop } from "./components/ScrollToTop";

function App() {
  return (
    <DefaultLayout>
      <ScrollToTop />
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        {routes.map((route, index) => {
          const Page = route.element;
          return <Route key={index} path={route.path} element={<Page />} />;
        })}
      </Routes>
    </DefaultLayout>
  );
}

export default App;
