export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Mapping CSS variables to Tailwind
                'sky-blue': 'var(--color-sky-blue)',
                'navy': 'var(--color-navy)',
                'sunlight': 'var(--color-sunlight)',
                'cloud': 'var(--color-cloud)',
            },
            fontFamily: {
                serif: ['var(--font-serif)', 'serif'],
                sans: ['var(--font-sans)', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
