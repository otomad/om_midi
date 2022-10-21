(function (React, ReactDOM) {
	'use strict';

	const hello = React.createElement("p", null, "Hello!");

	const root = ReactDOM.createRoot(document.getElementById("root"));
	root.render(hello);

})(React, ReactDOM);
