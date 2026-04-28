import { createBrowserRouter } from "react-router";
import MainPage from "./pages/MainPage";
import ConfigPage from "./pages/ConfigPage";
import SearchPage from "./pages/SearchPage";
import AddBookPage from "./pages/AddBookPage";
import LibraryPage from "./pages/LibraryPage";
import FavoritesPage from "./pages/FavoritesPage";
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: MainPage,
  },
  {
    path: "/library",
    Component: LibraryPage,
  },
  {
    path: "/config",
    Component: ConfigPage,
  },
  {
    path: "/search",
    Component: SearchPage,
  },
  {
    path: "/add-book",
    Component: AddBookPage,
  },
  {
    path: "/favorites",
    Component: FavoritesPage,
  },
  {
    path: "/profile",
    Component: ProfilePage,
  },
  {
    path: "*",
    Component: NotFoundPage,
  },
]);
