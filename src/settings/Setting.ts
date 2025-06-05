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
	EnterIncremental: 15, // 水平翻转的优化效果的缩放比率变换值，单位百分比。
	MovementIncremental: 10, // 水平翻转的优化效果浮入位移比率变换值，单位百分比。
	RotationIncremental: 15, // 顺时针和逆时针旋转的优化效果变换值，单位角度。
	LegatoForTimeRemap: false,
};

type SettingTag = keyof typeof defs;
type SettingValue<T extends SettingTag> = typeof defs[T];
type SettingValues = typeof defs[SettingTag];

type SettingsType =
	{ defs: Readonly<typeof defs> } &
	{ [tag in SettingTag as `get${tag}`]: (def?: SettingValue<tag>) => SettingValue<tag> } &
	{ [tag in SettingTag as `set${tag}`]: (value: SettingValue<tag>) => void };

const Setting = { defs: { ...defs } } as SettingsType;
for (const tag in defs)
	if (hasOwn(defs, tag)) {
		type _GetLoose = { [tag in SettingTag as `get${tag}`]: (def?: SettingValues) => SettingValues };
		(Setting as _GetLoose)[`get${tag}`] = (def = defs[tag]) => SettingsHelper.get(tag, def);
		Setting[`set${tag}`] = value => SettingsHelper.set(tag, value);
	}

export default Setting;
