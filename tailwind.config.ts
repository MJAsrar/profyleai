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
  			// Raw design tokens, for surfaces the shadcn bridge doesn't cover
  			paper: 'var(--paper)',
  			'paper-cool': 'var(--paper-cool)',
  			'card-warm': 'var(--card-warm)',
  			'section-tint': 'var(--section-tint)',
  			ink: {
  				DEFAULT: 'var(--ink)',
  				2: 'var(--ink-2)',
  				muted: 'var(--ink-muted)',
  				faint: 'var(--ink-faint)',
  				'faint-2': 'var(--ink-faint-2)',
  			},
  			brand: {
  				DEFAULT: 'var(--brand)',
  				hover: 'var(--brand-hover)',
  				deep: 'var(--brand-deep)',
  				tint: 'var(--brand-tint)',
  				'on-dark': 'var(--brand-on-dark)',
  			},
  			clay: {
  				DEFAULT: 'var(--clay)',
  				tint: 'var(--clay-tint)',
  			},
  			danger: {
  				DEFAULT: 'var(--danger)',
  				tint: 'var(--danger-tint)',
  			},
  			indigo: {
  				DEFAULT: 'var(--indigo)',
  				tint: 'var(--indigo-tint)',
  			},
  			olive: {
  				DEFAULT: 'var(--olive)',
  				tint: 'var(--olive-tint)',
  			},
  			'voice-room': 'var(--voice-room)',

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
