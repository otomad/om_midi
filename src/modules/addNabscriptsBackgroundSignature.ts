
/** 
 * Draw some random rectangles (position, size, color, alpha) on the window background
 */
export default function addNabscriptsBackgroundSignature(window: Window) {
	const SOLID_COLOR = window.graphics.BrushType.SOLID_COLOR;
	
	const whiteBrush = window.graphics.newBrush(SOLID_COLOR, [1, 1, 1, 1]);
	const rand = Math.random() * 0.25;
	const bgBrush = window.graphics.newBrush(SOLID_COLOR, [rand, rand, rand, 1]);
	window.graphics.backgroundColor = bgBrush;
	// window.gr.aboutPnl.graphics.backgroundColor = whiteBrush;

	window.layout.layout(true); // to get window bounds
	
	
	const numRect = 24;
	const minOpacity = 0.05;
	const maxOpacity = 0.15;

	const leftEdge = 0;
	const topEdge = 0;
	const rightEdge = window.windowBounds.width;
	const bottomEdge = window.windowBounds.height;

	for (let i = 0; i < numRect; i++) {
		const xLoc = 10 + (rightEdge - 20) * Math.random();
		const yLoc = 10 + (bottomEdge - 20) * Math.random();
		const width = 5 + 15 * Math.random();
		const height = 5 + 15 * Math.random();
		const borderWidth = 1 + 4 * Math.random();
		const borderColor = [Math.random(), Math.random(), Math.random(), minOpacity + (maxOpacity - minOpacity) * Math.random()];

		const colorBrush = window.graphics.newBrush(SOLID_COLOR, borderColor);

		const g1 = window.add("group", [xLoc, yLoc, xLoc + width, yLoc + borderWidth]);
		const g2 = window.add("group", [xLoc, yLoc + height - borderWidth, xLoc + width, yLoc + height]);
		const g3 = window.add("group", [xLoc, yLoc + borderWidth, xLoc + borderWidth, yLoc + height - borderWidth]);
		const g4 = window.add("group", [xLoc + width - borderWidth, yLoc + borderWidth, xLoc + width, yLoc + height - borderWidth]);

		g1.graphics.backgroundColor =
		g2.graphics.backgroundColor =
		g3.graphics.backgroundColor =
		g4.graphics.backgroundColor = colorBrush;
	}
}
