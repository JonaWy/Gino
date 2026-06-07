export type AppointmentType =
  | "impfung"
  | "tierarzt"
  | "schmied"
  | "turnier"
  | "training"
  | "sonstiges";

export type AppointmentStatus = "geplant" | "erledigt" | "abgesagt";

export type ExpenseCategory =
  | "tierarzt"
  | "schmied"
  | "turnier"
  | "futter"
  | "versicherung"
  | "sonstiges";

export type ContactRole =
  | "tierarzt"
  | "schmied"
  | "stall"
  | "transport"
  | "sonstiges";

export type DocumentType =
  | "pferdepass"
  | "versicherung"
  | "roentgen"
  | "kaufvertrag"
  | "impfnachweis"
  | "sonstiges";

export type HealthRecordType =
  | "impfung"
  | "entwurmung"
  | "zahnarzt"
  | "sonstiges";

export interface Horse {
  id: string;
  user_id: string;
  name: string;
  breed: string | null;
  birth_date: string | null;
  gender: string | null;
  color: string | null;
  chip_number: string | null;
  passport_number: string | null;
  image_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Rider {
  id: string;
  user_id: string;
  horse_id: string;
  name: string;
  license_number: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
}

export interface Appointment {
  id: string;
  user_id: string;
  horse_id: string;
  type: AppointmentType;
  title: string;
  description: string | null;
  location: string | null;
  starts_at: string;
  ends_at: string | null;
  all_day: boolean;
  status: AppointmentStatus;
  recurrence: string | null;
  reminder_days_before: number | null;
  estimated_cost: number | null;
  actual_cost: number | null;
  created_at: string;
  updated_at: string;
}

export interface Tournament {
  id: string;
  user_id: string;
  horse_id: string;
  name: string;
  date: string;
  location: string | null;
  discipline: string | null;
  rating: string | null;
  placement: number | null;
  rider_name: string | null;
  rider_id: string | null;
  prize_money: number | null;
  notes: string | null;
  created_at: string;
}

export interface VitalRecord {
  id: string;
  user_id: string;
  horse_id: string;
  recorded_at: string;
  weight_kg: number | null;
  height_cm: number | null;
  tournament_earnings_total: number | null;
  estimated_value: number | null;
  notes: string | null;
  created_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  horse_id: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  description: string | null;
  appointment_id: string | null;
  is_estimated: boolean;
  created_at: string;
}

export interface CostDefault {
  id: string;
  user_id: string;
  horse_id: string;
  category: ExpenseCategory;
  default_amount: number;
  created_at: string;
}

export interface Document {
  id: string;
  user_id: string;
  horse_id: string;
  type: DocumentType;
  title: string;
  file_url: string;
  expires_at: string | null;
  created_at: string;
}

export interface HealthRecord {
  id: string;
  user_id: string;
  horse_id: string;
  type: HealthRecordType;
  product_name: string | null;
  date: string;
  next_due_date: string | null;
  vet_name: string | null;
  notes: string | null;
  created_at: string;
}

export interface TrainingLog {
  id: string;
  user_id: string;
  horse_id: string;
  date: string;
  duration_minutes: number | null;
  focus: string | null;
  intensity: string | null;
  notes: string | null;
  rider_name: string | null;
  created_at: string;
}

export interface Contact {
  id: string;
  user_id: string;
  horse_id: string;
  role: ContactRole;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      horses: { Row: Horse; Insert: Partial<Horse>; Update: Partial<Horse> };
      riders: { Row: Rider; Insert: Partial<Rider>; Update: Partial<Rider> };
      appointments: {
        Row: Appointment;
        Insert: Partial<Appointment>;
        Update: Partial<Appointment>;
      };
      tournaments: {
        Row: Tournament;
        Insert: Partial<Tournament>;
        Update: Partial<Tournament>;
      };
      vital_records: {
        Row: VitalRecord;
        Insert: Partial<VitalRecord>;
        Update: Partial<VitalRecord>;
      };
      expenses: {
        Row: Expense;
        Insert: Partial<Expense>;
        Update: Partial<Expense>;
      };
      cost_defaults: {
        Row: CostDefault;
        Insert: Partial<CostDefault>;
        Update: Partial<CostDefault>;
      };
      documents: {
        Row: Document;
        Insert: Partial<Document>;
        Update: Partial<Document>;
      };
      health_records: {
        Row: HealthRecord;
        Insert: Partial<HealthRecord>;
        Update: Partial<HealthRecord>;
      };
      training_logs: {
        Row: TrainingLog;
        Insert: Partial<TrainingLog>;
        Update: Partial<TrainingLog>;
      };
      contacts: {
        Row: Contact;
        Insert: Partial<Contact>;
        Update: Partial<Contact>;
      };
    };
  };
}
