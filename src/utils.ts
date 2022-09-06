/**
 * 使用方法：
 * 将本文件命名为 om_utils.jsx。
 *     1. 放置在 aep 工程的相同目录下。
 *     在图层表达式中声明
 *     <pre>{@code $.evalFile(thisProject.fullPath.replace(/\\[^\\]*$/, "\\om_utils.jsx"));}</pre>
 * 
 *     2. 放置在任意位置，然后添加到 AE 项目中。
 *     在图层表达式中声明
 *     <pre>{@code footage("om_utils.jsx").sourceData;}</pre>
 * 即可使用此处定义的函数。
 */

declare const thisLayer: AVLayer;
declare const thisComp: CompItem;
declare const thisProperty: Property;

/**
 * 将 om_midi 生成的时间重映射 [0 ~ 1] 值映射到素材源的实际时间值。
 * @version om_midi v2.0
 * @param {string} midiName - om_midi 图层名称。如果留空，则默认为当前图层名称前加上“[midi]”。
 * @param {boolean} stretchOnly - 仅使用伸缩素材。
 * @param {number} rate - 回放速率。
 * @returns {number} 时间重映射后的实际值。
 */
export function timeRemap(midiName: string, stretchOnly: boolean = false, rate: number = 1): number {
	const midi = thisComp.layer(midiName || _getMidiName());
	const progress = midi.effect("时间重映射1")("滑块");
	const maxDuration = (+(thisLayer.source.duration / thisLayer.source.frameDuration).toFixed(0) - 1) * thisLayer.source.frameDuration;
	if (stretchOnly)
		return progress * maxDuration; // 取消注释此行即可强制使用伸缩素材。
	let currentKey, nextKey = currentKey = progress.nearestKey(thisLayer.time);
	const _time = thisLayer.clamp(thisLayer.time, progress.key(1).time, progress.key(progress.numKeys).time);
	if (_time > currentKey.time && currentKey.index < progress.numKeys)
		nextKey = progress.key(currentKey.index + 1);
	else if (currentKey.index !== 1)
		currentKey = progress.key(currentKey.index - 1);
	const noteDuration = nextKey.time - currentKey.time;
	return progress.value * Math.min(noteDuration * rate, maxDuration);
}

function _identifyKeyContainerType(object: unknown) {
	if (typeof object === "string") // 如果是字符串，则返回该字符串对应的图层。
		return thisComp.layer(object).marker;
	else if (object.marker !== undefined) // 这是一个图层。
		return object.marker;
	else if (object.nearestKey !== undefined) // 这是一个属性。
		return object;
	else throw new TypeError("你特喵的扔了啥进去？");
}

/**
 * 获取指定属性/图层的前一个或当前关键帧/标记。
 * @param {Property} property - 指定的属性/图层/图层名称。留空表示当前属性。
 * @param {number} time - 时间。留空表示当前时间。
 * @returns {number} 前一个或当前关键帧/标记。如果在此之前且当前没有任何关键帧/标记，返回 null。
 * @throws {Error} 若指定的属性没有关键帧/标记，则会报错。
 */
export function getPreviousKey(property: Property = thisProperty, time: number = thisLayer.time): number | null {
	property = _identifyKeyContainerType(property);
	const key = property.nearestKey(time);
	if (key.time <= time) return key;
	else if (key.index <= 1) return null;
	else return property.key(key.index - 1);
}

/**
 * 获取指定属性/图层的后一个关键帧/标记。
 * @param {Property} property - 指定的属性/图层/图层名称。留空表示当前属性。
 * @param {number} time - 时间。留空表示当前时间。
 * @returns {number} 后一个关键帧/标记。如果在此之后没有任何关键帧/标记，返回 null。
 * @throws {Error} 若指定的属性没有关键帧/标记，则会报错。
 */
export function getNextKey(property: Property = thisProperty, time: number = thisLayer.time): number | null {
	property = _identifyKeyContainerType(property);
	const key = property.nearestKey(time);
	if (key.time > time) return key;
	else if (key.index >= property.numKeys) return null;
	else return property.key(key.index + 1);
}

function _getMidiName() {
	return "[midi]" + thisLayer.name;
}

/**
 * 缩放高度。
 * @param {string} midiName - om_midi 图层名称。
 * @param {number} incremental - 增量。
 * @param {number} exponential - 指数。
 * @returns {number} 缩放高度。
 */
export function rescaleHeight(midiName: string, incremental: number = 15, exponential: number = 3): number {
	const midi = thisComp.layer(midiName || _getMidiName());
	return ((1 - midi.effect("时间重映射1")("滑块")) ** exponential) * incremental + thisProperty;
}

/**
 * 缩放宽度。<br />
 * 必须搭配“缩放高度”的函数一同使用。
 * @param {string} midiName - om_midi 图层名称。
 * @returns {number} 缩放宽度。
 */
export function rescaleWidth(midiName: string): number {
	const scale = Math.abs(effect("变换")("缩放高度"));
	const midi = thisComp.layer(midiName || _getMidiName());
	const isFlip = Math.sign(midi.effect("缩放")("滑块"));
	return isFlip * scale;
}

/**
 * 根据 MIDI 节奏从指定的开始值（可非线性）变化到结束值。
 * @param {number} start - 开始值。
 * @param {number} end - 结束值。
 * @param {number} exponential - 指数。
 * @param {string} midiName - om_midi 图层名称。
 * @returns {number} 变化值。
 */
export function transform(start: number, end: number, exponential: number = 3, midiName: string): number {
	if (arguments.length < 2) throw new TypeError(`Failed to execute 'transform': ${2} argument required, but only ${arguments.length} present.`);
	return thisComp.layer(midiName || _getMidiName()).effect("时间重映射1")("滑块") ** (1 / exponential) * (end - start) + start;
}

/**
 * 自动根据文本对象的文本发生变化而生成动画。
 * @param {number} centerValue - 中间值。必填。
 * @param {number} startValue - 开始值。必填。
 * @param {number} endValue - 结束值。如果为空则由中间值和开始值间接求得。
 * @param {number} beatDuration - 过渡动画持续时间。如果为空则根据 Marker Conductor 生成的 BPM 空对象上的标记求得。
 * @returns 当前时间的值。
 */
export function byRawText(centerValue: number, startValue: number, endValue: number, beatDuration: number) {
	if (endValue === undefined)
		endValue = centerValue * 2 - startValue;
	if (beatDuration === undefined) {
		let bpm = null;
		for (let i = 1; i <= thisComp.numLayers; i++)
			if (thisComp.layer(i).name.startsWith("BPM:")) {
				bpm = thisComp.layer(i);
				break;
			}
		if (bpm === null) throw new ReferenceError("未指定过渡动画持续时间或合成中不包含 BPM 轨道。");
		beatDuration = bpm.marker.key(2).time - bpm.marker.key(1).time;
	}
	let ret = (thisLayer.text.sourceText.nearestKey(thisLayer.time).time - thisLayer.time) / beatDuration / 2;
	if (thisLayer.text.sourceText.nearestKey(thisLayer.time).time === thisLayer.time) ret = 0.5;
	else ret = (((0.5 - Math.min(Math.abs(ret), 0.5)) * -Math.sign(ret)) * 2) ** 3 / 2;
	return centerValue + (ret >= 0 ? (startValue - centerValue) : (centerValue - endValue)) * ret * 2;
}

/**
 * 展现对象的所有键名。用于调试。
 * @param {object} object - 任意对象。
 * @returns {never} 直接将结果报错显示到错误提示中。
 */
export function dir(object: object): never {
	const keys = [];
	for (const key in object)
		keys.push(key);
	throw keys.join();
}
