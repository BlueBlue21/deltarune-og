import { Hono, type Context } from "hono";
import { ImageResponse } from "@cloudflare/pages-plugin-vercel-og/api";

const app = new Hono();

async function loadGalmuri9Font(c: Context) {
	const url = new URL("/fonts/Galmuri9.ttf", c.req.url).toString();
	const response = await c.env.assets.fetch(url);
	if (response.status === 200) {
		return [
			{
				name: "Galmuri9",
				data: await response.arrayBuffer(),
				style: "normal",
			},
		];
	}

	throw new Error("Faild to load font data.");
}

async function loadImage(c: Context, path: string) {
	const url = new URL(path, c.req.url).toString();
	const response = await c.env.assets.fetch(url);
	if (response.status === 200) {
		const contentType = response.headers.get("content-type");
		const arrayBuffer = await response.arrayBuffer();
		const base64 = Buffer.from(arrayBuffer).toString("base64");

		return `url('data:${contentType};base64,${base64}')`;
	}

	throw new Error("Faild to load image data.");
}

async function textBox(c: Context, text: string) {
	const textBoxImage = await loadImage(c, "/images/text_box.png");
	const galmuri9Font = await loadGalmuri9Font(c);

	return new ImageResponse(
		<div
			style={{
				display: "flex",
				width: "100%",
				height: "100%",
				backgroundImage: textBoxImage,
			}}
		>
			<p
				style={{
					margin: "15px",
					padding: "15px",
					width: "100%",
					height: "82%",
					font: "20px Galmuri9",
					overflow: "hidden",
					color: "white",
				}}
			>
				* {text}
			</p>
		</div>,
		{
			width: 594,
			height: 168,
			fonts: galmuri9Font,
		},
	);
}

app.get("/", (c) => {
	return textBox(c, "그 모든 일이 있었음에도, 여전히 당신이다.");
});

app.get("/new", (c) => {
	const text = c.req.query("text");
	if (!text) {
		return textBox(c, "얘야, text를 찾을 수 없단다.");
	}

	return textBox(c, text.replaceAll("_", " ").replaceAll("|", "."));
});

export default app;
