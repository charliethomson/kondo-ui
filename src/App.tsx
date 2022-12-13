import { Index } from "./components/views/Index";
import { Projects } from "./components/views/Projects";
import { useAppDispatch, useAppSelector } from "./stores";
import { setupListeners } from "./util/receiver";

function App() {
  const status = useAppSelector((state) => state.projects.projects.status);
  const dispatch = useAppDispatch();
  setupListeners(dispatch, useAppSelector);
  return status !== "fulfilled" ? <Index /> : <Projects />;
}

export default App;
