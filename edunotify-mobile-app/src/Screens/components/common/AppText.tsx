import React from 'react';
import { Text, TextProps } from 'react-native';

interface AppTextProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'bold' | 'medium';
  className?: string;
}

export const AppText = ({ children, variant, className = '', ...props }: AppTextProps) => {
  // Check if custom styles are present in className to avoid collisions
  const hasColor = className.includes('text-') && !className.includes('text-left') && !className.includes('text-center') && !className.includes('text-right');
  const hasWeight = className.includes('font-');
  const hasSize = className.match(/\btext-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl)\b/);

  let textColor = 'text-slate-800';
  let fontWeight = 'font-normal';
  let fontSize = 'text-sm';

  if (variant === 'h1') {
    fontSize = 'text-2xl';
    fontWeight = 'font-bold';
    textColor = 'text-slate-900';
  } else if (variant === 'h2') {
    fontSize = 'text-lg';
    fontWeight = 'font-semibold';
    textColor = 'text-slate-900';
  } else if (variant === 'h3') {
    fontSize = 'text-base';
    fontWeight = 'font-medium';
    textColor = 'text-slate-800';
  } else if (variant === 'caption') {
    fontSize = 'text-xs';
    textColor = 'text-slate-500';
  } else if (variant === 'bold') {
    fontSize = 'text-sm';
    fontWeight = 'font-bold';
    textColor = 'text-slate-900';
  } else if (variant === 'medium') {
    fontSize = 'text-sm';
    fontWeight = 'font-medium';
    textColor = 'text-slate-800';
  }

  const finalColor = hasColor ? '' : textColor;
  const finalWeight = hasWeight ? '' : fontWeight;
  const finalSize = hasSize ? '' : fontSize;

  const combinedClass = [finalColor, finalWeight, finalSize, className]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  return (
    <Text className={combinedClass} {...props}>
      {children}
    </Text>
  );
};

export default AppText;
