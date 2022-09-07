/**
 * 获取当前激活合成。
 * @returns 当前合成。如果当前没有激活的合成则返回 null。
 */
export default function getComp(): CompItem | null {
	const comp = app.project.activeItem as CompItem;
	if (!isValid(comp)) return null;
	return comp;
}
