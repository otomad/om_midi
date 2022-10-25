// 取名为 Setting 而不是 Settings 以免和内置对象冲突。

import hasOwn from "../modules/hasOwn";
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
	MotionForHorizontalFlip: 0,
};

type SettingTag = keyof typeof defs;
type SettingValue<T extends SettingTag> = typeof defs[T];
type SettingValues = typeof defs[SettingTag];

type SettingsType=
	{ [tag in SettingTag as `get${tag}`]: (def?: SettingValue<tag>) => SettingValue<tag> } &
	{ [tag in SettingTag as `set${tag}`]: (value: SettingValue<tag>) => void };

const Setting = {} as SettingsType;
for (const tag in defs)
	if (hasOwn(defs, tag)) {
		type _GetLoose = { [tag in SettingTag as `get${tag}`]: (def?: SettingValues) => SettingValues };
		(Setting as _GetLoose)[`get${tag}`] = (def = defs[tag]) => SettingsHelper.get(tag, def);
		Setting[`set${tag}`] = value => SettingsHelper.set(tag, value);
	}

export default Setting;
