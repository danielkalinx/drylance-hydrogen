type IconlyIconProps = {
  size?: number;
  color?: string;
};

export const IconlyLink = ({
  size = 24,
  color = 'currentColor',
}: IconlyIconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 25 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.4736 14.671C12.0965 16.8406 15.171 17.2843 17.3407 15.6614C17.5285 15.5203 17.7065 15.3666 17.8719 15.2012L20.1224 12.9508C22.005 11.002 21.9505 7.89634 20.0017 6.01368C18.1006 4.17773 15.0864 4.17773 13.1843 6.01368"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M14.5259 10.8625C12.9031 8.69285 9.82856 8.24919 7.65888 9.87206C7.4711 10.0131 7.29306 10.1669 7.12765 10.3323L4.87723 12.5827C2.99457 14.5315 3.04906 17.6372 4.99787 19.5198C6.89901 21.3567 9.9132 21.3567 11.8153 19.5198"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
    </svg>
  );
};
