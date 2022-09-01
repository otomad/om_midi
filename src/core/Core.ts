import { CannotFindCompositionError, MyError, NoLayerSelectedError, NoMidiError, NoOptionsCheckedError, NotOneTrackForApplyEffectsOnlyError } from "../errors";
import Portal from "../ui/Portal";
import getComp from "../module/getComp";
import Setting from "../module/Setting";
import { ControllerEvent, NoteEvent, NoteOffEvent, NoteOnEvent } from "../midi/NoteEvent";
import { ControllerType, RegularEventType } from "../midi/MidiFormatType";
import MidiTrack from "../midi/MidiTrack";

const MIN_INTERVAL = 5e-4;
const NULL_SOURCE_NAME = "om midi null"
const ENTER_INCREMENTAL = 15;
const ROTATION_INCREMENTAL = 15;

export default class Core {
	portal: Portal;
	nullSource?: AVItem;
	
	constructor(portal: Portal) {
		this.portal = portal;
	}
	
	apply() {
		const comp = getComp();
		if (comp === null) throw new CannotFindCompositionError();
		try {
			const tab = this.portal.getSelectedTab();
			if (tab === this.portal.nullObjTab)
				this.applyCreateNullObject(comp);
			else if (tab === this.portal.applyEffectsTab)
				this.applyEffects(comp);
			else if (tab === this.portal.toolsTab) {
				if (this.portal.toolsTab.toolsCombo.getSelectedIndex() === 0)
					this.applyMarkerConductor(comp);
			}
		} catch (error) {
			throw new MyError(error as Error);
		} finally {
			app.endUndoGroup();
		}
	}
	
	applyCreateNullObject(comp: CompItem) {
		app.beginUndoGroup("om midi - Apply Create Null Object");
		const nullTab = this.portal.nullObjTab;
		if (!this.portal.midi || this.portal.selectedTracks.length === 0) throw new NoMidiError();
		const checks = nullTab.getCheckedChecks();
		if (checks.length === 0) throw new NoOptionsCheckedError();
		let usingSelectedLayerName = Setting.get("UsingSelectedLayerName", false);
		const selectedLayer = this.getSelectLayer(comp);
		if (selectedLayer === null) usingSelectedLayerName = false; // 如果没有选中任何图层，自然肯定不能使用图层名称了。
		const secondsPerTick = this.getSecondsPerTick();
		const startTime = this.getStartTime(comp);
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
			let noteOnCount = 0,
				lastEventType: RegularEventType = RegularEventType.NOTE_OFF,
				lastEventSofarTick = 0;
			const addNoteEvent = (noteEvent: NoteEvent) => { // 严格模式下不能在块内声明函数。
				if (noteEvent.sofarTick <= lastEventSofarTick && !(lastEventType === RegularEventType.NOTE_OFF && noteEvent instanceof NoteOnEvent))
					return; // 跳过同一时间点上的音符。
				const seconds = noteEvent.sofarTick * secondsPerTick;
				if (noteEvent instanceof NoteOnEvent) {
					if (noteEvent.interruptDuration === 0 || noteEvent.duration === 0 ||
						noteEvent.interruptDuration && noteEvent.interruptDuration < 0 ||
						noteEvent.duration && noteEvent.duration < 0) return;
					setValueAtTime(nullTab.pitch, seconds, noteEvent.pitch, KeyframeInterpolationType.HOLD);
					setValueAtTime(nullTab.velocity, seconds, noteEvent.velocity, KeyframeInterpolationType.HOLD);
					setValueAtTime(nullTab.duration, seconds, noteEvent.duration ?? 0, KeyframeInterpolationType.HOLD);
					setValueAtTime(nullTab.count, seconds, noteOnCount, KeyframeInterpolationType.HOLD);
					setValueAtTime(nullTab.bool, seconds, +!(noteOnCount % 2), KeyframeInterpolationType.HOLD); // 迷惑行为，为了和旧版脚本行为保持一致。
					setValueAtTime(nullTab.scale, seconds, noteOnCount % 2 ? -100 : 100, KeyframeInterpolationType.HOLD);
					setValueAtTime(nullTab.cwRotation, seconds, (noteOnCount % 4) * 90, KeyframeInterpolationType.HOLD);
					setValueAtTime(nullTab.ccwRotation, seconds, ((4 - noteOnCount % 4) % 4) * 90, KeyframeInterpolationType.HOLD);
					setValueAtTime(nullTab.noteOn, seconds, 1, KeyframeInterpolationType.HOLD);
					setValueAtTime(nullTab.timeRemap, seconds, 0, KeyframeInterpolationType.LINEAR);
					setValueAtTime(nullTab.whirl, seconds, noteOnCount % 2, KeyframeInterpolationType.LINEAR);
					if (noteEvent.interruptDuration !== undefined || noteEvent.duration !== undefined) {
						const duration = noteEvent.interruptDuration ?? noteEvent.duration!;
						const noteOffSeconds = (noteEvent.sofarTick + duration) * secondsPerTick - MIN_INTERVAL;
						setValueAtTime(nullTab.timeRemap, noteOffSeconds, 1, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.HOLD);
						setValueAtTime(nullTab.whirl, noteOffSeconds, +!(noteOnCount % 2), KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.HOLD);
					}
					noteOnCount++;
					lastEventType = RegularEventType.NOTE_ON;
					lastEventSofarTick = noteEvent.sofarTick;
				} else if (noteEvent instanceof NoteOffEvent) {
					const noteOffSeconds = seconds - MIN_INTERVAL; // 比前一个时间稍晚一点的时间，用于同一轨道上的同时音符。
					setValueAtTime(nullTab.velocity, noteOffSeconds, noteEvent.velocity, KeyframeInterpolationType.HOLD); // 新增松键力度。
					setValueAtTime(nullTab.noteOn, seconds, 0, KeyframeInterpolationType.HOLD);
					lastEventType = RegularEventType.NOTE_OFF;
					lastEventSofarTick = noteEvent.sofarTick;
				} else if (noteEvent instanceof ControllerEvent) {
					const controller = noteEvent.controller;
					if (controller === ControllerType.PAN) {
						const pan = noteEvent.value - 64; // 64 为中置 0。
						setValueAtTime(nullTab.pan, seconds, pan, KeyframeInterpolationType.HOLD);
					} else if (controller === ControllerType.MAIN_VOLUME) {
						setValueAtTime(nullTab.volume, seconds, noteEvent.value, KeyframeInterpolationType.HOLD);
					}
				}
			}
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
		if (unit === 1) startTime += parseFloat(marker.beatTxt.text); // 偏移秒数
		else if (unit === 2) startTime += parseFloat(marker.beatTxt.text) * comp.frameDuration; // 偏移帧数
		const bpm = parseFloat(marker.bpmTxt.text);
		while (startTime <= comp.displayStartTime + comp.duration) {
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
		if (effectsTab.getCheckedChecks().length === 0) throw new NoOptionsCheckedError();
		if (this.portal.selectedTracks.length !== 1) throw new NotOneTrackForApplyEffectsOnlyError();
		const isTunningOnly = effectsTab.getCheckedChecks().length === 1 && effectsTab.tunning.value;
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
		
		//#region 预处理效果
		if (layer.timeRemapEnabled) layer.timeRemapEnabled = false;
		const source: AVItem = layer.source;
		const sourceLength = (+(source.duration / source.frameDuration).toFixed(0) - 1) * source.frameDuration;
		const layerLength = layer.outPoint - layer.inPoint - source.frameDuration;
		const timeRemapRemoveKey = (layer: AVLayer, keyIndex: number) => {
			try {
				layer.timeRemap.removeKey(keyIndex);
			} catch (error) { } // 如果关键帧在合成时间外，会报错。
		}
		let curStartTime = 0;
		if (effectsTab.timeRemap.value || effectsTab.timeRemap2.value) {
			layer.timeRemapEnabled = true;
			curStartTime = layer.timeRemap.valueAtTime(layer.inPoint, false);
			timeRemapRemoveKey(layer, 2);
		}
		if (!isTunningOnly) layer.outPoint = getLayerOutPoint();
		let audioLayer: AVLayer | undefined;
		const basePitch = this.getBasePitch();
		if (effectsTab.tunning.value) {
			audioLayer = layer.duplicate() as AVLayer;
			audioLayer.enabled = false;
			audioLayer.moveAfter(layer);
			audioLayer.timeRemapEnabled = true;
			if (!(effectsTab.timeRemap.value || effectsTab.timeRemap2.value))
				curStartTime = audioLayer.timeRemap.valueAtTime(layer.inPoint, false);
			timeRemapRemoveKey(audioLayer, 2);
			audioLayer.startTime = getLayerStartTime();
			audioLayer.outPoint = getLayerOutPoint();
		}
		let invertIndex = 0;
		const invertProperty = () => this.getEffects(layer).property(invertIndex).property(2) as OneDProperty;
		if (effectsTab.negative.value) {
			invertIndex = this.getEffects(layer).addProperty("ADBE Invert").propertyIndex;
			invertProperty().setValue(100);
		}
		const layering = Setting.get("UsingLayering", false);
		const optimize = Setting.get("OptimizeApplyEffects", true);
		//#endregion
		
		let noteOnCount = 0,
			lastEventType: RegularEventType = RegularEventType.NOTE_OFF,
			lastEventSofarTick = 0;
		const addNoteEvent = (noteEvent: NoteEvent) => { // 严格模式下不能在块内声明函数。
			if (noteEvent.sofarTick <= lastEventSofarTick && !(lastEventType === RegularEventType.NOTE_OFF && noteEvent instanceof NoteOnEvent))
				return; // 跳过同一时间点上的音符。
			const seconds = noteEvent.sofarTick * secondsPerTick + startTime;
			if (noteEvent instanceof NoteOnEvent) {
				if (noteEvent.interruptDuration === 0 || noteEvent.duration === 0 ||
					noteEvent.interruptDuration && noteEvent.interruptDuration < 0 ||
					noteEvent.duration && noteEvent.duration < 0) return;
				const hasDuration = noteEvent.interruptDuration !== undefined || noteEvent.duration !== undefined;
				const duration = noteEvent.interruptDuration ?? noteEvent.duration ?? 0;
				const noteOffSeconds = (noteEvent.sofarTick + duration) * secondsPerTick - MIN_INTERVAL + startTime;
				if (effectsTab.hFlip.value) {
					layer.scale.expressionEnabled = false;
					const key = layer.scale.addKey(seconds);
					const scale = noteOnCount % 2 ? -100 : 100;
					if (!optimize || !hasDuration) {
						layer.scale.setValueAtKey(key, [scale, 100]);
						layer.scale.setInterpolationTypeAtKey(key, KeyframeInterpolationType.HOLD);
					} else {
						layer.scale.setValueAtKey(key, [scale + ENTER_INCREMENTAL, 100 + ENTER_INCREMENTAL]);
						layer.scale.setInterpolationTypeAtKey(key, KeyframeInterpolationType.BEZIER);
						const key2 = layer.scale.addKey(noteOffSeconds);
						layer.scale.setValueAtKey(key2, [scale, 100]);
						layer.scale.setInterpolationTypeAtKey(key2, KeyframeInterpolationType.HOLD);
					}
				}
				if (effectsTab.cwRotation.value || effectsTab.ccwRotation.value) {
					layer.rotation.expressionEnabled = false;
					const value = effectsTab.cwRotation.value ? (noteOnCount % 4) * 90 : ((4 - noteOnCount % 4) % 4) * 90;
					const key = layer.rotation.addKey(seconds);
					if (!optimize || !hasDuration) {
						layer.rotation.setValueAtKey(key, value);
						layer.rotation.setInterpolationTypeAtKey(key, KeyframeInterpolationType.HOLD);
					} else {
						const startValue = value + ROTATION_INCREMENTAL * (effectsTab.cwRotation.value ? -1 : 1);
						layer.rotation.setValueAtKey(key, startValue);
						layer.rotation.setInterpolationTypeAtKey(key, KeyframeInterpolationType.BEZIER);
						const key2 = layer.rotation.addKey(noteOffSeconds);
						layer.rotation.setValueAtKey(key2, value);
						layer.rotation.setInterpolationTypeAtKey(key2, KeyframeInterpolationType.HOLD);
					}
				}
				if (effectsTab.timeRemap.value || effectsTab.timeRemap2.value) { // TODO: 时间重映射插值类型暂时无法使用定格关键帧。下方调音部分也是一样。
					layer.timeRemap.expressionEnabled = false;
					const key = layer.timeRemap.addKey(seconds);
					layer.timeRemap.setValueAtKey(key, curStartTime);
					// layer.timeRemap.setInterpolationTypeAtKey(key, KeyframeInterpolationType.LINEAR);
					if (hasDuration) {
						let key2 = layer.timeRemap.addKey(noteOffSeconds);
						const endTime = effectsTab.timeRemap.value ? curStartTime + layerLength : noteOffSeconds - seconds + curStartTime;
						if (endTime < (layer.source as AVItem).duration)
							layer.timeRemap.setValueAtKey(key2, endTime);
						else {
							layer.timeRemap.removeKey(key2);
							key2 = layer.timeRemap.addKey(seconds + sourceLength - curStartTime);
							layer.timeRemap.setValueAtKey(key2, sourceLength);
						}
						// layer.rotation.setInterpolationTypeAtKey(key2, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.HOLD);
					}
				}
				if (effectsTab.negative.value) {
					const key = invertProperty().addKey(seconds);
					invertProperty().setValueAtKey(key, noteOnCount % 2 ? 0 : 100);
					invertProperty().setInterpolationTypeAtKey(key, KeyframeInterpolationType.HOLD);
				}
				if (effectsTab.tunning.value && audioLayer) {
					audioLayer.timeRemap.expressionEnabled = false;
					const key = audioLayer.timeRemap.addKey(seconds);
					audioLayer.timeRemap.setValueAtKey(key, curStartTime);
					// audioLayer.timeRemap.setInterpolationTypeAtKey(key, KeyframeInterpolationType.LINEAR);
					if (hasDuration) {
						let key2 = audioLayer.timeRemap.addKey(noteOffSeconds);
						const duration2 = noteOffSeconds - seconds;
						const pitch = noteEvent.pitch - basePitch;
						const stretch = 2 ** (pitch / 12);
						let endTime = duration2 * stretch + curStartTime;
						if (endTime < (layer.source as AVItem).duration)
							audioLayer.timeRemap.setValueAtKey(key2, endTime);
						else {
							audioLayer.timeRemap.removeKey(key2);
							key2 = audioLayer.timeRemap.addKey(seconds + (sourceLength - curStartTime) / stretch);
							audioLayer.timeRemap.setValueAtKey(key2, sourceLength);
						}
						// audioLayer.rotation.setInterpolationTypeAtKey(key2, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.HOLD);
					}
				}
				if (layering && noteOnCount !== 0) {
					if (!isTunningOnly)
						layer = this.splitLayer(layer, seconds);
					if (effectsTab.tunning.value && audioLayer)
						audioLayer = this.splitLayer(audioLayer, seconds);
				}
				noteOnCount++;
				lastEventType = RegularEventType.NOTE_ON;
				lastEventSofarTick = noteEvent.sofarTick;
			} else if (noteEvent instanceof NoteOffEvent) {
				// const noteOffSeconds = seconds - MIN_INTERVAL; // 比前一个时间稍晚一点的时间，用于同一轨道上的同时音符。
				
				// lastEventType = RegularEventType.NOTE_OFF;
				// lastEventSofarTick = noteEvent.sofarTick;
			}
		}
		this.dealNoteEvents(track, comp, secondsPerTick, curStartTime, addNoteEvent);
	}
	
	/**
	 * 创建一个空对象图层。
	 * @param comp - 合成。
	 * @returns 空对象图层。
	 */
	private createNullLayer(comp: CompItem): AVLayer {
		let nullLayer: AVLayer;
	refindNullSource:
		while (true) {
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
					if (item.name === NULL_SOURCE_NAME && item instanceof FootageItem) { // TODO: 确认其为 SolidSource。
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
	private getEffects(layer: AVLayer): PropertyGroup {
		return layer("Effects") as PropertyGroup;
	}
	
	/**
	 * 为指定图层添加一个表达式控制 - 滑块控制的效果。
	 * @param layer - 图层。
	 * @param name - 滑块名称。
	 * @returns 滑块控制效果序号。
	 */
	private addSliderControl(layer: AVLayer, name: string): number {
		const slider = this.getEffects(layer).addProperty("ADBE Slider Control") as PropertyGroup; // 中文版竟然能正常运行？ADBE 是什么鬼？ // 后人注：属性的英文名前面加上“ADBE”之后，即可在任何本地化语言使用。
		slider.name = name;
		return slider.propertyIndex; // 向索引组添加新属性时，将从头开始重新创建索引组，从而使对属性的所有现有引用无效。
	}
	
	private setValueAtTime(layer: AVLayer, checks: Checkbox[], check: Checkbox, seconds: number, value: number, inType: KeyframeInterpolationType, outType: KeyframeInterpolationType = inType): void {
		const index = checks.indexOf(check);
		if (index === -1) return;
		// 注：根据说明文档，将创建的效果等属性的引用赋值给变量后，下一次创建新的效果时，之前的引用会变为“对象无效”。只能通过其序号进行访问。
		const slider = this.getEffects(layer).property(index + 1).property(1) as OneDProperty;
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
			for (const noteEvent of track.events)
				addNoteEvent(noteEvent);
		else {
			let noteCount = 0;
			while (noteCount * secondsPerTick <= startTime + comp.duration)
				addNoteEvent(new NoteOnEvent(60, 100, +!!noteCount, 1, noteCount++));
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
}
