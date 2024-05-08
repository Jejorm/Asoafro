/** @type {import('tailwindcss').Config} */
export default {
	content: [
		'./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
	],
	darkMode: 'class',
	theme: {
		extend: {
			height: {
				100: "26rem",
				104: "28rem",
				108: "32rem"
			},

			colors: {
				"primary": {
					50: "#DAEFF6",
					100: "#CAE8F2",
					200: "#A5D8E9",
					300: "#84CAE1",
					400: "#5FBAD8",
					500: "#3AAACF",
					600: "#2B8FB0",
					700: "#23748F",
					800: "#1A566A",
					900: "#113846",
					950: "#0D2B35"
				},
				"secondary": {
					50: "#F3E9E2",
					100: "#ECDCD0",
					200: "#DEC3B0",
					300: "#D1AA8F",
					400: "#C3926F",
					500: "#B6794E",
					600: "#94613D",
					700: "#734C30",
					800: "#533722",
					900: "#332115",
					950: "#20150D"
				}
			}
		},
	},
}
