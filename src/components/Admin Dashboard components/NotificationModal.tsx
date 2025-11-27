import { X, ArrowLeft, Clock } from "lucide-react";
import React from "react";

// Mock data based on the provided UI images
const notifications = [
  {
    id: 1,
    type: "approved",
    title: "Receipt Approved for Land for Rent at surulere or City of David",
    message: "10% commission has been added to your wallet",
    attachment: { name: "Receipt.JPG", size: "2mb" },
    timestamp: "Today at 9:42 AM",
    isRead: false,
  },
  {
    id: 2,
    type: "rejected",
    title: "Receipt Rejected for Land for sale at Lekki phase 1 Araba",
    message:
      "This receipt does not have a valid time and date kindly upload with the original receipt",
    attachment: { name: "Receipt.JPG", size: "2mb" },
    timestamp: "Last Wednesday at 9:42 AM",
    isRead: true,
  },
  {
    id: 3,
    type: "new_account",
    title: "New Account created",
    message: null,
    attachment: null,
    timestamp: "Last Wednesday at 9:42 AM",
    isRead: true,
  },
];

// Helper to get the right icon and color for each notification type
const getNotificationIcon = (type: string) => {
  switch (type) {
    case "approved":
      return (
        <svg
          width="26"
          height="26"
          viewBox="0 0 26 26"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M8.75375 2.74875C9.2812 2.14029 9.93341 1.65245 10.6661 1.31835C11.3988 0.984259 12.1948 0.811737 13 0.812503C14.6963 0.812503 16.2163 1.5625 17.2463 2.74875C18.0496 2.69139 18.8559 2.80761 19.6104 3.08951C20.3649 3.37141 21.0498 3.81239 21.6188 4.3825C22.1886 4.95133 22.6295 5.63609 22.9114 6.39032C23.1933 7.14455 23.3096 7.95059 23.2525 8.75375C23.8607 9.28132 24.3483 9.93358 24.6822 10.6662C25.0161 11.3989 25.1884 12.1948 25.1875 13C25.1883 13.8053 25.0157 14.6012 24.6817 15.3339C24.3476 16.0666 23.8597 16.7188 23.2513 17.2463C23.3084 18.0494 23.192 18.8555 22.9101 19.6097C22.6282 20.3639 22.1874 21.0487 21.6175 21.6175C21.0487 22.1874 20.3639 22.6282 19.6097 22.9101C18.8555 23.192 18.0494 23.3083 17.2463 23.2513C16.7188 23.8597 16.0666 24.3476 15.3339 24.6817C14.6012 25.0157 13.8053 25.1883 13 25.1875C12.1948 25.1883 11.3988 25.0157 10.6661 24.6817C9.93341 24.3476 9.2812 23.8597 8.75375 23.2513C7.95048 23.3088 7.14423 23.1928 6.38976 22.9111C5.63529 22.6294 4.95028 22.1886 4.38125 21.6188C3.81121 21.0498 3.37027 20.3648 3.08838 19.6104C2.80648 18.8559 2.69022 18.0496 2.7475 17.2463C2.13927 16.7187 1.65166 16.0664 1.31778 15.3338C0.983909 14.6011 0.811583 13.8052 0.812504 13C0.812504 11.3038 1.5625 9.78375 2.74875 8.75375C2.69157 7.95059 2.80788 7.14452 3.08978 6.39028C3.37167 5.63604 3.81256 4.95128 4.3825 4.3825C4.95128 3.81256 5.63604 3.37167 6.39028 3.08978C7.14452 2.80788 7.95059 2.69157 8.75375 2.74875ZM17.5125 10.7325C17.5875 10.6326 17.6418 10.5186 17.6721 10.3974C17.7025 10.2762 17.7083 10.1502 17.6892 10.0267C17.6701 9.90321 17.6266 9.78478 17.5611 9.67837C17.4956 9.57197 17.4095 9.47972 17.3078 9.40707C17.2062 9.33441 17.091 9.28281 16.9691 9.25529C16.8473 9.22777 16.7211 9.2249 16.5981 9.24683C16.4751 9.26876 16.3577 9.31507 16.2529 9.38302C16.148 9.45096 16.0578 9.53919 15.9875 9.6425L11.9425 15.305L9.9125 13.275C9.73478 13.1094 9.49973 13.0192 9.25685 13.0235C9.01397 13.0278 8.78224 13.1262 8.61048 13.298C8.43871 13.4697 8.34032 13.7015 8.33603 13.9443C8.33175 14.1872 8.4219 14.4223 8.5875 14.6L11.4 17.4125C11.4962 17.5087 11.6123 17.5827 11.74 17.6296C11.8677 17.6764 12.0041 17.6948 12.1397 17.6837C12.2753 17.6725 12.4068 17.6319 12.5252 17.5648C12.6435 17.4977 12.7458 17.4056 12.825 17.295L17.5125 10.7325Z"
            fill="#22C55E"
          />
        </svg>
      );
    case "rejected":
      return (
        <svg
          width="26"
          height="26"
          viewBox="0 0 26 26"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M13 0.8125C6.26875 0.8125 0.8125 6.26875 0.8125 13C0.8125 19.7313 6.26875 25.1875 13 25.1875C19.7313 25.1875 25.1875 19.7313 25.1875 13C25.1875 6.26875 19.7313 0.8125 13 0.8125ZM10.85 9.525C10.7642 9.43289 10.6607 9.35901 10.5457 9.30777C10.4307 9.25653 10.3065 9.22898 10.1807 9.22676C10.0548 9.22454 9.92974 9.24769 9.813 9.29485C9.69627 9.342 9.59023 9.41218 9.5012 9.5012C9.41218 9.59023 9.342 9.69627 9.29485 9.813C9.24769 9.92974 9.22454 10.0548 9.22676 10.1807C9.22898 10.3065 9.25653 10.4307 9.30777 10.5457C9.35901 10.6607 9.43289 10.7642 9.525 10.85L11.675 13L9.525 15.15C9.43289 15.2358 9.35901 15.3393 9.30777 15.4543C9.25653 15.5693 9.22898 15.6935 9.22676 15.8193C9.22454 15.9452 9.24769 16.0703 9.29485 16.187C9.342 16.3037 9.41218 16.4098 9.5012 16.4988C9.59023 16.5878 9.69627 16.658 9.813 16.7052C9.92974 16.7523 10.0548 16.7755 10.1807 16.7732C10.3065 16.771 10.4307 16.7435 10.5457 16.6922C10.6607 16.641 10.7642 16.5671 10.85 16.475L13 14.325L15.15 16.475C15.2358 16.5671 15.3393 16.641 15.4543 16.6922C15.5693 16.7435 15.6935 16.771 15.8193 16.7732C15.9452 16.7755 16.0703 16.7523 16.187 16.7052C16.3037 16.658 16.4098 16.5878 16.4988 16.4988C16.5878 16.4098 16.658 16.3037 16.7052 16.187C16.7523 16.0703 16.7755 15.9452 16.7732 15.8193C16.771 15.6935 16.7435 15.5693 16.6922 15.4543C16.641 15.3393 16.5671 15.2358 16.475 15.15L14.325 13L16.475 10.85C16.5671 10.7642 16.641 10.6607 16.6922 10.5457C16.7435 10.4307 16.771 10.3065 16.7732 10.1807C16.7755 10.0548 16.7523 9.92974 16.7052 9.813C16.658 9.69627 16.5878 9.59023 16.4988 9.5012C16.4098 9.41218 16.3037 9.342 16.187 9.29485C16.0703 9.24769 15.9452 9.22454 15.8193 9.22676C15.6935 9.22898 15.5693 9.25653 15.4543 9.30777C15.3393 9.35901 15.2358 9.43289 15.15 9.525L13 11.675L10.85 9.525Z"
            fill="#EF4444"
          />
        </svg>
      );
    case "new_account":
      return (
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="32" height="32" rx="16" fill="#DDDEE1" />
          <path
            d="M14.0881 23.5003C14.0043 23.5004 13.9215 23.4821 13.8456 23.4468C13.7696 23.4114 13.7023 23.3599 13.6484 23.2957C13.5945 23.2316 13.5553 23.1565 13.5335 23.0756C13.5118 22.9947 13.508 22.91 13.5224 22.8275V22.824L14.4009 18.0003H10.9999C10.9055 18.0003 10.8131 17.9735 10.7332 17.9232C10.6534 17.8728 10.5894 17.8009 10.5488 17.7157C10.5081 17.6305 10.4924 17.5355 10.5034 17.4418C10.5145 17.348 10.5518 17.2593 10.6112 17.1859L17.4603 8.71904C17.5382 8.62008 17.6464 8.54937 17.7684 8.51774C17.8903 8.48611 18.0193 8.49528 18.1355 8.54387C18.2518 8.59245 18.3489 8.67777 18.412 8.78678C18.4752 8.89578 18.5009 9.02247 18.4853 9.14748C18.4853 9.15685 18.4828 9.16591 18.4812 9.17529L17.5996 14.0003H20.9999C21.0943 14.0003 21.1868 14.027 21.2667 14.0774C21.3465 14.1278 21.4105 14.1997 21.4511 14.2849C21.4918 14.3701 21.5075 14.465 21.4965 14.5588C21.4854 14.6525 21.4481 14.7413 21.3887 14.8147L14.5387 23.2815C14.4849 23.3495 14.4164 23.4045 14.3384 23.4424C14.2604 23.4803 14.1748 23.5001 14.0881 23.5003Z"
            fill="#515669"
          />
        </svg>
      );
    default:
      return null;
  }
};

type NotificationModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay for desktop */}
      <div
        className="fixed inset-0 bg-black/30 z-40 hidden md:block"
        onClick={onClose}
      />

      {/* Modal Panel */}
      <div className="fixed inset-0 bg-white z-50 md:inset-auto md:top-20 md:right-8 md:w-[440px] md:max-h-[80vh] md:rounded-2xl md:shadow-2xl flex flex-col">
        {/* Pointer for desktop */}
        <div className="hidden md:block absolute -top-2 right-6 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-white" />

        {/* Header for Mobile */}
        <div className="flex md:hidden items-center p-4 border-b border-gray-200">
          <button
            onClick={onClose}
            className="w-15 h-11 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 -ml-2"
          >
            {/* Back arrow*/}
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-lg font-semibold text-gray-800 text-center grow -ml-9">
            Notifications
          </h2>
        </div>

        {/* Header for Desktop */}
        <div className="hidden md:flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Notification</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.map((item, index) => (
            <div
              key={item.id}
              className={`flex gap-4 p-4 ${
                index < notifications.length - 1
                  ? "border-b border-gray-100"
                  : ""
              }`}
            >
              {!item.isRead && (
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0" />
              )}
              <div className={`shrink-0 mt-1 ${item.isRead ? "ml-4" : ""}`}>
                {getNotificationIcon(item.type)}
              </div>

              <div className="grow">
                <p className="text-sm font-semibold text-gray-800 leading-tight">
                  {item.title}
                </p>
                {item.message && (
                  <p className="text-sm text-gray-500 mt-1">{item.message}</p>
                )}
                {item.attachment && (
                  <div className="mt-2 flex items-center gap-2 p-2 bg-gray-50 rounded-md border border-gray-200 w-fit">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-medium text-gray-700">
                      {item.attachment.name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {item.attachment.size}
                    </span>
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-2">{item.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default NotificationModal;
