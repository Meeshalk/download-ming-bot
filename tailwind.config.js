module.exports = {
    purge: ["./src/app/windows/*.html"],
    darkMode: false,
    theme: {
        extend: {},
    },
    variants: {
        extend: {
            opacity: [
                "disabled"
            ],
            backgroundColor: [
                "disabled"
            ],
            cursor: [
                "disabled"
            ],
            backgroundImage: ['hover', 'focus'],
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('tailwind-scrollbar'),
    ],
};
