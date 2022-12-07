import { Index } from "./components/views/Index";
import { Projects } from "./components/views/Projects";
import { useAppSelector } from "./stores";

function App() {
  const status = useAppSelector((state) => state.projects.projects.status);
  return status !== "fulfilled" ? <Index /> : <Projects />;
}

export default App;
