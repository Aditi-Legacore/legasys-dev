export interface Lead {
  id: string;
  dueDate: string;
  name: string;
  caseType: string;
  status: "new" | "form_sent" | "in_progress" | "completed";
  contact: string;
  phone: string;
  matter: string;
}
