/**
 * 缓动类型。
 */
enum EaseType {
	/**
	 * 缓入。
	 */
	EASE_IN,
	/**
	 * 缓出。
	 */
	EASE_OUT,
	/**
	 * 缓入缓出。
	 */
	EASE_IN_OUT,
	/**
	 * 线性。
	 */
	LINEAR,
	/**
	 * 定格两边。
	 */
	HOLD,
	/**
	 * 定格左边。
	 */
	HOLD_IN,
	/**
	 * 定格右边。
	 */
	HOLD_OUT,
}

export default EaseType;
