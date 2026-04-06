import { createBrowserRouter } from "react-router";
import MainPage from "./pages/MainPage";
import ConfigPage from "./pages/ConfigPage";
import SearchPage from "./pages/SearchPage";
import AddBookPage from "./pages/AddBookPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: MainPage,
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
]);
