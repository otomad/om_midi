const GlobalStyle = createGlobalStyle`
	:root {
		--background-color: black;
		--foreground-color: #8a8a8a;
		--press-color: #636363;
		--accent-color: #2d8ceb;
		--border-color: #2a2a2a;
	}

	*,
	::before,
	::after {
		/* transition: all $ease-out-max 250ms, color $ease-out-max 100ms, fill $ease-out-max 100ms !important; */
		font-family: -apple-system, BlinkMacSystemFont, "Adobe Clean", "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", "Microsoft YaHei UI", sans-serif, system-ui;
		user-select: none;
		box-sizing: border-box;
	}

	:focus,
	:focus-visible {
		outline: none !important;
	}

	html,
	body {
		background-color: var(--background-color);
		color: var(--foreground-color);
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		height: 100vh;
		overflow: hidden;
		transition: none !important;
	}

	#root {
		display: contents;
	}
`;

export default GlobalStyle;
