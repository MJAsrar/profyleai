import type { Config } from "tailwindcss";

// all in fixtures is set to tailwind v3 as interims solutions

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "100%",
      },
    },
  	extend: {
  		fontFamily: {
  			// Newsreader — display/headings, the brand voice
  			display: ['var(--font-display)', 'Georgia', 'serif'],
  			// Hanken Grotesk — all UI text and body
  			sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
  			// JetBrains Mono — labels, kickers, credit counts, metadata
  			mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
  		},
  		colors: {
  			// Raw design tokens. Declared as rgb(<triplet> / <alpha-value>) so opacity
  			// modifiers work — text-paper/75, bg-brand/12, border-brand/35 etc. A hex
  			// inside a CSS var cannot support those and fails silently.
  			paper: 'rgb(var(--paper-rgb) / <alpha-value>)',
  			'paper-cool': 'rgb(var(--paper-cool-rgb) / <alpha-value>)',
  			'card-warm': 'rgb(var(--card-warm-rgb) / <alpha-value>)',
  			'section-tint': 'rgb(var(--section-tint-rgb) / <alpha-value>)',
  			ink: {
  				DEFAULT: 'rgb(var(--ink-rgb) / <alpha-value>)',
  				2: 'rgb(var(--ink-2-rgb) / <alpha-value>)',
  				muted: 'rgb(var(--ink-muted-rgb) / <alpha-value>)',
  				faint: 'rgb(var(--ink-faint-rgb) / <alpha-value>)',
  				'faint-2': 'rgb(var(--ink-faint-2-rgb) / <alpha-value>)',
  			},
  			brand: {
  				DEFAULT: 'rgb(var(--brand-rgb) / <alpha-value>)',
  				hover: 'rgb(var(--brand-hover-rgb) / <alpha-value>)',
  				deep: 'rgb(var(--brand-deep-rgb) / <alpha-value>)',
  				tint: 'rgb(var(--brand-tint-rgb) / <alpha-value>)',
  				'on-dark': 'rgb(var(--brand-on-dark-rgb) / <alpha-value>)',
  			},
  			clay: {
  				DEFAULT: 'rgb(var(--clay-rgb) / <alpha-value>)',
  				tint: 'rgb(var(--clay-tint-rgb) / <alpha-value>)',
  			},
  			danger: {
  				DEFAULT: 'rgb(var(--danger-rgb) / <alpha-value>)',
  				tint: 'rgb(var(--danger-tint-rgb) / <alpha-value>)',
  			},
  			indigo: {
  				DEFAULT: 'rgb(var(--indigo-rgb) / <alpha-value>)',
  				tint: 'rgb(var(--indigo-tint-rgb) / <alpha-value>)',
  			},
  			olive: {
  				DEFAULT: 'rgb(var(--olive-rgb) / <alpha-value>)',
  				tint: 'rgb(var(--olive-tint-rgb) / <alpha-value>)',
  			},
  			'voice-room': 'rgb(var(--voice-room-rgb) / <alpha-value>)',

  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  			// Design scale: inputs 9–11, cards 14–16, large cards/modals 18–22
  			input: '10px',
  			card: '15px',
  			panel: '20px',
  		},
  		boxShadow: {
  			card: 'var(--shadow-card)',
  			'card-hover': 'var(--shadow-card-hover)',
  			doc: 'var(--shadow-doc)',
  			modal: 'var(--shadow-modal)',
  			toast: 'var(--shadow-toast)',
  			focus: '0 0 0 3px rgba(46, 106, 74, 0.12)',
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
