import { Index } from "./components/views/Index";
import { Projects } from "./components/views/Projects";
import { useProjectStore } from "./stores/project.store";

function App() {
  const status = useProjectStore((state) => state.status);
  return status !== "fulfilled" ? <Index /> : <Projects />;
}

export default App;
