import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ICON_MAP, IconName } from '../data/qrIcons';

/**
 * Mengonversi Ikon Lucide menjadi Data URL (SVG) 
 * sehingga bisa dimasukkan ke dalam QR Code sebagai logo.
 */
export const getIconDataUrl = (iconName: IconName, color: string): string => {
  const IconComponent = ICON_MAP[iconName];
  if (!IconComponent) return '';

  // Render komponen Lucide menjadi string SVG
  const svgString = renderToStaticMarkup(
    createElement(IconComponent, {
      color: color,     // Warna dinamis mengikuti pilihan user
      size: 48,         // Ukuran resolusi tinggi untuk canvas
      strokeWidth: 2.5, // Ketebalan agar ikon tetap terlihat jelas
    })
  );

  // Mengubah SVG menjadi Base64 agar bisa dibaca oleh library QR
  return `data:image/svg+xml;base64,${btoa(svgString)}`;
};

/**
 * Mengambil URL logo dari SimpleIcons CDN dengan warna custom
 */
export const getBrandIconUrl = (iconSlug: string, hexColor: string): string => {
  // SimpleIcons CDN menerima warna tanpa tanda pagar (#)
  const cleanHex = hexColor.replace('#', '');
  return `https://cdn.simpleicons.org/${iconSlug}/${cleanHex}`;
};