"use strict";

/*!
 * Copyright (c) 2017 Jed Watson.
 * Licensed under the MIT License (MIT), see
 * http://jedwatson.github.io/classnames
 */

export const camelToHyphenCase = (str: string) => str.replace(/([A-Z])/g, "-$1").toLowerCase();

type ClassNamesArgType = string | number | undefined | null;
type ClassNamesArgsType = ClassNamesArgType | ClassNamesArgType[] | { [className: string]: boolean | undefined };

function classNames(...args: ClassNamesArgsType[]) {
	const classes: string[] = [],
		push = (name: string) => classes.push(classNames.toHyphenCase ? camelToHyphenCase(name) : name);
	for (const arg of args) {
		if (!arg) continue;
		if (typeof arg === "string" || typeof arg === "number")
			push(String(arg));
		else if (Array.isArray(arg) && arg.length) {
			const inner = classNames(...arg);
			if (inner) push(inner);
		} else if (typeof arg === "object")
			for (const [key, value] of Object.entries(arg))
				if (value)
					push(key);
	}
	return classes.join(" ");
}

classNames.toHyphenCase = false;

export default classNames;
