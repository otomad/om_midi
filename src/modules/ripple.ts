import "./ripple.scss";

function findLast<T>(array: T[], predicate: (value: T, index: number, array: T[]) => boolean): T | undefined {
	const results = array.filter(predicate);
	return results[results.length - 1];
}

export default function ripple(bindClass = "ripple-button") {
	function findClass(e: MouseEvent, listener: (element: HTMLElement) => void) {
		const element = findLast(e.path, e => "classList" in e ? e.classList.contains(bindClass) : false);
		if (element instanceof HTMLElement) listener(element);
	}
	
	const CIRCLE_CLASS = "ripple-circle";
	
	document.addEventListener("mousedown", e => findClass(e, element => {
		const rect = element.getClientRects()[0];
		if (!rect) return;
		const circleRadius = getMaxRadius(rect, e) + 1; // + 1 用于边缘问题。
		let pointerX = e.clientX - rect.x,
			pointerY = e.clientY - rect.y;
		pointerX -= circleRadius;
		pointerY -= circleRadius;
		const circle = document.createElement("div");
		circle.classList.add(CIRCLE_CLASS);
		circle.style.width = circleRadius * 2 + "px";
		circle.style.height = circleRadius * 2 + "px";
		circle.style.left = pointerX + "px";
		circle.style.top = pointerY + "px";
		element.prepend(circle);
		circle.animate([
			{ transform: "scale(0)" },
			{ transform: "scale(1)" },
		], {
			duration: 1000,
			easing: "cubic-bezier(0, 0, 0, 1)",
		});
	}));
	
	document.addEventListener("mouseup", () => {
		const FADE_TIME = 250;
		const IS_FADING_CLASS = "is-fading";
		for (const circle of document.getElementsByClassName(CIRCLE_CLASS)) {
			if (circle.classList.contains(IS_FADING_CLASS)) return;
			circle.classList.add(IS_FADING_CLASS);
			circle.animate([
				{ opacity: 1 },
				{ opacity: 0 },
			], {
				duration: FADE_TIME,
				easing: "ease-out",
			}).finished.then(() => circle.remove());
		}
	});
}

class Point {
	x: number;
	y: number;
	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}
	
	distance(point: Point): number {
		return Math.sqrt((point.x - this.x) ** 2 + (point.y - this.y) ** 2);
	}
}

function getMaxRadius(rect: DOMRect, e: MouseEvent) {
	const pointer = new Point(e.clientX, e.clientY);
	const leftTop = new Point(rect.left, rect.top);
	const rightTop = new Point(rect.right, rect.top);
	const rightBottom = new Point(rect.right, rect.bottom);
	const leftBottom = new Point(rect.left, rect.bottom);
	return Math.max(
		pointer.distance(leftTop),
		pointer.distance(rightTop),
		pointer.distance(rightBottom),
		pointer.distance(leftBottom),
	);
}
