interface IconProps {
  color: string;
  className?: string;
}

const NotificationBellIcon = ({ color, className }: IconProps) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M10 2.5C8.75736 2.5 7.75 3.50736 7.75 4.75V7.5C7.75 8.11667 7.5 8.61667 7.08333 8.96667L6.5 9.5C6.0875 9.83333 5.83333 10.2875 5.83333 10.75V12.5C5.83333 13.0875 6.29583 13.55 6.88333 13.55H13.1167C13.7042 13.55 14.1667 13.0875 14.1667 12.5V10.75C14.1667 10.2875 13.9125 9.83333 13.5 9.5L12.9167 8.96667C12.5 8.61667 12.25 8.11667 12.25 7.5V4.75C12.25 3.50736 11.2426 2.5 10 2.5Z"
      fill={color}
    />
    <path
      d="M8.33333 15.8333C8.33333 16.5875 8.93333 17.1875 9.6875 17.1875H10.3125C11.0667 17.1875 11.6667 16.5875 11.6667 15.8333H8.33333Z"
      fill={color}
    />
  </svg>
);

export default NotificationBellIcon;
