import { CannotFindCompositionError, MyError, NoLayerSelectedError, NoMidiError, NoOptionsCheckedError, NotOneTrackForApplyEffectsOnlyError } from "../errors";
import Portal from "../ui/Portal";
import getComp from "../module/getComp";
import Setting from "../module/Setting";
import { NoteOffEvent, NoteOnEvent } from "../midi/NoteEvent";
import { RegularEventType } from "../midi/MidiFormatType";

const MIN_INTERVAL = 5e-4;
const NULL_SOURCE_NAME = "om midi null"

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
		if (this.portal.selectedTracks.length === 0 || !this.portal.midi) throw new NoMidiError();
		const checks = nullTab.getCheckedChecks();
		if (checks.length === 0) throw new NoOptionsCheckedError();
		let usingSelectedLayerName = Setting.get("UsingSelectedLayerName", false);
		const selectedLayer = this.getSelectLayer(comp);
		if (selectedLayer === null) usingSelectedLayerName = false; // 如果没有选中任何图层，自然肯定不能使用图层名称了。
		const secondsPerTick = this.getSecondsPerTick();
		for (const track of this.portal.selectedTracks) {
			if (track === undefined) continue;
			const nullLayer = this.createNullLayer(comp);
			nullLayer.name = "[midi]" + (usingSelectedLayerName && selectedLayer !== null ? selectedLayer.name :
				(track.name ?? `Channel ${track.channel ?? 0}`));
			for (const check of checks)
				this.addSliderControl(nullLayer, check.text); // 限制：只能存储索引值。
			const setValueAtTime = (check: Checkbox, seconds: number, value: number, inType: KeyframeInterpolationType, outType?: KeyframeInterpolationType) =>
				this.setValueAtTime(nullLayer, checks, check, seconds, value, inType, outType);
			let noteOnCount = 0,
				lastEventType: RegularEventType = RegularEventType.NOTE_OFF,
				lastEventSofarTick = 0;
			for (const noteEvent of track.events) {
				if (noteEvent.sofarTick <= lastEventSofarTick && !(lastEventType === RegularEventType.NOTE_OFF && noteEvent instanceof NoteOnEvent))
					continue; // 跳过同一时间点上的音符。
				const seconds = noteEvent.sofarTick * secondsPerTick;
				if (noteEvent instanceof NoteOnEvent) {
					if (noteEvent.interruptDuration === 0 || noteEvent.duration === 0 ||
						noteEvent.interruptDuration && noteEvent.interruptDuration < 0 ||
						noteEvent.duration && noteEvent.duration < 0) continue;
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
				}
			}
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
		const startTimePos = this.portal.startTimeCombo.getSelectedIndex();
		let startTime = startTimePos === 0 ? comp.displayStartTime :
			(startTimePos === 1 ? comp.time :
			(startTimePos === 2 ? comp.workAreaStart : 0)); // ExtendScript 似乎对三元运算符的优先级有偏见。
		layer.startTime = startTime;
		let beat = 1;
		const nextBeat = (): string => {
			const comment = String(beat);
			beat = beat % parseInt(marker.beatTxt.text) + 1;
			return comment;
		}
		const bpm = parseFloat(marker.bpmTxt.text);
		while (startTime <= comp.displayStartTime + comp.duration) {
			layer.marker.setValueAtTime(startTime, new MarkerValue(nextBeat()));
			startTime += 60 / bpm;
		}
	}
	
	applyEffects(comp: CompItem) {
		app.beginUndoGroup("om midi - Apply Effects");
		const effectsTab = this.portal.applyEffectsTab;
		if (this.portal.selectedTracks.length === 0 || !this.portal.midi) throw new NoMidiError();
		if (effectsTab.getCheckedChecks().length === 0) throw new NoOptionsCheckedError();
		if (this.portal.selectedTracks.length !== 1) throw new NotOneTrackForApplyEffectsOnlyError();
		const layer = this.getSelectLayer(comp);
		if (layer === null) throw new NoLayerSelectedError();
		const secondsPerTick = this.getSecondsPerTick();
		const track = this.portal.selectedTracks[0];
		
		if (layer.timeRemapEnabled) layer.timeRemapEnabled = false;
		const source: AVItem = layer.source;
		const sourceLength = (+(source.duration / source.frameDuration).toFixed(0) - 1) * source.frameDuration;
		const layerLength = layer.outPoint - layer.startTime - source.frameDuration;
		let startTime = 0;
		if (effectsTab.timeRemap.value || effectsTab.timeRemap2.value || effectsTab.tunning.value) {
			layer.timeRemapEnabled = true;
			layer.timeRemap.removeKey(2);
			startTime = layer.timeRemap.value;
		}
		let noteOnCount = 0,
			lastEventType: RegularEventType = RegularEventType.NOTE_OFF,
			lastEventSofarTick = 0;
		for (const noteEvent of track.events) {
			if (noteEvent.sofarTick <= lastEventSofarTick && !(lastEventType === RegularEventType.NOTE_OFF && noteEvent instanceof NoteOnEvent))
				continue; // 跳过同一时间点上的音符。
			const seconds = noteEvent.sofarTick * secondsPerTick;
			if (noteEvent instanceof NoteOnEvent) {
				if (noteEvent.interruptDuration === 0 || noteEvent.duration === 0 ||
					noteEvent.interruptDuration && noteEvent.interruptDuration < 0 ||
					noteEvent.duration && noteEvent.duration < 0) continue;
				if (effectsTab.hFlip.value) {
					const key = layer.scale.addKey(seconds);
					layer.scale.setValueAtKey(key, [noteOnCount % 2 ? -100 : 100, 100]);
					layer.scale.setInterpolationTypeAtKey(key, KeyframeInterpolationType.HOLD);
				}
				if (effectsTab.cwRotation.value || effectsTab.ccwRotation.value) {
					const value = effectsTab.cwRotation.value ? (noteOnCount % 4) * 90 : ((4 - noteOnCount % 4) % 4) * 90;
					const key = layer.rotation.addKey(seconds);
					layer.rotation.setValueAtKey(key, value);
					layer.rotation.setInterpolationTypeAtKey(key, KeyframeInterpolationType.HOLD);
				}
				if (effectsTab.timeRemap.value || effectsTab.timeRemap2.value) {
					const key = layer.timeRemap.addKey(seconds);
					layer.timeRemap.setValueAtKey(key, startTime);
					// layer.timeRemap.setInterpolationTypeAtKey(key, KeyframeInterpolationType.LINEAR);
					if (noteEvent.interruptDuration !== undefined || noteEvent.duration !== undefined) {
						const duration = noteEvent.interruptDuration ?? noteEvent.duration!;
						const noteOffSeconds = (noteEvent.sofarTick + duration) * secondsPerTick - MIN_INTERVAL;
						const key2 = layer.timeRemap.addKey(noteOffSeconds);
						const endTime = effectsTab.timeRemap.value ? startTime + layerLength : noteOffSeconds - seconds + startTime;
						layer.timeRemap.setValueAtKey(key2, endTime);
						// layer.rotation.setInterpolationTypeAtKey(key2, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.HOLD);
					}
				}
				if (effectsTab.tunning.value) { // 已知问题：拉伸（时间重映射截断）长度不能比原素材长；如果素材不在项目开头，前面的内容无法播放
					const key = layer.timeRemap.addKey(seconds);
					layer.timeRemap.setValueAtKey(key, startTime);
					// layer.timeRemap.setInterpolationTypeAtKey(key, KeyframeInterpolationType.LINEAR);
					if (noteEvent.interruptDuration !== undefined || noteEvent.duration !== undefined) {
						const duration = noteEvent.interruptDuration ?? noteEvent.duration!;
						const noteOffSeconds = (noteEvent.sofarTick + duration) * secondsPerTick - MIN_INTERVAL;
						const key2 = layer.timeRemap.addKey(noteOffSeconds);
						const duration2 = noteOffSeconds - seconds;
						const pitch = noteEvent.pitch - 60;
						const stretch = 2 ** (pitch / 12);
						layer.timeRemap.setValueAtKey(key2, duration2 * stretch + startTime);
						// layer.rotation.setInterpolationTypeAtKey(key2, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.HOLD);
					}
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
			} catch (error) {
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
					if (item.name === NULL_SOURCE_NAME && item instanceof FootageItem) {
						this.nullSource = item;
						nullSource.remove();
						continue refindNullSource;
					}
				}
				this.nullSource = nullSource;
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
		const slider = this.getEffects(layer).addProperty("ADBE Slider Control") as PropertyGroup; // 中文版竟然能正常运行？ADBE 是什么鬼？
		slider.name = name;
		return slider.propertyIndex; // 向索引组添加新属性时，将从头开始重新创建索引组，从而使对属性的所有现有引用无效。
	}
	
	private setValueAtTime(layer: AVLayer, checks: Checkbox[], check: Checkbox, seconds: number, value: number, inType: KeyframeInterpolationType, outType: KeyframeInterpolationType = inType): void {
		const index = checks.indexOf(check);
		if (index === -1) return;
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
}
