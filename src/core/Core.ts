import { CannotFindCompositionError, CannotSetTimeRemapError, CannotTuningError, EmptySubtitlesError, HasNoVideoError, InvalidDurationError, MyError, NoLayerSelectedError, NoMidiError, NoOptionsCheckedError, NotOneTrackForApplyEffectsOnlyError } from "../errors";
import Portal from "../ui/Portal";
import getComp from "../modules/getComp";
import Setting from "../settings/Setting";
import { ControllerEvent, NoteEvent, NoteOffEvent, NoteOnEvent, NoteOnSecondEvent, PitchBendEvent } from "../midi/note-events";
import { ControllerType, RegularEventType } from "../midi/midi-types";
import MidiTrack from "../midi/MidiTrack";
import ProgressPalette from "../dialogs/ProgressPalette";
import uiStr from "../languages/ui-str";
import EaseType from "../modules/EaseType";
import HFlipMotionType from "../modules/HFlipMotionType";

const MIN_INTERVAL = 5e-4; // 最小间隔，为前一音符关与当前音符开之间避让而腾出的间隔，单位秒，默认为 5 丝秒。
const NULL_SOURCE_NAME = "om midi null"; // 生成的空对象纯色名称。为避免造成不必要的麻烦因此统一用英文，下同。
const TRANSFORM_NAME = "om midi Transform"; // 生成的变换效果名称。
const ENTER_INCREMENTAL = 15; // 水平翻转的优化效果变换值，单位百分比。
const ROTATION_INCREMENTAL = 15; // 顺时针和逆时针旋转的优化效果变换值，单位角度。
const SHOW_PROGRESSBAR = false; // 是否显示进度条调色板。

export default class Core {
	portal: Portal;
	nullSource?: AVItem;
	
	constructor(portal: Portal) {
		this.portal = portal;
	}
	
	apply() {
		const comp = getComp();
		if (comp === null) throw new CannotFindCompositionError();
		let progressBar: ProgressPalette | undefined;
		try {
			const tab = this.portal.getSelectedTab();
			if (tab !== this.portal.toolsTab && this.portal.midi && SHOW_PROGRESSBAR) {
				progressBar = new ProgressPalette(localize(uiStr.loading_midi, this.portal.midi.fileName)); // 进度条调色板。
				progressBar.show();
				progressBar.setValue(0.6);
			}
			if (tab === this.portal.nullObjTab)
				this.applyCreateNullObject(comp);
			else if (tab === this.portal.applyEffectsTab)
				this.applyEffects(comp);
			else if (tab === this.portal.toolsTab) {
				const tool = this.portal.toolsTab.getSelectedTool();
				if (tool === this.portal.toolsTab.marker)
					this.applyMarkerConductor(comp);
				else if (tool === this.portal.toolsTab.ease)
					this.applyEase100Percent(comp);
				else if (tool === this.portal.toolsTab.subtitle)
					this.applyGenerateSubtitles(comp);
			}
		} catch (error) {
			throw new MyError(error as Error);
		} finally {
			if (progressBar) progressBar.close();
			app.endUndoGroup();
		}
	}
	
	applyCreateNullObject(comp: CompItem) {
		app.beginUndoGroup("om midi - Apply Create Null Object");
		const nullTab = this.portal.nullObjTab;
		if (!this.portal.midi || this.portal.selectedTracks.length === 0) throw new NoMidiError();
		const checks = nullTab.getCheckedChecks();
		if (checks.length === 0) throw new NoOptionsCheckedError();
		
		//#region 设置
		let usingSelectedLayerName = Setting.getUsingSelectedLayerName();
		const selectedLayer = this.getSelectLayer(comp);
		if (selectedLayer === null) usingSelectedLayerName = false; // 如果没有选中任何图层，自然肯定不能使用图层名称了。
		const pan100 = Setting.getNormalizePanTo100();
		//#endregion
		
		const secondsPerTick = this.getSecondsPerTick();
		const startTime = this.getStartTime(comp);
		const integrator = this.getIntegrator();
		
		for (const track of this.portal.selectedTracks) {
			if (track === undefined && !this.portal.midi.isPureQuarter) continue;
			const nullLayer = this.createNullLayer(comp);
			if (track !== undefined)
				nullLayer.name = "[midi]" + (usingSelectedLayerName && selectedLayer !== null ? selectedLayer.name :
					(track.name ?? `Channel ${track.channel ?? 0}`));
			else nullLayer.name = "[midi]BPM: " + this.portal.selectBpmTxt.text;
			nullLayer.inPoint = startTime;
			nullLayer.outPoint = track !== undefined ? startTime + track.lengthTick * secondsPerTick :
				startTime + comp.duration;
			for (const check of checks)
				this.addSliderControl(nullLayer, check.text); // 限制：只能存储索引值。
			const setValueAtTime = (check: Checkbox, seconds: number, value: number, inType: KeyframeInterpolationType, outType?: KeyframeInterpolationType) =>
				this.setValueAtTime(nullLayer, checks, check, startTime + seconds, value, inType, outType);
			
			let noteOnCount = 0, // 音符开计数。
				lastEventType: RegularEventType = RegularEventType.NOTE_OFF, // 上一次音符事件类型。
				lastEventStartTick = -1, // 上一次迄今基本时间。
				lastPan = NaN, lastVolume = NaN, lastGlide = NaN; // 上一次声像、音量、弯音。
			const addNoteEvent = (noteEvent: NoteEvent) => { // 严格模式下不能在块内声明函数。
				if (noteEvent.startTick <= lastEventStartTick && !(lastEventType === RegularEventType.NOTE_OFF && noteEvent instanceof NoteOnEvent) && (noteEvent instanceof NoteOnEvent || noteEvent instanceof NoteOffEvent))
					return; // 跳过同一时间点上的音符。
				const noteSecondEvent = integrator ? integrator.getSecond(noteEvent) as NoteOnSecondEvent : undefined;
				const seconds = noteSecondEvent ? noteSecondEvent.startSecond :
					noteEvent.startTick * secondsPerTick;
				if (noteEvent instanceof NoteOnEvent && noteEvent.velocity !== 0) { // 音符开。
					if (noteEvent.interruptDuration === 0 || noteEvent.duration === 0 ||
						+noteEvent.interruptDuration! < 0 || +noteEvent.duration! < 0) return;
					// ExtendScript 最新迷惑行为：undefined < 0 为 true！！！
					// 解决方法：将 undefined 前加一元正号强行转换为数字类型 NaN，即可进行比较。
					noteOnCount++;
					setValueAtTime(nullTab.pitch, seconds, noteEvent.pitch, KeyframeInterpolationType.HOLD);
					setValueAtTime(nullTab.velocity, seconds, noteEvent.velocity, KeyframeInterpolationType.HOLD);
					setValueAtTime(nullTab.duration, seconds, (noteEvent.duration ?? 0) * secondsPerTick, KeyframeInterpolationType.HOLD); // 持续时间单位改为秒。
					setValueAtTime(nullTab.count, seconds, noteOnCount, KeyframeInterpolationType.HOLD);
					setValueAtTime(nullTab.bool, seconds, noteOnCount % 2, KeyframeInterpolationType.HOLD); // 迷惑行为，为了和旧版脚本行为保持一致。
					setValueAtTime(nullTab.scale, seconds, noteOnCount % 2 ? 100 : -100, KeyframeInterpolationType.HOLD);
					setValueAtTime(nullTab.advancedScale, seconds, noteOnCount % 2 ? 1 : -1, KeyframeInterpolationType.HOLD);
					setValueAtTime(nullTab.cwRotation, seconds, ((noteOnCount - 1) % 4) * 90, KeyframeInterpolationType.HOLD);
					setValueAtTime(nullTab.ccwRotation, seconds, ((4 - (noteOnCount - 1) % 4) % 4) * 90, KeyframeInterpolationType.HOLD);
					setValueAtTime(nullTab.noteOn, seconds, 1, KeyframeInterpolationType.HOLD);
					setValueAtTime(nullTab.timeRemap, seconds, 0, KeyframeInterpolationType.LINEAR);
					setValueAtTime(nullTab.pingpong, seconds, +!(noteOnCount % 2), KeyframeInterpolationType.LINEAR);
					if (noteEvent.interruptDuration !== undefined || noteEvent.duration !== undefined) {
						let noteOffSeconds: number;
						if (!noteSecondEvent) {
							const duration = noteEvent.interruptDuration ?? noteEvent.duration!;
							noteOffSeconds = (noteEvent.startTick + duration) * secondsPerTick - MIN_INTERVAL;
						} else
							noteOffSeconds = (noteSecondEvent.interruptDurationSecond ?? noteSecondEvent.durationSecond!)
								- MIN_INTERVAL + noteSecondEvent.startSecond;
						setValueAtTime(nullTab.timeRemap, noteOffSeconds, 1, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.HOLD);
						setValueAtTime(nullTab.pingpong, noteOffSeconds, noteOnCount % 2, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.HOLD);
					}
					lastEventType = RegularEventType.NOTE_ON;
					lastEventStartTick = noteEvent.startTick;
				} else if (noteEvent instanceof NoteOnEvent && noteEvent.velocity === 0 || noteEvent instanceof NoteOffEvent) { // 音符关。力度为 0 的音符开视为音符关。
					const noteOffSeconds = seconds - MIN_INTERVAL; // 比前一个时间稍晚一点的时间，用于同一轨道上的同时音符。
					setValueAtTime(nullTab.velocity, noteOffSeconds, noteEvent.velocity, KeyframeInterpolationType.HOLD); // 新增松键力度。
					setValueAtTime(nullTab.noteOn, seconds, 0, KeyframeInterpolationType.HOLD);
					lastEventType = RegularEventType.NOTE_OFF;
					lastEventStartTick = noteEvent.startTick;
				} else if (noteEvent instanceof ControllerEvent) { // 控制器事件。
					const controller = noteEvent.controller;
					if (controller === ControllerType.PAN) { // 声像。
						if (lastPan === noteEvent.value) return;
						lastPan = noteEvent.value;
						let pan = noteEvent.value - 64; // 64 为中置 0。
						if (pan100) { // 规范到 -100 ~ 100（小数）。
							if (pan < 0) pan = pan / 64 * 100;
							else if (pan > 0) pan = pan / 63 * 100;
						} // 否则是 -64 ~ 63（整数），两边没对齐。
						setValueAtTime(nullTab.pan, seconds, pan, KeyframeInterpolationType.HOLD);
					} else if (controller === ControllerType.MAIN_VOLUME) { // 主音量。
						if (lastVolume === noteEvent.value) return;
						lastVolume = noteEvent.value;
						setValueAtTime(nullTab.volume, seconds, noteEvent.value, KeyframeInterpolationType.HOLD);
					}
					// lastEventType = RegularEventType.CONTROLLER;
				} else if (noteEvent instanceof PitchBendEvent) { // 弯音事件。
					if (lastGlide === noteEvent.value) return;
					lastGlide = noteEvent.value;
					const glide = noteEvent.value - 0x2000; // 8192 为中央 0。
					// 取值范围：-8192 ~ 8191（整数）。
					setValueAtTime(nullTab.glide, seconds, glide, KeyframeInterpolationType.HOLD);
					// lastEventType = RegularEventType.PITCH_BEND_EVENT;
				}
			};
			//#region 在轨道起始处添加
			// 这些内容以保持和 v0.1 原版一致。
			// 从零开始“力度”，因此您可以根据需要绘制它。事实上在 0 时不会有任何音符（后人注：才怪）……
			setValueAtTime(nullTab.velocity, 0, 0, KeyframeInterpolationType.HOLD);
			setValueAtTime(nullTab.noteOn, 0, 0, KeyframeInterpolationType.HOLD);
			// “计数”从 1 开始，为了表示一开始如果没有音符的话用 0 了。
			setValueAtTime(nullTab.count, 0, 0, KeyframeInterpolationType.HOLD);
			//#endregion
			this.dealNoteEvents(track, comp, secondsPerTick, startTime, addNoteEvent);
		}
	}
	
	applyMarkerConductor(comp: CompItem) {
		app.beginUndoGroup("om midi - Apply Marker Conductor");
		const marker = this.portal.toolsTab.marker;
		let layer: AVLayer;
		if (marker.markOnCombo.getSelectedIndex() === 1) {
			const _layer = this.getSelectLayer(comp);
			if (_layer === null) throw new NoLayerSelectedError();
			layer = _layer;
		} else {
			layer = this.createNullLayer(comp);
			layer.name = `BPM:${marker.bpmTxt.text} (${marker.beatTxt.text}/4)`;
		}
		let startTime = this.getStartTime(comp);
		layer.startTime = startTime;
		let beat = 1;
		const unit = marker.unitCombo.getSelectedIndex();
		if (unit === 1) startTime -= parseFloat(marker.beatTxt.text); // 偏移秒数
		else if (unit === 2) startTime -= parseFloat(marker.beatTxt.text) * comp.frameDuration; // 偏移帧数
		const bpm = parseFloat(marker.bpmTxt.text);
		while (startTime <= comp.displayStartTime + comp.duration) {
			if (startTime >= comp.displayStartTime)
				layer.marker.setValueAtTime(startTime, new MarkerValue(String(beat)));
			if (unit === 0) {
				beat = beat % parseInt(marker.beatTxt.text) + 1;
				startTime += 60 / bpm; // 周期 BPM
			} else {
				beat++;
				if (unit === 1) startTime += bpm; // 周期秒数
				else if (unit === 2) startTime += bpm * comp.frameDuration; // 周期帧数
			}
		}
	}
	
	applyEffects(comp: CompItem) {
		app.beginUndoGroup("om midi - Apply Effects");
		const effectsTab = this.portal.applyEffectsTab;
		if (!this.portal.midi || this.portal.selectedTracks.length === 0) throw new NoMidiError();
		if (effectsTab._getCheckedChecks().length === 0) throw new NoOptionsCheckedError();
		if (this.portal.selectedTracks.length !== 1) throw new NotOneTrackForApplyEffectsOnlyError();
		const isTunningOnly = effectsTab.getCheckedChecks().length === 1 && effectsTab.tuning.value;
		const _layer = this.getSelectLayer(comp);
		if (_layer === null) throw new NoLayerSelectedError();
		let layer = _layer; // 去掉后，所有函数内部截获的 layer 变量可能会为 null。
		const secondsPerTick = this.getSecondsPerTick();
		const track = this.portal.selectedTracks[0];
		let startTime = this.getStartTime(comp);
		const getLayerStartTime = () => startTime - (layer.inPoint - layer.startTime);
		const getLayerOutPoint = () => track !== undefined ? startTime + track.lengthTick * secondsPerTick :
			startTime + comp.duration;
		if (this.portal.startTimeCombo.getSelectedIndex() === 1)
			startTime = layer.inPoint;
		else if (!isTunningOnly)
			layer.startTime = getLayerStartTime();
		const integrator = this.getIntegrator();

		//#region 设置
		const layering = Setting.getUsingLayering();
		const optimize = Setting.getOptimizeApplyEffects();
		const addToGeometry2 = Setting.getAddToEffectTransform();
		const hFlipMotion = Setting.getMotionForHorizontalFlip() as HFlipMotionType;
		//#endregion
		
		//#region 预处理效果
		if (layer.timeRemapEnabled) layer.timeRemapEnabled = false;
		const source: AVItem = layer.source;
		const sourceLength = (+(source.duration / source.frameDuration).toFixed(0) - 1) * source.frameDuration;
		const layerLength = layer.outPoint - layer.inPoint - source.frameDuration;
		let mirrorIndex = 0;
		const mirrorProp = () => Core.getEffects(layer).property(mirrorIndex).property(2) as OneDProperty;
		if (effectsTab.hMirror.value) {
			mirrorIndex = Core.getEffects(layer).addProperty("ADBE Mirror").propertyIndex;
			(Core.getEffects(layer).property(mirrorIndex).property(1) as TwoDProperty).setValue([source.width / 2, source.height / 2]);
		}
		const requireAdjustAnchor = optimize && (hFlipMotion === HFlipMotionType.FLOAT_LEFT || hFlipMotion === HFlipMotionType.FLOAT_RIGHT || hFlipMotion === HFlipMotionType.FLOAT_UP || hFlipMotion === HFlipMotionType.FLOAT_DOWN);
		let currentAnchor: TwoDPoint = [960, 540];
		let currentScale = 100;
		let geometry2Index = 0;
		const geometry2 = {
			prop: () => Core.getEffects(layer).property(geometry2Index) as PropertyBase,
			scaleTogether() { return this.prop().property(3) as BooleanProperty; },
			scaleHeight() { return this.prop().property(4) as OneDProperty; },
			scaleWidth() { return this.prop().property(5) as OneDProperty; },
			rotation() { return this.prop().property(8) as OneDProperty; },
			opacity() { return this.prop().property(9) as OneDProperty; },
			anchor() { return this.prop().property(1) as TwoDProperty; },
		};
		const isFlips = effectsTab.hFlip.value || effectsTab.vFlip.value || effectsTab.ccwFlip.value || effectsTab.cwFlip.value;
		if (isFlips || effectsTab.cwRotation.value || effectsTab.ccwRotation.value || effectsTab.mapVelToOpacity.value) {
			if (!addToGeometry2) {
				if (!layer.hasVideo)
					throw new HasNoVideoError();
				if (effectsTab.hFlip.value)
					layer.scale.expressionEnabled = false;
				if (effectsTab.cwRotation.value || effectsTab.ccwRotation.value)
					layer.rotation.expressionEnabled = false;
				if (effectsTab.mapVelToOpacity.value)
					layer.opacity.expressionEnabled = false;
				if (requireAdjustAnchor)
					layer.anchorPoint.expressionEnabled = false;
				currentScale = layer.scale.value[1];
			} else {
				geometry2Index = this.getGeometry2Effect(layer).propertyIndex;
				geometry2.scaleTogether().setValue(false);
				currentScale = geometry2.scaleHeight().value;
			}
			currentAnchor = layer.anchorPoint.value.slice(0, 2) as TwoDPoint;
		}
		const timeRemapRemoveKey = (layer: AVLayer, keyIndex: number) => {
			try {
				layer.timeRemap.removeKey(keyIndex);
			} catch (error) { } // 如果关键帧在合成时间外，会报错。
		};
		let curStartTime = 0;
		if (effectsTab.timeRemap.value || effectsTab.timeRemap2.value || effectsTab.pingpong.value) {
			if (!layer.canSetTimeRemapEnabled) throw new CannotSetTimeRemapError();
			layer.timeRemapEnabled = true;
			curStartTime = layer.timeRemap.valueAtTime(layer.inPoint, false);
			timeRemapRemoveKey(layer, 2);
			layer.timeRemap.expressionEnabled = false;
		}
		if (!isTunningOnly) layer.outPoint = getLayerOutPoint();
		let audioLayer: AVLayer | undefined;
		const basePitch = this.getBasePitch();
		if (effectsTab.tuning.value) {
			if (!layer.hasAudio) throw new CannotTuningError();
			audioLayer = layer.duplicate() as AVLayer;
			audioLayer.enabled = false;
			audioLayer.moveAfter(layer);
			audioLayer.timeRemapEnabled = true;
			if (!(effectsTab.timeRemap.value || effectsTab.timeRemap2.value || effectsTab.pingpong.value))
				curStartTime = audioLayer.timeRemap.valueAtTime(layer.inPoint, false);
			timeRemapRemoveKey(audioLayer, 2);
			audioLayer.startTime = getLayerStartTime();
			audioLayer.outPoint = getLayerOutPoint();
			audioLayer.timeRemap.expressionEnabled = false;
			layer.audioEnabled = false;
		}
		let invertIndex = 0;
		const invertProp = () => Core.getEffects(layer).property(invertIndex).property(2) as OneDProperty;
		if (effectsTab.negative.value) {
			invertIndex = Core.getEffects(layer).addProperty("ADBE Invert").propertyIndex;
			invertProp().setValue(100);
		}
		//#endregion
		
		let noteOnCount = 0,
			lastEventType: RegularEventType = RegularEventType.NOTE_OFF,
			lastEventStartTick = -1;
		const addNoteEvent = (noteEvent: NoteEvent) => { // 严格模式下不能在块内声明函数。
			if (noteEvent.startTick <= lastEventStartTick && !(lastEventType === RegularEventType.NOTE_OFF && noteEvent instanceof NoteOnEvent))
				return; // 跳过同一时间点上的音符。
			const noteSecondEvent = integrator ? integrator.getSecond(noteEvent) as NoteOnSecondEvent : undefined;
			const seconds = (noteSecondEvent ? noteSecondEvent.startSecond :
				noteEvent.startTick * secondsPerTick) + startTime;
			if (noteEvent instanceof NoteOnEvent) {
				if (noteEvent.interruptDuration === 0 || noteEvent.duration === 0 ||
					+noteEvent.interruptDuration! < 0 || +noteEvent.duration! < 0) return;
				const hasDuration = noteEvent.interruptDuration !== undefined || noteEvent.duration !== undefined;
				let noteOffSeconds: number;
				if (!noteSecondEvent) {
					const duration = noteEvent.interruptDuration ?? noteEvent.duration ?? 0;
					noteOffSeconds = (noteEvent.startTick + duration) * secondsPerTick - MIN_INTERVAL + startTime;
				} else
					noteOffSeconds = (noteSecondEvent.interruptDurationSecond ?? noteSecondEvent.durationSecond ?? 0)
						- MIN_INTERVAL + noteSecondEvent.startSecond + startTime;
				if (isFlips) {
					const addKey = (seconds: number) => !addToGeometry2 ? layer.scale.addKey(seconds) :
						(geometry2.scaleHeight().addKey(seconds), geometry2.scaleWidth().addKey(seconds));
					const setValueAtKey = (keyIndex: number, value: TwoDPoint) =>
						!addToGeometry2 ? layer.scale.setValueAtKey(keyIndex, value) :
						(geometry2.scaleHeight().setValueAtKey(keyIndex, value[1]),
						geometry2.scaleWidth().setValueAtKey(keyIndex, value[0]));
					const setInterpolationTypeAtKey = (keyIndex: number, inType: KeyframeInterpolationType) =>
						!addToGeometry2 ? layer.scale.setInterpolationTypeAtKey(keyIndex, inType) :
						(geometry2.scaleHeight().setInterpolationTypeAtKey(keyIndex, inType),
						geometry2.scaleWidth().setInterpolationTypeAtKey(keyIndex, inType));
					const setPointKeyEase = (keyIndex: number, easeType: EaseType, isHold: boolean) =>
						!addToGeometry2 ? this.setPointKeyEase(layer.scale, keyIndex, easeType, isHold) :
						(this.setPointKeyEase(geometry2.scaleHeight(), keyIndex, easeType, isHold),
						this.setPointKeyEase(geometry2.scaleWidth(), keyIndex, easeType, isHold));
					
					const key = addKey(seconds);
					const mod2 = noteOnCount % 2, mod4 = noteOnCount % 4;
					let signs_bool = [!mod2, true] as [boolean, boolean];
					if (effectsTab.vFlip.value)
						signs_bool = [true, !mod2];
					else if (effectsTab.ccwFlip.value)
						signs_bool = [mod4 === 3 || mod4 === 0, mod4 === 0 || mod4 === 1];
					else if (effectsTab.cwFlip.value)
						signs_bool = [mod4 === 0 || mod4 === 1, mod4 === 3 || mod4 === 0];
					const signs = [signs_bool[0] ? 1 : -1, signs_bool[1] ? 1 : -1] as [number, number];
					const enterIncremental = ENTER_INCREMENTAL / 100 * Math.abs(currentScale);
					if (!optimize || !hasDuration || requireAdjustAnchor) {
						setValueAtKey(key, [currentScale * signs[0], currentScale * signs[1]]);
						setInterpolationTypeAtKey(key, KeyframeInterpolationType.HOLD);
					} else {
						const increasedScale = currentScale + enterIncremental;
						let value1: TwoDPoint = [increasedScale * signs[0], increasedScale * signs[1]],
							value2: TwoDPoint = [currentScale * signs[0], currentScale * signs[1]];
						if (hFlipMotion === HFlipMotionType.EXIT)
							[value1, value2] = [value2, value1];
						setValueAtKey(key, value1);
						setInterpolationTypeAtKey(key, KeyframeInterpolationType.LINEAR);
						const key2 = addKey(noteOffSeconds);
						setValueAtKey(key2, value2);
						setPointKeyEase(key2, EaseType.EASE_IN, true);
					}
					if (requireAdjustAnchor && hasDuration) { // 调整锚点
						const addKey = (seconds: number) => !addToGeometry2 ? layer.anchorPoint.addKey(seconds) :
							geometry2.anchor().addKey(seconds);
						const setValueAtKey = (keyIndex: number, value: TwoDPoint) =>
							!addToGeometry2 ? layer.anchorPoint.setValueAtKey(keyIndex, value) :
							geometry2.anchor().setValueAtKey(keyIndex, value);
						const setInterpolationTypeAtKey = (keyIndex: number, inType: KeyframeInterpolationType) =>
							!addToGeometry2 ? layer.anchorPoint.setInterpolationTypeAtKey(keyIndex, inType) :
							geometry2.anchor().setInterpolationTypeAtKey(keyIndex, inType);
						const setPointKeyEase = (keyIndex: number, easeType: EaseType, isHold: boolean) =>
							!addToGeometry2 ? this.setPointKeyEase(layer.anchorPoint, keyIndex, easeType, isHold) :
							this.setPointKeyEase(geometry2.anchor(), keyIndex, easeType, isHold);
						
						const MOVEMENT_RATIO = 10;
						const movement = source.width / MOVEMENT_RATIO;
						const direction = hFlipMotion === HFlipMotionType.FLOAT_LEFT || hFlipMotion === HFlipMotionType.FLOAT_UP ? -1 : 1;
						const key = addKey(seconds);
						if (hFlipMotion === HFlipMotionType.FLOAT_LEFT || hFlipMotion === HFlipMotionType.FLOAT_RIGHT)
							setValueAtKey(key, [currentAnchor[0] + direction * movement, currentAnchor[1]]);
						else
							setValueAtKey(key, [currentAnchor[0], currentAnchor[1] + direction * movement]);
						setInterpolationTypeAtKey(key, KeyframeInterpolationType.LINEAR);
						const key2 = addKey(noteOffSeconds);
						setValueAtKey(key2, currentAnchor);
						setPointKeyEase(key2, EaseType.EASE_IN, true);
					}
				}
				if (effectsTab.cwRotation.value || effectsTab.ccwRotation.value) {
					const addKey = (seconds: number) => !addToGeometry2 ? layer.rotation.addKey(seconds) :
						geometry2.rotation().addKey(seconds);
					const setValueAtKey = (keyIndex: number, value: number) =>
						!addToGeometry2 ? layer.rotation.setValueAtKey(keyIndex, value) :
						geometry2.rotation().setValueAtKey(keyIndex, value);
					const setInterpolationTypeAtKey = (keyIndex: number, inType: KeyframeInterpolationType) =>
						!addToGeometry2 ? layer.rotation.setInterpolationTypeAtKey(keyIndex, inType) :
						geometry2.rotation().setInterpolationTypeAtKey(keyIndex, inType);
					const setPointKeyEase = (keyIndex: number, easeType: EaseType, isHold: boolean) =>
						!addToGeometry2 ? this.setPointKeyEase(layer.rotation, keyIndex, easeType, isHold) :
						this.setPointKeyEase(geometry2.rotation(), keyIndex, easeType, isHold);
					
					const value = effectsTab.cwRotation.value ? (noteOnCount % 4) * 90 : ((4 - noteOnCount % 4) % 4) * 90;
					const key = addKey(seconds);
					if (!optimize || !hasDuration) {
						setValueAtKey(key, value);
						setInterpolationTypeAtKey(key, KeyframeInterpolationType.HOLD);
					} else {
						const startValue = value + ROTATION_INCREMENTAL * (effectsTab.cwRotation.value ? -1 : 1);
						setValueAtKey(key, startValue);
						setInterpolationTypeAtKey(key, KeyframeInterpolationType.LINEAR);
						const key2 = addKey(noteOffSeconds);
						setValueAtKey(key2, value);
						setPointKeyEase(key2, EaseType.EASE_IN, true);
					}
				}
				if (effectsTab.mapVelToOpacity.value) {
					const addKey = (seconds: number) => !addToGeometry2 ? layer.opacity.addKey(seconds) :
						geometry2.opacity().addKey(seconds);
					const setValueAtKey = (keyIndex: number, value: number) =>
						!addToGeometry2 ? layer.opacity.setValueAtKey(keyIndex, value) :
						geometry2.opacity().setValueAtKey(keyIndex, value);
					const setInterpolationTypeAtKey = (keyIndex: number, inType: KeyframeInterpolationType) =>
						!addToGeometry2 ? layer.opacity.setInterpolationTypeAtKey(keyIndex, inType) :
						geometry2.opacity().setInterpolationTypeAtKey(keyIndex, inType);
					
					const value = effectsTab.mapVelToOpacity.map(noteEvent.velocity);
					const key = addKey(seconds);
					setValueAtKey(key, value);
					setInterpolationTypeAtKey(key, KeyframeInterpolationType.HOLD);
				}
				if (effectsTab.timeRemap.value || effectsTab.timeRemap2.value || effectsTab.pingpong.value) {
					if (noteOnCount === 0 && noteEvent.startTick !== 0) { // 如果第一个音符不在乐曲最开始。
						const inPointValue = layer.timeRemap.keyValue(1);
						const inPointTime = layer.timeRemap.keyTime(1);
						layer.timeRemap.setValueAtTime(inPointTime + seconds - startTime, inPointValue);
					}
					const key = layer.timeRemap.addKey(seconds);
					const direction = !(noteOnCount % 2);
					layer.timeRemap.setValueAtKey(key, curStartTime);
					layer.timeRemap.setInterpolationTypeAtKey(key, KeyframeInterpolationType.LINEAR);
					if (hasDuration) {
						let key2 = layer.timeRemap.addKey(noteOffSeconds);
						const endTime = (effectsTab.timeRemap.value || effectsTab.pingpong.value) ?
							curStartTime + layerLength : noteOffSeconds - seconds + curStartTime;
						const reversed = effectsTab.pingpong.value && !direction;
						if (reversed) layer.timeRemap.setValueAtKey(key, endTime);
						if (endTime < (layer.source as AVItem).duration)
							layer.timeRemap.setValueAtKey(key2, !reversed ? endTime : curStartTime);
						else {
							layer.timeRemap.removeKey(key2);
							key2 = layer.timeRemap.addKey(seconds + sourceLength - curStartTime);
							layer.timeRemap.setValueAtKey(key2, sourceLength);
						}
						layer.timeRemap.setInterpolationTypeAtKey(key2, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.HOLD);
					}
				}
				if (effectsTab.negative.value) {
					const key = invertProp().addKey(seconds);
					invertProp().setValueAtKey(key, noteOnCount % 2 ? 0 : 100);
					invertProp().setInterpolationTypeAtKey(key, KeyframeInterpolationType.HOLD);
				}
				if (effectsTab.hMirror.value) {
					const key = mirrorProp().addKey(seconds);
					mirrorProp().setValueAtKey(key, noteOnCount % 2 ? 0 : 180);
					mirrorProp().setInterpolationTypeAtKey(key, KeyframeInterpolationType.HOLD);
				}
				if (effectsTab.tuning.value && audioLayer) {
					const key = audioLayer.timeRemap.addKey(seconds);
					audioLayer.timeRemap.setValueAtKey(key, curStartTime);
					audioLayer.timeRemap.setInterpolationTypeAtKey(key, KeyframeInterpolationType.LINEAR);
					if (hasDuration) {
						let key2 = audioLayer.timeRemap.addKey(noteOffSeconds);
						const duration2 = noteOffSeconds - seconds;
						const pitch = noteEvent.pitch - basePitch; // C5 == 60
						const stretch = 2 ** (pitch / 12);
						const endTime = duration2 * stretch + curStartTime;
						if (endTime < (layer.source as AVItem).duration)
							audioLayer.timeRemap.setValueAtKey(key2, endTime);
						else {
							audioLayer.timeRemap.removeKey(key2);
							key2 = audioLayer.timeRemap.addKey(seconds + (sourceLength - curStartTime) / stretch);
							audioLayer.timeRemap.setValueAtKey(key2, sourceLength);
						}
						audioLayer.timeRemap.setInterpolationTypeAtKey(key2, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.HOLD);
					}
					
					if (effectsTab.mapVelToVolume.value) {
						const audioLevels = audioLayer.audio.audioLevels;
						const key = audioLevels.addKey(seconds);
						const value = effectsTab.mapVelToVolume.map(noteEvent.velocity);
						audioLevels.setValueAtKey(key, [value, value]);
						audioLevels.setInterpolationTypeAtKey(key, KeyframeInterpolationType.HOLD);
						if (hasDuration) {
							const key2 = audioLevels.addKey(noteOffSeconds);
							const MIN_VOLUME = -192;
							audioLevels.setValueAtKey(key2, [MIN_VOLUME, MIN_VOLUME]);
							audioLevels.setInterpolationTypeAtKey(key2, KeyframeInterpolationType.HOLD);
						}
					}
				}
				if (layering && noteOnCount !== 0) {
					if (!isTunningOnly)
						layer = this.splitLayer(layer, seconds);
					if (effectsTab.tuning.value && audioLayer)
						audioLayer = this.splitLayer(audioLayer, seconds);
				}
				noteOnCount++;
				lastEventType = RegularEventType.NOTE_ON;
				lastEventStartTick = noteEvent.startTick;
			} else if (noteEvent instanceof NoteOffEvent) {
				// const noteOffSeconds = seconds - MIN_INTERVAL; // 比前一个时间稍晚一点的时间，用于同一轨道上的同时音符。
				
				// lastEventType = RegularEventType.NOTE_OFF;
				// lastEventStartTick = noteEvent.startTick;
			}
		};
		this.dealNoteEvents(track, comp, secondsPerTick, curStartTime, addNoteEvent);
	}
	
	applyEase100Percent(comp: CompItem) {
		app.beginUndoGroup("om midi - Apply Easing 100%");
		const easeType = this.portal.toolsTab.ease.getValue();
		const layers = comp.selectedLayers;
		for (const layer of layers) {
			if (layer === undefined) continue;
			const selectedProperties = Core.getSelectedProperties(layer);
			for (const property of selectedProperties) {
				if (property === undefined) continue;
				for (const keyIndex of property.selectedKeys) {
					if (keyIndex === undefined) continue;
					this.setPointKeyEase(property, keyIndex, easeType, false);
				}
			}
		}
	}
	
	applyGenerateSubtitles(comp: CompItem) {
		const { subtitle } = this.portal.toolsTab;
		const duration = parseFloat(subtitle.durationTxt.text);
		const subtitlesText = subtitle.subtitlesText.text;
		if (!isFinite(duration) || duration <= 0) throw new InvalidDurationError();
		if (!subtitlesText.trim().length) throw new EmptySubtitlesError();
		const subtitles = subtitlesText.replace(/\r\n|\n\r|\r|\n/g, "\n").split("\n");
		
		app.beginUndoGroup("om midi - Apply Batch Subtitle Generation");
		const layer = comp.layers.addText();
		const startTime = layer.startTime = this.getStartTime(comp);
		subtitles.forEach((line, index) => {
			if (!line.trim().length) return;
			layer.sourceText.setValueAtTime(startTime + index * duration, new TextDocument(line));
		});
	}
	
	//#region 辅助方法
	/**
	 * 创建一个空对象图层。
	 * @param comp - 合成。
	 * @returns 空对象图层。
	 */
	private createNullLayer(comp: CompItem): AVLayer {
		let nullLayer: AVLayer;
		refindNullSource: while (true) {
			let hasNullSource = false;
			try {
				hasNullSource = !!this.nullSource && !!this.nullSource.parentFolder;
			} catch (error) { // 执行撤销之后可能会变为“对象无效”，它既不是 undefined 也不是 null，只能用 try catch 捕获。
				hasNullSource = false;
			}
			if (hasNullSource) { // 如果有现有的空对象纯色，不用重新新建一个。
				nullLayer = comp.layers.add(this.nullSource as AVItem, comp.workAreaDuration);
				nullLayer.opacity.setValue(0);
				nullLayer.anchorPoint.setValue([0, 0]);
			} else {
				nullLayer = comp.layers.addNull(comp.workAreaDuration);
				const nullSource = nullLayer.source as AVItem;
				for (let i = 1; i <= nullSource.parentFolder.items.length; i++) { // 从 1 起始。
					const item = nullSource.parentFolder.items[i];
					if (item.name === NULL_SOURCE_NAME &&
						item instanceof FootageItem &&
						item.mainSource instanceof SolidSource) {
						this.nullSource = item; // 找到名字相同的空对象了。
						nullSource.remove(); // 删除刚创建的空对象。
						continue refindNullSource; // 跳两层循环，回到第一个 if 语句。
					}
				}
				this.nullSource = nullSource; // 没找到，创建一个新的。
				nullLayer.source.name = NULL_SOURCE_NAME;
			}
			break;
		}
		nullLayer.enabled = false;
		return nullLayer;
	}
	
	/**
	 * 获取指定图层的效果属性集合。
	 * @param layer - 图层。
	 * @returns 效果组。
	 */
	private static getEffects(layer: AVLayer): PropertyGroup {
		return layer("Effects") as PropertyGroup;
	}
	
	/**
	 * 获取选中的参数，用以获取选中的关键帧，但是要避免选中参数组，如果是参数组则通过递归来获取真正的参数。
	 * @param layer - 图层或参数类。
	 * @returns 选中的参数。
	 */
	private static getSelectedProperties(layer: Layer | _PropertyClasses[]): Property[] {
		const properties: Property[] = [];
		const propertyClasses = layer instanceof Array ? layer : layer.selectedProperties;
		for (const property of propertyClasses) {
			if (property === undefined) continue;
			else if (property instanceof Property)
				properties.push(property);
			else {
				const subProperties: _PropertyClasses[] = [];
				for (let i = 1; i <= property.numProperties; i++)
					subProperties.push(property.property(i));
				properties.push(...this.getSelectedProperties(subProperties));
			}
		}
		return properties;
	}
	
	/**
	 * 为指定图层添加一个表达式控制 - 滑块控制的效果。
	 * @param layer - 图层。
	 * @param name - 滑块名称。
	 * @returns 滑块控制效果序号。
	 */
	private addSliderControl(layer: AVLayer, name: string): number {
		const slider = Core.getEffects(layer).addProperty("ADBE Slider Control") as PropertyGroup; // 中文版竟然能正常运行？ADBE 是什么鬼？ // 后人注：属性的英文名前面加上“ADBE”之后，即可在任何本地化语言使用。
		slider.name = name;
		return slider.propertyIndex; // 向索引组添加新属性时，将从头开始重新创建索引组，从而使对属性的所有现有引用无效。
	}
	
	private setValueAtTime(layer: AVLayer, checks: Checkbox[], check: Checkbox, seconds: number, value: number, inType: KeyframeInterpolationType, outType: KeyframeInterpolationType = inType): void {
		const index = checks.indexOf(check);
		if (index === -1) return;
		// 注：根据说明文档，将创建的效果等属性的引用赋值给变量后，下一次创建新的效果时，之前的引用会变为“对象无效”。只能通过其序号进行访问。
		const slider = Core.getEffects(layer).property(index + 1).property(1) as OneDProperty;
		const key = slider.addKey(seconds);
		slider.setValueAtKey(key, value);
		slider.setInterpolationTypeAtKey(key, inType, outType);
	}
	
	/**
	 * 获取当前合成所选中的第一个图层。
	 * @param comp - 合成。
	 * @returns 选中图层。
	 */
	getSelectLayer(comp: CompItem): AVLayer | null {
		if (comp.selectedLayers.length === 0) return null;
		const layer = comp.selectedLayers[0];
		if (layer instanceof AVLayer) return layer;
		return null;
	}
	
	private getSecondsPerTick(): number {
		if (!this.portal.midi) throw new NoMidiError();
		let secondsPerTick: number;
		const ticksPerQuarter = this.portal.midi.timeDivision; // 基本时间每四分音符
		if (ticksPerQuarter instanceof Array) {
			secondsPerTick = 1 / ticksPerQuarter[0] / ticksPerQuarter[1]; // 帧每秒这种格式不支持，随便弄一个数不要报错就好了。
		} else {
			const quartersPerMinute = parseFloat(this.portal.selectBpmTxt.text), // 四分音符每分钟 (BPM)
				secondsPerQuarter = 60 / quartersPerMinute; // 秒每四分音符
			secondsPerTick = secondsPerQuarter / ticksPerQuarter; // 秒每基本时间
		}
		return secondsPerTick;
	}
	
	/**
	 * 获取开始时间。
	 * @param comp - 合成。
	 * @returns 开始时间。
	 */
	private getStartTime(comp: CompItem) {
		const startTimePos = this.portal.startTimeCombo.getSelectedIndex();
		/* return startTimePos === 0 ? comp.displayStartTime :
			(startTimePos === 1 ? comp.time :
			(startTimePos === 2 ? comp.workAreaStart : 0)); // ExtendScript 似乎对三元运算符的优先级有偏见。 */
		// TODO: 这部分将会被修改为三元运算符。
		if (startTimePos === 0) return comp.displayStartTime;
		else if (startTimePos === 1) return comp.time;
		else if (startTimePos === 2) return comp.workAreaStart;
		else return 0;
	}
	
	private dealNoteEvents(track: MidiTrack | undefined, comp: CompItem, secondsPerTick: number, startTime: number, addNoteEvent: (noteEvent: NoteEvent) => void) {
		if (track !== undefined)
			for (const noteEvent of track)
				addNoteEvent(noteEvent);
		else {
			let noteCount = 0;
			while (noteCount * secondsPerTick <= startTime + comp.duration)
				addNoteEvent(new NoteOnEvent(0, 60, 100, +!!noteCount, 1, noteCount++));
		}
	}
	
	/**
	 * 根据界面中的用户设定获取原始音高。
	 * @returns 原始音高。
	 */
	private getBasePitch(): number {
		const tab = this.portal.applyEffectsTab;
		return tab.basePitchOctCombo.getSelectedIndex() * 12 + tab.basePitchKeyCombo.getSelectedIndex();
	}
	
	/**
	 * 拆分图层。
	 * @param layer - 图层。
	 * @param time - 拆分时间点。
	 * @returns 拆分后的新图层。
	 */
	splitLayer<L extends Layer>(layer: L, time: number): L {
		const outPoint = layer.outPoint; // 备份原出点位置。
		const newLayer = layer.duplicate() as L;
		layer.outPoint = time;
		newLayer.inPoint = time;
		newLayer.outPoint = outPoint;
		return newLayer;
	}
	
	/**
	 * 为关键帧设置 100% 的缓动曲线。
	 * @param property - 属性。
	 * @param keyIndex - 关键帧序号。
	 * @param easeType - 缓动类型。
	 * @param isHold - 在不缓动的另一侧是否为定格类型？否则为线性。
	 */
	private setPointKeyEase(property: Property, keyIndex: number, easeType: EaseType, isHold: boolean): void {
		const easeLength = property.keyInTemporalEase(keyIndex).length;
		const ease: KeyframeEase[] = [];
		for (let i = 0; i < easeLength; i++)
			ease.push(new KeyframeEase(0, 100));
		if (ease.length !== 0)
			property.setTemporalEaseAtKey(keyIndex, ease as [KeyframeEase]);
		const anotherSide = isHold ? KeyframeInterpolationType.HOLD : KeyframeInterpolationType.LINEAR;
		const original: [KeyframeInterpolationType, KeyframeInterpolationType] =
			[property.keyInInterpolationType(keyIndex), property.keyOutInterpolationType(keyIndex)];
		if (easeType === EaseType.EASE_IN)
			property.setInterpolationTypeAtKey(keyIndex, KeyframeInterpolationType.BEZIER, anotherSide);
		else if (easeType === EaseType.EASE_OUT)
			property.setInterpolationTypeAtKey(keyIndex, anotherSide, KeyframeInterpolationType.BEZIER);
		else if (easeType === EaseType.LINEAR)
			property.setInterpolationTypeAtKey(keyIndex, KeyframeInterpolationType.LINEAR);
		else if (easeType === EaseType.HOLD)
			property.setInterpolationTypeAtKey(keyIndex, KeyframeInterpolationType.HOLD);
		else if (easeType === EaseType.HOLD_IN)
			property.setInterpolationTypeAtKey(keyIndex, KeyframeInterpolationType.HOLD, original[1]);
		else if (easeType === EaseType.HOLD_OUT)
			property.setInterpolationTypeAtKey(keyIndex, original[0], KeyframeInterpolationType.HOLD);
	}
	//#endregion
	
	/**
	 * 获取一个效果中的变换。如果有现成的就不用再次创建了。
	 * @param layer - 图层。
	 * @returns 变换效果。
	 */
	private getGeometry2Effect(layer: AVLayer): PropertyGroup {
		const GEOMETRY2_MATCH_NAME = "ADBE Geometry2";
		const effects = Core.getEffects(layer);
		for (let i = 1; i <= effects.numProperties; i++) {
			const property = effects.property(i) as PropertyGroup;
			if (property.name === TRANSFORM_NAME && property.matchName === GEOMETRY2_MATCH_NAME)
				return property;
		}
		const property = effects.addProperty(GEOMETRY2_MATCH_NAME) as PropertyGroup;
		property.name = TRANSFORM_NAME;
		return property;
	}
	
	private getIntegrator() {
		const midi = this.portal.midi;
		return midi && midi.isDynamicBpm && midi.integrator && this.portal.isUseDynamicBpm() ? midi.integrator : undefined;
	}
}
