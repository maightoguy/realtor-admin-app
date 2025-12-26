interface IconProps {
  color: string;
  className?: string;
}

const SoldOutIcon = ({ color, className }: IconProps) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M5.25 2.25C4.45435 2.25 3.69129 2.56607 3.12868 3.12868C2.56607 3.69129 2.25 4.45435 2.25 5.25V9.568C2.25 10.3636 2.566 11.126 3.129 11.689L12.709 21.27C13.629 22.19 15.099 22.456 16.257 21.698C18.4254 20.2781 20.2777 18.4261 21.698 16.258C22.456 15.098 22.19 13.629 21.27 12.71L11.69 3.129C11.4114 2.85029 11.0806 2.6292 10.7165 2.47838C10.3524 2.32756 9.9621 2.24995 9.568 2.25H5.25Z"
      fill={color}
    />
  </svg>
);

export default SoldOutIcon;

