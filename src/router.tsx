import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import { Preferences } from "./components/views/preferences/Index";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  { path: "/preferences", element: <Preferences /> },
]);
