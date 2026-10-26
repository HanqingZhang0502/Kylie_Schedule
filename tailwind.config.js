/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                paper: '#f7f2e7',
                ink: '#38352f',
                'ink-muted': '#514d44',
                line: '#b3ac9d',
                accent: '#9e3a2e',
                annotation: '#344c69',
                highlight: '#f0dfa0',
                scrap: '#fcf8ef',
            },
            fontFamily: {
                marker: ['"Caveat"', 'cursive'],
                hand: ['"Patrick Hand"', 'cursive'],
            },
            borderRadius: {
                sketch: '9px 4px 17px 5px / 4px 12px 5px 9px',
                'sketch-sm': '7px 3px 12px 4px / 3px 9px 4px 7px',
            },
            boxShadow: {
                sketch: '2.5px 2.5px 0 0 #38352f',
                'sketch-sm': '1.5px 1.5px 0 0 #38352f',
            },
        },
    },
    plugins: [],
}
