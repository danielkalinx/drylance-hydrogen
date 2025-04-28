import React from 'react';
import {DotLottieReact} from '@lottiefiles/dotlottie-react';
import arrowRight from '~/assets/motion-icons/arrow-right.json?url';

export const ArrowRight = () => {
  return <DotLottieReact src={arrowRight} loop={true} autoplay={true} />;
};
