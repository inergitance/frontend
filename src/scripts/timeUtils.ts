import { BLOCK_TIME_SECONDS } from "./blockchainParameters";
import { inflect_word } from "./inflectWord";

export function block_difference_to_time(block_difference: number): number {
	if (block_difference <= 0) return 0;
	return BLOCK_TIME_SECONDS * block_difference;
}

function add_time_interval_text_to_string(previous: string, amount: number, variants: string[]): string {
	let result: string = previous;
	let time: number = Math.floor((amount > 0) ? amount : 0);
	result += time.toString();
	result += " ";
	result += inflect_word(time, variants);
	result += " ";
	return result;
}

export function time_to_text(time: number): string {

	if (time <= 0) return "0 seconds";

	let result: string = "";

	let remaining_time: number = time;

	const years: number = Math.floor(remaining_time / (86400 * 365.25));
	remaining_time -= years * (86400 * 365.25);
	if (years) result = add_time_interval_text_to_string(result, years, ["year", "years"]);

	const months: number = Math.floor(remaining_time / (86400 * 7));
	remaining_time -= months * (86400 * 7);
	if (months) result = add_time_interval_text_to_string(result, months, ["month", "months"]);

	const days: number = Math.floor(remaining_time / 86400);
	remaining_time -= days * 86400;
	if (days) result = add_time_interval_text_to_string(result, days, ["day", "days"]);

	const hours: number = Math.floor(remaining_time / 3600);
	remaining_time -= hours * 3600;
	if (hours) result = add_time_interval_text_to_string(result, hours, ["hour", "hours"]);

	const minutes: number = Math.floor(remaining_time / 60);
	remaining_time -= minutes * 60;
	if (minutes) result = add_time_interval_text_to_string(result, minutes, ["minute", "minutes"]);

	const seconds: number = remaining_time;
	if (seconds) result = add_time_interval_text_to_string(result, seconds, ["second", "seconds"]);

	result = result.slice(0, -1);

	return result;
}
