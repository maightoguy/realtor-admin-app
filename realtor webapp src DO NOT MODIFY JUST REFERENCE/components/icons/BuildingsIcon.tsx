interface IconProps {
  color: string;
  className?: string;
}

const BuildingsIcon = ({ color, className }: IconProps) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M10.5 6.5L5.5 10V22"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.5 2L15.5 5.5V12L19 14.5V22H10.5V2Z"
      fill={color}
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2 22H22"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default BuildingsIcon;

