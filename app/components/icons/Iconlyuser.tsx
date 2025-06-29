type IconlyIconProps = {
  size?: number;
  color?: string;
};

export const Iconlyuser = ({
  size = 24,
  color = 'currentColor',
}: IconlyIconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 25 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.1455 7.99553C16.1455 10.2017 14.357 11.9911 12.1499 11.9911C9.94375 11.9911 8.15527 10.2017 8.15527 7.99553C8.15527 5.78934 9.94375 4 12.1499 4C14.357 4 16.1455 5.78934 16.1455 7.99553Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.15 14.875C8.77454 14.875 5.89551 15.3853 5.89551 17.428C5.89551 19.4707 8.7581 19.9991 12.15 19.9991C15.5237 19.9991 18.4045 19.4872 18.4045 17.4461C18.4045 15.4034 15.5427 14.875 12.15 14.875Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
    </svg>
  );
};
