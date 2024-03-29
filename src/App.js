import Login from "./Login";
import React from "react";
import "./index.css";
import Dashboard from "./Dashboard";

const code = new URLSearchParams(window.location.search).get("code");

function App() {
  return code ? <Dashboard code={code} /> : <Login />;
}

export default App;
