import { Route, Routes } from "react-router-dom";
import "./App.css";
import DefaultLayout from "./layouts/DefaultLayout";
import { routes, authRequiredRoutes } from "./utils/routesUtils";
import { Toaster } from "react-hot-toast";
import { ScrollToTop } from "./components/ScrollToTop";
import UserMiddleware from "./middlewares/UserMiddleware";

function App() {
  return (
    <DefaultLayout>
      <ScrollToTop />
      <Toaster position="top-right" reverseOrder={false}/>
      <Routes>
        {/* Default routes */}
        {routes.map((route, index) => {
          const Page = route.element;
          return <Route key={index} path={route.path} element={<Page />} />;
        })}

        {/* Auth Required routes */}
        <Route element={<UserMiddleware/>}>
          {authRequiredRoutes.map((route, index) => {
            const Page = route.element;
            return <Route key={index} path={route.path} element={<Page />}/>;
          })}
        </Route>
        <Route path="*" element={<h1 className="font-bold">404 Page Not Found!</h1>} />
      </Routes>
    </DefaultLayout>
  );
}

export default App;
