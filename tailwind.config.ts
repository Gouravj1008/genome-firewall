const config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 0 0 1px rgba(125, 211, 252, 0.2), 0 24px 80px rgba(3, 7, 18, 0.7)'
      },
      backgroundImage: {
        'radial-glow': 'radial-gradient(circle at top, rgba(56, 189, 248, 0.16), transparent 45%), radial-gradient(circle at bottom right, rgba(16, 185, 129, 0.12), transparent 30%)'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' }
        },
        glow: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' }
        }
      },
      animation: {
        float: 'float 8s ease-in-out infinite',
        glow: 'glow 5s ease-in-out infinite'
      }
    }
  },
  plugins: []
};

export default config;
