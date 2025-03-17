import dayjs from "dayjs";

export default class DateUtil {

	static time = () => {
		return Math.floor(new Date().getTime() / 1000);
	}


	static dateToInputDate = (time: number) => {
		var local = new Date(time * 1000);
		local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
		return local.toJSON().slice(0, 10);
	}


	// The date format for value and defaultValue should be
	// [YYYY-MM-DD][T][hh:mm] (type=datetime-local) / [YYYY-MM-DD] (type=date)
	// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Input/date#value
	static dateToInputDatetime(date?: number, length?: number) {
		if (!date || !dayjs(date).isValid()) {
			return undefined;
		}

		return new Date(date * 1000).toISOString().substring(0, length ?? 16);
	}


	static getDatetimeLocalValue = (date: Date) => {
		date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
		return date.toISOString().slice(0, 16);
	}


	static getMondaysWithDateRange = (start: number, end: number) => {
		var current = end
		var results = [];
		while (current >= start) {
			current = DateUtil.getMonday(current);
			results.push(current)
			current = current - 7 * 3600 * 24;
		}

		return results.sort((b, a) => b - a);
	}


	static get21dayslabels() {
		var current_time = Math.floor(new Date().getTime() / 1000);

		var labels: string[] = [];

		for (let index = 21; index > 0; index--) {
			labels.push(this.getDayWithoutYear(current_time - index * 60 * 60 * 24));
		}

		return labels;
	}

	static getDayWithoutYear = function (value: number) {
		const date = new Date(value * 1000);
		return `${date.getDate()}/${date.getMonth() + 1}`;
	};

	static getMondayInMonth = (ts: number) => {
		var start_month = DateUtil.beginMonth(ts);

		var current = DateUtil.endMonth(ts);
		var results = [];
		while (current >= start_month) {
			current = DateUtil.getMonday(current);
			results.push(current)
			current = current - 7 * 3600 * 24;
		}

		return results;
	}


	static getMonday(d?: number) {
		if (!d) {
			d = DateUtil.time()
		}
		var date = new Date(d * 1000);
		date = new Date(date.getFullYear(), date.getMonth(), date.getDate())
		var day = date.getDay();



		var diff = date.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday

		date.setDate(diff);
		date.setMilliseconds(0);
		date.setMinutes(0);
		date.setHours(0);
		date.setSeconds(0);
		var time = Math.round(new Date(date).getTime() / 1000);
		return time;
	}

	static beginMonth(d: number) {
		var date = new Date(d * 1000);
		date = new Date(date.getFullYear(), date.getMonth(), date.getDate())

		date.setDate(0);
		date.setMilliseconds(0);
		date.setMinutes(0);
		date.setHours(0);
		date.setSeconds(0);
		var time = Math.round(new Date(date).getTime() / 1000);
		return time;
	}


	static getDayTime = function (value: number) {
		const date = new Date(value * 1000);
		return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
	};


	static getDay = function (value: number) {
		const date = new Date(value * 1000);
		return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
	};


	static endMonth(d: number) {
		var date = new Date(d * 1000);
		date = new Date(date.getFullYear(), date.getMonth() + 1, date.getDate())

		date.setDate(0);
		date.setMilliseconds(0);
		date.setMinutes(0);
		date.setHours(0);
		date.setSeconds(0);
		var time = Math.round(new Date(date).getTime() / 1000);
		return time;
	}


	static displayTime = (input: number) => {
		if (!Number.isNaN(input)) {
			let minutes = '';
			let seconds = '';
			minutes = Math.floor(input / 60) > 9 ? Math.floor(input / 60).toString() : "0" + Math.floor(input / 60).toString();
			seconds = Math.floor(input % 60) > 9 ? Math.floor(input % 60).toString() : "0" + Math.floor(input % 60).toString();
			return minutes + ":" + seconds;
		} else {
			return "00:00";
		}
	};



	static getTime(value: number) {
		const days = Math.floor(value / 86400);
		const hours = Math.floor(value % 86400 / 3600);
		const minutes = Math.floor(value % 3600 / 60);
		const seconds = Math.floor(value % 60);
		return (days || hours) ? `${days} days ${hours} hours ${minutes} minutes` : `${hours} hours ${minutes} minutes ${seconds} seconds`;
	}


	static getExactDay = function (value: number) {
		var date = new Date(value * 1000);
		if (date.getHours() == 0 && date.getMinutes() == 0)
			return ` ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
		return ` ${date.getHours() > 9 ? date.getHours() : "0" + date.getHours().toString()}:${date.getMinutes() > 9 ? date.getMinutes() : "0" + date.getMinutes().toString()} ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
	}

}