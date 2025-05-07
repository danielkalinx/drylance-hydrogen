import {DotLottieReact} from '@lottiefiles/dotlottie-react';

interface DotLottieProps {
  url: string;
  loop?: boolean;
  autoplay?: boolean;
  width?: string | number;
  height?: string | number;
}

export function DotLottie({
  url,
  loop = true,
  autoplay = true,
  width = '100%',
  height = '100%',
}: DotLottieProps) {
  return (
    <DotLottieReact
      src={url}
      loop={loop}
      autoplay={autoplay}
      style={{width, height}}
    />
  );
}
