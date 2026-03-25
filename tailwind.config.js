/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        cute: ['"Nunito"', 'system-ui', 'sans-serif'],
      },
      colors: {
        candy: {
          pink: '#ff6ec7',
          mint: '#7bfbdb',
          lilac: '#c4b5fd',
          peach: '#fdba74',
        },
      },
      boxShadow: {
        'neon-pink': '0 0 20px rgba(255, 110, 199, 0.45), 0 0 40px rgba(255, 110, 199, 0.15)',
        'neon-cyan': '0 0 20px rgba(93, 255, 225, 0.4), 0 0 36px rgba(93, 255, 225, 0.12)',
        'neon-lime': '0 0 18px rgba(190, 242, 100, 0.5)',
        'neon-violet': '0 0 18px rgba(192, 132, 252, 0.45)',
        'neon-fuchsia': '0 0 18px rgba(232, 121, 249, 0.45)',
        'neon-amber': '0 0 18px rgba(251, 191, 36, 0.45)',
        'neon-rose': '0 0 18px rgba(251, 113, 133, 0.45)',
        'neon-sky': '0 0 18px rgba(56, 189, 248, 0.45)',
        'neon-emerald': '0 0 18px rgba(52, 211, 153, 0.45)',
      },
      keyframes: {
        floatBlob: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -20px) scale(1.05)' },
          '66%': { transform: 'translate(-20px, 10px) scale(0.95)' },
        },
        neonFlicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
      },
      animation: {
        'float-blob': 'floatBlob 18s ease-in-out infinite',
        'neon-flicker': 'neonFlicker 2.5s ease-in-out infinite',
        wiggle: 'wiggle 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
