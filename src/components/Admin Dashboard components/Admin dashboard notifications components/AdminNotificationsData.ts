export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  status: "Sent" | "Failed";
  userType?: string;
  selectedUsers?: string[];
}

