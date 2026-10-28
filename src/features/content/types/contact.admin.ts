export interface Contact {
  id: string;
  numericId?: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  reply?: string | null;
  date: string;
  status: string;
  rawStatus?: string;
}

