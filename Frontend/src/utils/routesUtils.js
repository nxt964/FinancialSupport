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
import NewsFeed from "../pages/news";
import Details from "../pages/news/Details";
import TradingView from "../pages/tradingview/TradingView";

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
  { path: "/news", element: NewsFeed },
  { path: "/news/:id", element: Details },
  { path: "/trading-view", element: TradingView },
  { path: "/backtest", element: Backtest},
];

export default routes;
