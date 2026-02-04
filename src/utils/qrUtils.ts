import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ICON_MAP, IconName } from '../data/qrIcons';

export const getIconDataUrl = (iconName: IconName, color: string): string => {
  const IconComponent = ICON_MAP[iconName];
  if (!IconComponent) return '';

  const svgString = renderToStaticMarkup(
    createElement(IconComponent, {
      color: color,
      size: 48,      
      strokeWidth: 2.5,
    })
  );

  return `data:image/svg+xml;base64,${btoa(svgString)}`;
};

export const getBrandIconUrl = (iconSlug: string, hexColor: string): string => {
  const cleanHex = hexColor.replace('#', '');
  return `https://cdn.simpleicons.org/${iconSlug}/${cleanHex}`;
};