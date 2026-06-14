/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *       "Login": Login,
}
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
import Login from './pages/Login';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *       "Login": Login,
}
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import ABTesting from './pages/ABTesting';
import Analytics from './pages/Analytics';
import Approvals from './pages/Approvals';
import Calendar from './pages/Calendar';
import Campaigns from './pages/Campaigns';
import Competitors from './pages/Competitors';
import CreatePost from './pages/CreatePost';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Influencers from './pages/Influencers';
import Library from './pages/Library';
import LivePosts from './pages/LivePosts';
import PlatformSetup from './pages/PlatformSetup';
import Predictions from './pages/Predictions';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import SmartInbox from './pages/SmartInbox';
import SocialListening from './pages/SocialListening';
import Subscription from './pages/Subscription';
import TeamManagement from './pages/TeamManagement';
import Templates from './pages/Templates';
import __Layout from './Layout.jsx';
import Login from './pages/Login';


export const PAGES = {
    "ABTesting": ABTesting,
    "Analytics": Analytics,
    "Approvals": Approvals,
    "Calendar": Calendar,
    "Campaigns": Campaigns,
    "Competitors": Competitors,
    "CreatePost": CreatePost,
    "Dashboard": Dashboard,
    "Home": Home,
    "Influencers": Influencers,
    "Library": Library,
    "LivePosts": LivePosts,
    "PlatformSetup": PlatformSetup,
    "Predictions": Predictions,
    "Reports": Reports,
    "Settings": Settings,
    "SmartInbox": SmartInbox,
    "SocialListening": SocialListening,
    "Subscription": Subscription,
    "TeamManagement": TeamManagement,
    "Templates": Templates,
    "Login": Login,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};