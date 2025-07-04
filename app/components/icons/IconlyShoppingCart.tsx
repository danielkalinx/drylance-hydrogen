type IconlyIconProps = {
  size?: number;
  color?: string;
};

export const IconlyShoppingCart = ({
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
        d="M3 3.14844H4.99656L7.64988 14.3805C7.90674 15.4664 8.92351 16.1981 10.0347 16.0949L16.972 15.4518C17.9761 15.3584 18.8246 14.6676 19.1184 13.7024L20.9505 7.6981C21.1704 6.98101 20.6294 6.25614 19.8793 6.26295L5.82943 6.37679"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M8.88669 20.3468V20.4649M9.36546 20.3722C9.36546 20.6381 9.1497 20.8537 8.88375 20.8537C8.61781 20.8537 8.40234 20.6381 8.40234 20.3722C8.40234 20.1062 8.61781 19.8906 8.88375 19.8906C9.1497 19.8906 9.36546 20.1062 9.36546 20.3722Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M18.0976 20.3468V20.4649M18.5764 20.3722C18.5764 20.6381 18.3606 20.8537 18.0947 20.8537C17.8288 20.8537 17.6133 20.6381 17.6133 20.3722C17.6133 20.1062 17.8288 19.8906 18.0947 19.8906C18.3606 19.8906 18.5764 20.1062 18.5764 20.3722Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
    </svg>
  );
};
