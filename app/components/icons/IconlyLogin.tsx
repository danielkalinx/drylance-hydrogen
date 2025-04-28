type IconlyIconProps = {
  size?: number;
  color?: string;
};

export const IconlyLogin = ({
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
        d="M14.791 12.1207H2.75"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M11.8643 9.20471L14.7923 12.1207L11.8643 15.0367"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M7.25879 7.62988C7.58879 4.04988 8.92879 2.74988 14.2588 2.74988C21.3598 2.74988 21.3598 5.05988 21.3598 11.9999C21.3598 18.9399 21.3598 21.2499 14.2588 21.2499C8.92879 21.2499 7.58879 19.9499 7.25879 16.3699"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
    </svg>
  );
};
