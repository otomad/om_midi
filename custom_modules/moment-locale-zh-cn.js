import moment from "moment";

export default function initMomentLocaleZhCn() {
	moment.locale("zh-cn", {
		months: "一_二_三_四_五_六_七_八_九_十_十一_十二".split("_"),
		monthsShort: "1_2_3_4_5_6_7_8_9_10_11_12".split("_"),
		weekdays: "星期日_星期一_星期二_星期三_星期四_星期五_星期六".split("_"),
		weekdaysShort: "周日_周一_周二_周三_周四_周五_周六".split("_"),
		weekdaysMin: "日_一_二_三_四_五_六".split("_"),
		longDateFormat: {
			LT: "A H:mm",
			LTS: "A H:mm:ss",
			L: "YYYY/MM/DD",
			LL: "YYYY 年 MMM 月 D 日",
			LLL: "YYYY 年 MMM 月 D 日 A H:mm",
			LLLL: "YYYY 年 MMM 月 D 日 dddd A H:mm:ss",
			l: "YYYY/MM/DD",
			ll: "YYYY 年 MMM 月 D 日",
			lll: "YYYY 年 MMM 月 D 日 A H:mm",
			llll: "YYYY 年 MMM 月 D 日 dddd A H:mm:ss",
		},
		meridiemParse: /凌晨|早上|上午|中午|下午|晚上/,
		meridiemHour: function (h, meridiem) {
			let hour = h;
			if (hour === 12) {
				hour = 0;
			}
			if (meridiem === "凌晨" || meridiem === "早上" ||
				meridiem === "上午") {
				return hour;
			} else if (meridiem === "下午" || meridiem === "晚上") {
				return hour + 12;
			} else {
				// "中午"
				return hour >= 11 ? hour : hour + 12;
			}
		},
		meridiem: function (hour, minute, isLower) {
			const hm = hour * 100 + minute;
			if (hm < 600) {
				return "凌晨";
			} else if (hm < 900) {
				return "早上";
			} else if (hm < 1200) {
				return "上午";
			} else if (hm < 1300) {
				return "中午";
			} else if (hm < 1800) {
				return "下午";
			} else {
				return "晚上";
			}
		},
		calendar: {
			sameDay: function () {
				return this.minutes() === 0 ? "[今天]Ah[点整]" : "[今天]LT";
			},
			nextDay: function () {
				return this.minutes() === 0 ? "[明天]Ah[点整]" : "[明天]LT";
			},
			lastDay: function () {
				return this.minutes() === 0 ? "[昨天]Ah[点整]" : "[昨天]LT";
			},
			nextWeek: function () {
				let startOfWeek, prefix;
				startOfWeek = moment().startOf("week");
				prefix = this.diff(startOfWeek, "days") >= 7 ? "[下]" : "[本]";
				return this.minutes() === 0 ? prefix + "dddAh点整" : prefix + "dddAh点mm";
			},
			lastWeek: function () {
				let startOfWeek, prefix;
				startOfWeek = moment().startOf("week");
				prefix = this.unix() < startOfWeek.unix() ? "[上]" : "[本]";
				return this.minutes() === 0 ? prefix + "dddAh点整" : prefix + "dddAh点mm";
			},
			sameElse: "LL"
		},
		ordinalParse: /\d{1,2}(日|月|周)/,
		ordinal: function (number, period) {
			switch (period) {
				case "d":
				case "D":
				case "DDD":
					return number + "日";
				case "M":
					return number + "月";
				case "w":
				case "W":
					return number + "周";
				default:
					return number;
			}
		},
		relativeTime: {
			future: "%s 内",
			past: "%s 前",
			s: "几秒",
			m: "1 分钟",
			mm: "%d 分钟",
			h: "1 小时",
			hh: "%d 小时",
			d: "1 天",
			dd: "%d 天",
			M: "1 个月",
			MM: "%d 个月",
			y: "1 年",
			yy: "%d 年"
		},
		week: {
			// GB/T 7408-1994《数据元和交换格式·信息交换·日期和时间表示法》与ISO 8601:1988等效
			dow: 1, // Monday is the first day of the week.
			doy: 4  // The week that contains Jan 4th is the first week of the year.
		}
	});
}
