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
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        }
      },
      animation: {
        float: 'float 8s ease-in-out infinite',
        glow: 'glow 5s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.8s ease-out forwards',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient-x': 'gradient-x 6s ease infinite'
      }
    }
  },
  plugins: []
};

export default config;
