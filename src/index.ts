import Root from "./components/Root";
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.scss";
import ripple from "./modules/ripple";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(React.createElement(Root));

ripple();
