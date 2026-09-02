tailwind.config = {
  theme: {
    extend: {
      colors: {
        navy: '#0B1120',
        'navy-light': '#16203A',
        'navy-deep': '#05070D',
        cream: '#FAF8F3',
        'cream-dark': '#F3EFE6',
        gold: '#C9A227',
        'gold-light': '#E9C766',
        'gold-soft': '#F5E3B3',
        'gold-dark': '#8A6D00',
        ink: '#1E2433',
        'ink-soft': '#5A6272'
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"Inter"', 'sans-serif']
      }
    }
  }
};

/*
 * Deterministic bootstrap.
 * Visual/layout CSS is linked statically from index.html and must never depend
 * on Supabase/auth timing. Runtime data controllers are loaded once, at the
 * bottom of index.html, after Supabase has initialized.
 */
