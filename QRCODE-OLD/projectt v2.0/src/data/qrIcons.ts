import * as LucideIcons from 'lucide-react';

export const ICON_MAP = {
  // --- Popular Brands ---
  Instagram: LucideIcons.Instagram,
  Github: LucideIcons.Github,
  X: LucideIcons.X,
  Linkedin: LucideIcons.Linkedin,
  Youtube: LucideIcons.Youtube,
  Facebook: LucideIcons.Facebook,
  Tiktok: LucideIcons.Music2,
  Discord: LucideIcons.MessageSquare,
  Threads: LucideIcons.AtSign,
  Slack: LucideIcons.Slack,
  Twitch: LucideIcons.Twitch,
  Pinterest: LucideIcons.Pin,

  // --- Microstock & POD ---
  Shutterstock: LucideIcons.Camera,
  AdobeStock: LucideIcons.Aperture,
  Redbubble: LucideIcons.Store,
  TeePublic: LucideIcons.Shirt,
  Printful: LucideIcons.Printer,
  Zazzle: LucideIcons.Zap,
  Etsy: LucideIcons.ShoppingBag,
  ArtStation: LucideIcons.Palette,
  Behance: LucideIcons.Briefcase,
  Dribbble: LucideIcons.Dribbble,

  // --- Business & Tech ---
  Microsoft: LucideIcons.LayoutGrid,
  Outlook: LucideIcons.Mail,
  Amazon: LucideIcons.ShoppingCart,
  Website: LucideIcons.Globe,
  Link: LucideIcons.Link2,
  Figma: LucideIcons.Figma,
  Trello: LucideIcons.Trello,
  Chrome: LucideIcons.Chrome,
  Apple: LucideIcons.Apple,
  Android: LucideIcons.Play,

  // --- Contact ---
  Phone: LucideIcons.Phone,
  Message: LucideIcons.MessageCircle,
  Location: LucideIcons.MapPin,
  Heart: LucideIcons.Heart,
};

export type IconName = keyof typeof ICON_MAP;

export interface QRIcon {
  id: string;
  name: string;
  iconName?: IconName;
  url?: string;
  color: string;
}

export const LOGO_LIBRARY: QRIcon[] = [
  // --- SOCIAL MEDIA ---
  { id: 'ig', name: 'Instagram', iconName: 'Instagram', color: '#E4405F' },
  { id: 'x', name: 'X / Twitter', iconName: 'X', color: '#000000' },
  { id: 'fb', name: 'Facebook', iconName: 'Facebook', color: '#1877F2' },
  { id: 'yt', name: 'YouTube', iconName: 'Youtube', color: '#FF0000' },
  { id: 'li', name: 'LinkedIn', iconName: 'Linkedin', color: '#0A66C2' },
  { id: 'gh', name: 'GitHub', iconName: 'Github', color: '#24292e' },
  { id: 'tt', name: 'TikTok', iconName: 'Tiktok', color: '#000000' },
  { id: 'dc', name: 'Discord', iconName: 'Discord', color: '#5865F2' },
  { id: 'tw', name: 'Twitch', iconName: 'Twitch', color: '#9146FF' },
  { id: 'pn', name: 'Pinterest', iconName: 'Pinterest', color: '#BD081C' },
  { id: 'wa', name: 'WhatsApp', url: 'https://cdn.simpleicons.org/whatsapp/25D366', color: '#25D366' },
  { id: 'tg', name: 'Telegram', url: 'https://cdn.simpleicons.org/telegram/26A5E4', color: '#26A5E4' },

  // --- E-COMMERCE & MARKETPLACE ---
  { id: 'shopee', name: 'Shopee', url: 'https://cdn.simpleicons.org/shopee/EE4D2D', color: '#EE4D2D' },
  { id: 'amz', name: 'Amazon', iconName: 'Amazon', color: '#FF9900' },
  { id: 'etsy', name: 'Etsy', iconName: 'Etsy', color: '#F1641E' },
  { id: 'ebay', name: 'eBay', url: 'https://cdn.simpleicons.org/ebay/E53238', color: '#E53238' },

  // --- MICROSTOCK & CREATIVE ---
  { id: 'st', name: 'Shutterstock', iconName: 'Shutterstock', color: '#EE0202' },
  { id: 'as', name: 'Adobe Stock', iconName: 'AdobeStock', color: '#FF0000' },
  { id: 'rb', name: 'Redbubble', iconName: 'Redbubble', color: '#E22424' },
  { id: 'tp', name: 'TeePublic', iconName: 'TeePublic', color: '#29C9D1' },
  { id: 'pf', name: 'Printful', iconName: 'Printful', color: '#E94E1B' },
  { id: 'zz', name: 'Zazzle', iconName: 'Zazzle', color: '#000000' },
  { id: 'bh', name: 'Behance', iconName: 'Behance', color: '#1769FF' },
  { id: 'dr', name: 'Dribbble', iconName: 'Dribbble', color: '#EA4C89' },
  { id: 'as-art', name: 'ArtStation', iconName: 'ArtStation', color: '#13AFF0' },
  { id: 'fig', name: 'Figma', iconName: 'Figma', color: '#F24E1E' },

  // --- TECH & OFFICE ---
  { id: 'ms', name: 'Microsoft', iconName: 'Microsoft', color: '#00A4EF' },
  { id: 'out', name: 'Outlook', iconName: 'Outlook', color: '#0078D4' },
  { id: 'sl', name: 'Slack', iconName: 'Slack', color: '#4A154B' },
  { id: 'zoom', name: 'Zoom', url: 'https://cdn.simpleicons.org/zoom/2D8CFF', color: '#2D8CFF' },
  { id: 'googledrive', name: 'Google Drive', url: 'https://cdn.simpleicons.org/googledrive/4285F4', color: '#4285F4' },
  { id: 'notion', name: 'Notion', url: 'https://cdn.simpleicons.org/notion/000000', color: '#000000' },
  { id: 'trello', name: 'Trello', iconName: 'Trello', color: '#0079BF' },

  // --- PAYMENTS (LOKAL & GLOBAL) ---
  { id: 'paypal', name: 'PayPal', url: 'https://cdn.simpleicons.org/paypal/00457C', color: '#00457C' },
  { id: 'gopay', name: 'Gojek / GoPay', url: 'https://cdn.simpleicons.org/gojek/00AA13', color: '#00AA13' },
  { id: 'grab', name: 'Grab', url: 'https://cdn.simpleicons.org/grab/00B14F', color: '#00B14F' },
  { id: 'visa', name: 'Visa', url: 'https://cdn.simpleicons.org/visa/1A1F71', color: '#1A1F71' },
  { id: 'mastercard', name: 'Mastercard', url: 'https://cdn.simpleicons.org/mastercard/EB001B', color: '#EB001B' },

  // --- GENERAL / CONTACT ---
  { id: 'web', name: 'Website', iconName: 'Website', color: '#4B5563' },
  { id: 'link', name: 'Link', iconName: 'Link', color: '#3B82F6' },
  { id: 'email', name: 'Email', iconName: 'Outlook', color: '#0078D4' },
  { id: 'loc', name: 'Location', iconName: 'Location', color: '#EF4444' },
  { id: 'phone', name: 'Phone', iconName: 'Phone', color: '#22C55E' },
];