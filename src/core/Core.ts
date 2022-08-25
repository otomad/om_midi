import { CannotFindCompositionError, MyError, NoMidiError, NoOptionsCheckedError } from "../exceptions";
import Portal from "../ui/Portal";
import getComp from "../module/getComp";
import Setting from "../module/Setting";
import { NoteOffEvent, NoteOnEvent } from "../midi/NoteEvent";
import { arrayIndexOf } from "../module/extensions";

export default class Core {
	portal: Portal;
	nullSource?: AVItem;
	
	constructor(portal: Portal) {
		this.portal = portal;
	}
	
	apply() {
		const comp = getComp();
		if (comp === null) throw new CannotFindCompositionError();
		app.beginUndoGroup("om midi");
		try {
			if (this.portal.getSelectedTab() === this.portal.nullObjTab)
				this.applyNull(comp);
		} catch (error) {
			// throw new MyError(error as Error);
		} finally {
			app.endUndoGroup();
		}
	}
	
	applyNull(comp: CompItem) {
		const nullTab = this.portal.nullObjTab;
		if (this.portal.selectedTrackIndexes.length === 0 || !this.portal.midi) throw new NoMidiError();
		const checks = nullTab.getCheckedChecks();
		if (checks.length === 0) throw new NoOptionsCheckedError();
		let usingSelectedLayerName = Setting.get("UsingSelectedLayerName", false);
		if (comp.selectedLayers.length === 0) usingSelectedLayerName = false; // 如果没有选中任何图层，自然肯定不能使用图层名称了。
		const ticksPerQuarter = this.portal.midi.timeDivision; // 基本时间每四分音符
		let secondsPerTick: number;
		if (ticksPerQuarter instanceof Array) {
			secondsPerTick = 1 / ticksPerQuarter[0] / ticksPerQuarter[1]; // 帧每秒这种格式不支持，随便弄一个数不要报错就好了。
		} else {
			const quartersPerMinute = parseFloat(this.portal.selectBpmTxt.text), // 四分音符每分钟 (BPM)
				secondsPerQuarter = 60 / quartersPerMinute; // 秒每四分音符
			secondsPerTick = secondsPerQuarter / ticksPerQuarter; // 秒每基本时间
		}
		for (const trackIndex of this.portal.selectedTrackIndexes) {
			const track = this.portal.midi?.tracks[trackIndex];
			if (track === undefined) continue;
			const nullLayer = this.createNullLayer(comp);
			nullLayer.name = "[midi]" + (usingSelectedLayerName ? comp.selectedLayers[0].name :
				track.name ?? `Channel ${track.channel ?? 0}`);
			const sliderIndexes: number[] = []; // 限制：只能存储索引值。
			for (const check of checks) {
				const slider = this.addSliderControl(nullLayer, check.text);
				sliderIndexes.push(slider);
			}
			const setValueAtTime = (check: Checkbox, seconds: number, value: number, inType: KeyframeInterpolationType, outType?: KeyframeInterpolationType) =>
				this.setValueAtTime(nullLayer, checks, sliderIndexes, check, seconds, value, inType, outType);
			let tick: number = 0, noteOnCount = 0;
			for (const noteEvent of track.events) {
				const lastTick = tick;
				tick += noteEvent.deltaTime;
				let seconds = tick * secondsPerTick;
				const increase = () => {
					if (tick <= lastTick) {
						tick = lastTick + 0.0005; // 比前一个时间稍晚一点的时间，用于同一轨道上的同时音符。
						seconds = tick * secondsPerTick;
					}
				}
				if (noteEvent instanceof NoteOnEvent) {
					increase();
					setValueAtTime(nullTab.pitch, seconds, noteEvent.pitch(), KeyframeInterpolationType.HOLD);
					setValueAtTime(nullTab.velocity, seconds, noteEvent.velocity(), KeyframeInterpolationType.HOLD);
					setValueAtTime(nullTab.count, seconds, noteOnCount, KeyframeInterpolationType.HOLD);
					setValueAtTime(nullTab.bool, seconds, +!(noteOnCount % 2), KeyframeInterpolationType.HOLD); // 迷惑行为，为了和旧版脚本行为保持一致。
					setValueAtTime(nullTab.scale, seconds, noteOnCount % 2 ? -100 : 100, KeyframeInterpolationType.HOLD);
					setValueAtTime(nullTab.cwRotation, seconds, (noteOnCount % 4) * 90, KeyframeInterpolationType.HOLD);
					setValueAtTime(nullTab.timeRemap, seconds, 0, KeyframeInterpolationType.LINEAR);
					setValueAtTime(nullTab.whirl, seconds, noteOnCount % 2, KeyframeInterpolationType.LINEAR);
					noteOnCount++;
				} else if (noteEvent instanceof NoteOffEvent) {
					increase();
					setValueAtTime(nullTab.timeRemap, seconds, 1, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.HOLD);
					setValueAtTime(nullTab.whirl, seconds, noteOnCount % 2, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.HOLD);
				}
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
		if (this.nullSource && this.nullSource.parentFolder) { // 如果有现有的空对象纯色，不用重新新建一个。
			nullLayer = comp.layers.add(this.nullSource, comp.workAreaDuration);
			nullLayer.opacity.setValue(0);
			nullLayer.anchorPoint.setValue([0, 0]);
		} else {
			nullLayer = comp.layers.addNull(comp.workAreaDuration);
			this.nullSource = nullLayer.source;
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
	
	private setValueAtTime(layer: AVLayer, checks: Checkbox[], sliderIndexes: number[], check: Checkbox, seconds: number, value: number, inType: KeyframeInterpolationType, outType: KeyframeInterpolationType = inType): void {
		const index = arrayIndexOf(checks, check);
		if (index === -1) return;
		const slider = this.getEffects(layer).property(sliderIndexes[index]).property(1) as OneDProperty;
		slider.setValueAtTime(seconds, value);
		slider.setInterpolationTypeAtKey(slider.numKeys, inType, outType); // 这里投了个巧，直接取最后一个关键帧，因为关键帧不可能插在前面。
	}
}
