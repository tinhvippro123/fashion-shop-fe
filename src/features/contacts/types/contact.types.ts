export type ContactStatus = "NEW" | "REPLIED";

export interface ContactMessageDto {
  id: number;
  fullName: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  status: ContactStatus;
  adminReply?: string | null;
  repliedAt?: string | null;
  createdAt: string;
}
