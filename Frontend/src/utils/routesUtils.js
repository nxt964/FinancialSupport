import Home from "../pages/Home";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import ConfirmEmail from "../pages/auth/ConfirmEmail";
import ThankYou from "../pages/auth/ThankYou";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPasswordConfirm from "../pages/auth/ResetPasswordConfirm";
import ResetPassword from "../pages/auth/ResetPassword";
import Profile from "../pages/auth/Profile";
import EditProfile from "../pages/auth/EditProfile";
import EditPassword from "../pages/auth/EditPassword";
import NewsFeed from "../pages/news";
import Details from "../pages/news/Details";
import MultiCharts from "../pages/charts/MultiCharts";
import FullChart from "../pages/charts/FullChart";
import { Navigate } from "react-router-dom";
import RedirectToDefaultChart from "../components/charts/RedirectToDefaultChart";
import Backtest from "../pages/backtest/Backtest";

const routes = [
  { path: "/", element: Home },
  { path: "/auth/login", element: Login },
  { path: "/auth/signup", element: Signup },
  { path: "/auth/confirm-email", element: ConfirmEmail },
  { path: "/auth/thank-you", element: ThankYou },
  { path: "/auth/forgot-password", element: ForgotPassword },
  { path: "/auth/reset-password-confirm", element: ResetPasswordConfirm },
  { path: "/auth/reset-password", element: ResetPassword },
  { path: "/profile", element: Profile },
  { path: "/edit-profile", element: EditProfile },
  { path: "/edit-password", element: EditPassword },
  { path: "/news", element: NewsFeed },
  { path: "/news/:id", element: Details },
  { path: "/multi-charts", element: MultiCharts },
  { path: "/chart", element: RedirectToDefaultChart},
  { path: "/chart/:symbol/:interval", element: FullChart },
  { path: "/backtest", element: Backtest},
];

export default routes;
