/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ivory:        '#FDFBF7',
        'ivory-dark': '#F4EFEA',
        champagne:    '#E4D4BC',
        gold:         '#FFE4C4',
        'gold-dark':  '#C9995F',
        'gold-light': '#FFF2E2',
        burgundy:     '#5E2A2E',
        'burgundy-light': '#7A4448',
        sage:         '#6E7856',
        'sage-light': '#93A178',
        charcoal:     '#2C2A29',
        'charcoal-light': '#4A3E3D',
      },
      fontFamily: {
        // Noto Serif/Sans Armenian go FIRST, not as a fallback. Cormorant
        // Garamond and Playfair Display are real Latin webfonts with their
        // own digit glyphs, so with them first, "2026"/"15" would render in
        // their plain numeral design while the surrounding Armenian letters
        // (which those fonts don't cover at all) skip straight to Noto —
        // two mismatched type designs stitched into one sentence. Putting
        // Noto first makes it own both letters and digits for consistency;
        // Playfair/Cormorant remain as fallback for the rare pure-Latin
        // fragment (still one unified look either way).
        playfair:   ['var(--font-noto-serif-armenian)', 'Playfair Display', 'Georgia', 'serif'],
        cormorant:  ['var(--font-noto-serif-armenian)', 'Cormorant Garamond', 'Georgia', 'serif'],
        lato:       ['var(--font-noto-sans-armenian)', 'Lato', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #C9A96E 0%, #E8D5B0 50%, #C9A96E 100%)',
        'ivory-gradient': 'linear-gradient(180deg, #FAF7F2 0%, #F0E8DC 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition:  '200% center' },
        },
      },
    },
  },
  plugins: [],
}
