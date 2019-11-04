import React from "../node_modules/react/umd/react.production.min.js";
import ReactDOM from "../node_modules/react-dom/umd/react-dom.production.min.js";

(async () => {
  const {
    Panel
  } = await import("./Panel");
  const {
    Button
  } = await import("./Button");
  const root = document.getElementById('root');
  ReactDOM.render(React.createElement("div", null, React.createElement(Panel, null), React.createElement(Button, null, "Direct")), root);
})();
//# sourceMappingURL=index.js.map