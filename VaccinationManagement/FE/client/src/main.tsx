import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { ThemeProvider } from "@material-tailwind/react";
import "./assets/styles/index.css";
import 'semantic-ui-css/semantic.min.css';


ReactDOM.createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);
