import { UnsupportedSettingTypeError } from "../errors";

const sectionName = "om_midi";

const SettingsHelper = {
	get<T>(key: string, defaultValue: T): T {
		if (!app.settings.haveSetting(sectionName, key)) return defaultValue;
		else {
			const str = app.settings.getSetting(sectionName, key);
			let result: unknown;
			if (typeof defaultValue === "string") result = str;
			else if (typeof defaultValue === "number") result = Number(str);
			else if (typeof defaultValue === "boolean") result = str !== "0";
			else throw new UnsupportedSettingTypeError();
			return result as T;
		}
	},
	set<T>(key: string, value: T): void {
		let v: unknown = value;
		if (typeof value === "boolean") v = v ? "1" : "0";
		app.settings.saveSetting(sectionName, key, (v as object).toString());
	},
	has(key: string): boolean {
		return app.settings.haveSetting(sectionName, key);
	},
};

export default SettingsHelper;
