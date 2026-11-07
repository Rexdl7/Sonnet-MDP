export type AppThemeId = 
  | 'natural-studio'
  | 'youtube-music'
  | 'apple-music'
  | 'spotify'
  | 'darcula'
  | 'red-black'
  | 'oled-black'
  | 'cupertino-light'
  | 'nordic-light'
  | 'solarized-light';

export interface ThemeConfig {
  id: AppThemeId;
  name: string;
  category: 'dark' | 'light';
  description: string;
  badge: string;
  colors: {
    bg: string;
    surface: string;
    surfaceHover: string;
    surfaceActive: string;
    border: string;
    accent: string;
    accentHover: string;
    text: string;
    textMuted: string;
    textSubtle: string;
    glassBlur: string;
    shadow: string;
  };
}

export const THEMES: Record<AppThemeId, ThemeConfig> = {
  'natural-studio': {
    id: 'natural-studio',
    name: 'Warm Natural Studio',
    category: 'dark',
    description: 'Organic warm dark studio with matte charcoal, acoustic ambient tones, and soft copper accent',
    badge: 'Natural',
    colors: {
      bg: '#141416',
      surface: '#1E1E23',
      surfaceHover: '#28282F',
      surfaceActive: '#33333C',
      border: 'rgba(255, 255, 255, 0.08)',
      accent: '#D97736',
      accentHover: '#E28B4E',
      text: '#F2EFE9',
      textMuted: '#A09D96',
      textSubtle: '#6E6B65',
      glassBlur: 'backdrop-blur-xl',
      shadow: '0 12px 32px rgba(0,0,0,0.45)',
    },
  },
  'apple-music': {
    id: 'apple-music',
    name: 'Apple Music Glass',
    category: 'dark',
    description: 'Cupertino frosted glass with signature crimson rose and razor hairline borders',
    badge: 'Apple',
    colors: {
      bg: '#000000',
      surface: 'rgba(255, 255, 255, 0.06)',
      surfaceHover: 'rgba(255, 255, 255, 0.10)',
      surfaceActive: 'rgba(255, 255, 255, 0.14)',
      border: 'rgba(255, 255, 255, 0.12)',
      accent: '#FA2D48',
      accentHover: '#FB5C74',
      text: '#FFFFFF',
      textMuted: '#94A3B8',
      textSubtle: '#64748B',
      glassBlur: 'backdrop-blur-3xl',
      shadow: '0 20px 50px rgba(0,0,0,0.6)',
    },
  },
  'youtube-music': {
    id: 'youtube-music',
    name: 'YouTube Music Studio',
    category: 'dark',
    description: 'Pitch-black studio aesthetic with iconic YouTube red and clean matte surfaces',
    badge: 'YouTube',
    colors: {
      bg: '#030303',
      surface: '#121212',
      surfaceHover: '#1F1F1F',
      surfaceActive: '#2A2A2A',
      border: '#262626',
      accent: '#FF0000',
      accentHover: '#FF3333',
      text: '#FFFFFF',
      textMuted: '#AAAAAA',
      textSubtle: '#717171',
      glassBlur: 'backdrop-blur-md',
      shadow: '0 12px 32px rgba(0,0,0,0.8)',
    },
  },
  'spotify': {
    id: 'spotify',
    name: 'Spotify Canvas',
    category: 'dark',
    description: 'Signature matte obsidian with electric Spotify green and high-contrast cards',
    badge: 'Spotify',
    colors: {
      bg: '#121212',
      surface: '#181818',
      surfaceHover: '#242424',
      surfaceActive: '#2E2E2E',
      border: 'rgba(255, 255, 255, 0.08)',
      accent: '#1DB954',
      accentHover: '#1ED760',
      text: '#FFFFFF',
      textMuted: '#B3B3B3',
      textSubtle: '#6A6A6A',
      glassBlur: 'backdrop-blur-lg',
      shadow: '0 16px 40px rgba(0,0,0,0.7)',
    },
  },
  'darcula': {
    id: 'darcula',
    name: 'JetBrains Darcula Pro',
    category: 'dark',
    description: 'Professional engineering charcoal with amber gold and ice cyan highlights',
    badge: 'IDE Pro',
    colors: {
      bg: '#1E1F22',
      surface: '#2B2D30',
      surfaceHover: '#393B40',
      surfaceActive: '#43454A',
      border: '#3E4147',
      accent: '#E5C07B',
      accentHover: '#F0D197',
      text: '#DFE1E5',
      textMuted: '#9DA0A8',
      textSubtle: '#6F737A',
      glassBlur: 'backdrop-blur-none',
      shadow: '0 12px 30px rgba(0,0,0,0.4)',
    },
  },
  'red-black': {
    id: 'red-black',
    name: 'Velvet Noir & Blood Red',
    category: 'dark',
    description: 'High-contrast midnight void with intense velvet ruby and neon laser accents',
    badge: 'Cyberpunk',
    colors: {
      bg: '#050505',
      surface: '#110508',
      surfaceHover: '#1D0A0E',
      surfaceActive: '#2B0E14',
      border: 'rgba(225, 29, 72, 0.25)',
      accent: '#E11D48',
      accentHover: '#F43F5E',
      text: '#FFF1F2',
      textMuted: '#FDA4AF',
      textSubtle: '#9F1239',
      glassBlur: 'backdrop-blur-2xl',
      shadow: '0 20px 50px rgba(225,29,72,0.15)',
    },
  },
  'oled-black': {
    id: 'oled-black',
    name: 'OLED Pitch Black',
    category: 'dark',
    description: 'Pure 100% black pixels with razor-sharp white borders and pure monochrome clarity',
    badge: 'OLED',
    colors: {
      bg: '#000000',
      surface: '#0A0A0A',
      surfaceHover: '#141414',
      surfaceActive: '#1F1F1F',
      border: 'rgba(255, 255, 255, 0.16)',
      accent: '#FFFFFF',
      accentHover: '#E4E4E7',
      text: '#FFFFFF',
      textMuted: '#A1A1AA',
      textSubtle: '#71717A',
      glassBlur: 'backdrop-blur-none',
      shadow: '0 10px 30px rgba(0,0,0,1)',
    },
  },
  'cupertino-light': {
    id: 'cupertino-light',
    name: 'Apple Pearl Light',
    category: 'light',
    description: 'Clean Apple Music daytime aesthetic with crisp pearl card surfaces and rose crimson',
    badge: 'Apple Light',
    colors: {
      bg: '#F5F5F7',
      surface: '#FFFFFF',
      surfaceHover: '#EBEBEF',
      surfaceActive: '#E2E2E6',
      border: 'rgba(0, 0, 0, 0.10)',
      accent: '#FA2D48',
      accentHover: '#D91E36',
      text: '#1D1D1F',
      textMuted: '#6E6E73',
      textSubtle: '#86868B',
      glassBlur: 'backdrop-blur-2xl',
      shadow: '0 10px 30px rgba(0,0,0,0.06)',
    },
  },
  'nordic-light': {
    id: 'nordic-light',
    name: 'Nordic Frost Light',
    category: 'light',
    description: 'Modern Scandinavian architectural minimalism with ice slate and deep indigo accents',
    badge: 'Nordic',
    colors: {
      bg: '#F8FAFC',
      surface: '#FFFFFF',
      surfaceHover: '#F1F5F9',
      surfaceActive: '#E2E8F0',
      border: '#E2E8F0',
      accent: '#4F46E5',
      accentHover: '#4338CA',
      text: '#0F172A',
      textMuted: '#64748B',
      textSubtle: '#94A3B8',
      glassBlur: 'backdrop-blur-md',
      shadow: '0 8px 24px rgba(15,23,42,0.06)',
    },
  },
  'solarized-light': {
    id: 'solarized-light',
    name: 'Solarized Warm Parchment',
    category: 'light',
    description: 'Eye-soothing warm cream parchment with gentle earth tones and terracotta amber',
    badge: 'Warm',
    colors: {
      bg: '#FDF6E3',
      surface: '#EEE8D5',
      surfaceHover: '#E0D8BE',
      surfaceActive: '#D3C9A8',
      border: '#D6CAAA',
      accent: '#D97706',
      accentHover: '#B45309',
      text: '#073642',
      textMuted: '#586E75',
      textSubtle: '#839496',
      glassBlur: 'backdrop-blur-none',
      shadow: '0 8px 20px rgba(7,54,66,0.05)',
    },
  },
};
