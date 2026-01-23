/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#6b2424", // Maroon
                "accent": "#d4a853", // Gold
                "background-light": "#fbf9f9", // Soft Cream
                "background-dark": "#1e1414",
                "batik-green": "#4a6c4a",
                "batik-orange": "#d97736"
            },
            fontFamily: {
                "display": ["Work Sans", "sans-serif"],
                "serif": ["Playfair Display", "serif"],
                "label": ["Cinzel", "serif"],
                "tech": ["Inter", "sans-serif"]
            },
            borderRadius: { "DEFAULT": "0.5rem", "lg": "0.75rem", "xl": "1rem", "2xl": "1.5rem", "full": "9999px" },
            backgroundImage: {
                'batik-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236b2424' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            }
        },
    },
    plugins: [],
}
