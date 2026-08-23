import React, { useState } from 'react';

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==';

interface ResponsiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  webpSrc?: string;
  srcSet?: string;
  sizes?: string;
}

export function ResponsiveImage({
  src,
  alt,
  webpSrc,
  srcSet,
  sizes,
  loading = 'lazy',
  className,
  style,
  ...rest
}: ResponsiveImageProps) {
  const [didError, setDidError] = useState(false);
  const [supportsWebP, setSupportsWebP] = useState(true);

  const handleError = () => {
    setDidError(true);
  };

  // Check WebP support on component mount
  React.useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    setSupportsWebP(canvas.toDataURL('image/webp').includes('webp'));
  }, []);

  if (didError) {
    return (
      <div
        className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`}
        style={style}
      >
        <div className="flex items-center justify-center w-full h-full">
          <img src={ERROR_IMG_SRC} alt="Error loading image" {...rest} data-original-url={src} />
        </div>
      </div>
    );
  }

  return (
    <picture>
      {/* WebP format for modern browsers */}
      {supportsWebP && webpSrc && <source srcSet={webpSrc} type="image/webp" />}
      
      {/* Fallback to original format */}
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        loading={loading}
        className={className}
        style={style}
        {...rest}
        onError={handleError}
      />
    </picture>
  );
}
