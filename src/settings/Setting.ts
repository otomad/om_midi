// 取名为 Setting 而不是 Settings 以免和内置对象冲突。

import hasOwn from "../module/hasOwn";
import SettingsHelper from "./SettingsHelper";

const defs = {
	Language: 0,
	UsingSelectedLayerName: false,
	UsingLayering: false,
	OptimizeApplyEffects: true,
	NormalizePanTo100: true,
	AddToEffectTransform: false,
	ApplyEffectsStartTime: 1,
	NullObjectStartTime: 0,
	LastTool: 0,
};

type SettingTag = keyof typeof defs;
type GetterSettings<T extends SettingTag> = `get${T}`;
type SetterSettings<T extends SettingTag> = `set${T}`;
type SettingValue<T> = typeof defs[T extends GetterSettings<infer P> ? P : T extends SetterSettings<infer Q> ? Q : never];
type SettingValues = typeof defs[SettingTag];

type SettingType<T extends SettingTag> =
	{ [getter in GetterSettings<T>]: (def?: SettingValue<getter>) => SettingValue<getter> } &
	{ [setter in SetterSettings<T>]: (value: SettingValue<setter>) => void };
const Setting = {} as SettingType<SettingTag>;
for (const tag in defs) {
	if (hasOwn(defs, tag)) {
		type _GetLoose = { [getter in GetterSettings<SettingTag>]: (def?: SettingValues) => SettingValues };
		(Setting as _GetLoose)[`get${tag}`] = (def = defs[tag]) => SettingsHelper.get(tag, def);
		Setting[`set${tag}`] = value => SettingsHelper.set(tag, value);
	}
}

export default Setting;
