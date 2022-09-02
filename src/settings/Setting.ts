// 取名为 Setting 而不是 Settings 以免和内置对象冲突。

import Set from "./SettingsHelper";

const tags = {
	language: "Language",
	usingSelectedLayerName: "UsingSelectedLayerName",
	usingLayering: "UsingLayering",
	optimizeApplyEffects: "OptimizeApplyEffects",
	normalizePanTo100: "NormalizePanTo100",
	addToEffectTransform: "AddToEffectTransform",
	applyEffectsStartTime: "ApplyEffectsStartTime",
	nullObjectStartTime: "NullObjectStartTime",
	lastTool: "LastTool",
};

const Setting = {
	getLanguage: (def: number = 0) => Set.get(tags.language, def),
	setLanguage: (value: number) => Set.set(tags.language, value),
	getUsingSelectedLayerName: (def: boolean = false) => Set.get(tags.usingSelectedLayerName, def),
	setUsingSelectedLayerName: (value: boolean) => Set.set(tags.usingSelectedLayerName, value),
	getUsingLayering: (def: boolean = false) => Set.get(tags.usingLayering, def),
	setUsingLayering: (value: boolean) => Set.set(tags.usingLayering, value),
	getOptimizeApplyEffects: (def: boolean = true) => Set.get(tags.optimizeApplyEffects, def),
	setOptimizeApplyEffects: (value: boolean) => Set.set(tags.optimizeApplyEffects, value),
	getNormalizePanTo100: (def: boolean = true) => Set.get(tags.normalizePanTo100, def),
	setNormalizePanTo100: (value: boolean) => Set.set(tags.normalizePanTo100, value),
	getAddToEffectTransform: (def: boolean = false) => Set.get(tags.addToEffectTransform, def),
	setAddToEffectTransform: (value: boolean) => Set.set(tags.addToEffectTransform, value),
	getApplyEffectsStartTime: (def: number = 1) => Set.get(tags.applyEffectsStartTime, def),
	setApplyEffectsStartTime: (value: number) => Set.set(tags.applyEffectsStartTime, value),
	getNullObjectStartTime: (def: number = 0) => Set.get(tags.nullObjectStartTime, def),
	setNullObjectStartTime: (value: number) => Set.set(tags.nullObjectStartTime, value),
	getLastTool: (def: number = 0) => Set.get(tags.lastTool, def),
	setLastTool: (value: number) => Set.set(tags.lastTool, value),
};

export default Setting;
