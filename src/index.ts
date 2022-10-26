import Root from "./components/Root";
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.scss";
import ripple from "./modules/ripple";
import CSHelper from "./modules/CSHelper";

CSHelper.updateThemeColor();
const rootDom = document.getElementById("root");
const root = ReactDOM.createRoot(rootDom);
root.render(React.createElement(Root));
ripple();
document.oncontextmenu = e => e.preventDefault();
