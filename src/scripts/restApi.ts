export async function get_request(url: string) {
	const request = await fetch(url);
	const result = await request.json();
	return result;
}

export async function post_request(url: string, body: string) {

	const request = await fetch(url, {
		method: 'POST',
		body,
		headers: {
			'Content-Type': 'application/json',
		}
	});

	const result = await request.json();

	return result;
}
