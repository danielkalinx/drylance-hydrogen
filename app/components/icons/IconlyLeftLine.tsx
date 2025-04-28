type IconlyIconProps = {
  size?: number;
  color?: string;
};

export const IconlyLeftLine = ({
  size = 24,
  color = 'currentColor',
}: IconlyIconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.47656 12.001H18.9986M12.8304 16.3386L8.47656 11.9987L12.8304 7.66357"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M5 6.73828V17.2631"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
    </svg>
  );
};
