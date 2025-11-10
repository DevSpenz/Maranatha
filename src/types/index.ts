export interface Donor {
  id: string;
  name: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface Donation {
  id: string;
  donorName: string;
  sekAmount: number;
  exchangeRate: number; // 1 SEK = X KES
  kesAmount: number; // Calculated: sekAmount * exchangeRate
  dateReceived: Date;
  recordedAt: Date;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  disbursementRatio: number; // Percentage, e.g., 0.20 for 20% (Kept for legacy/schema compatibility)
  kronaRatio: number; // New: KR weight for proportional distribution
  currentBalanceKes: number;
  beneficiaryCount: number; // Added for display
}

export interface Beneficiary {
  id: string;
  sponsorNumber: string;
  fullName: string;
  idNumber?: string;
  dateOfBirth: Date;
  phoneNumber: string;
  gender: 'male' | 'female' | 'other';
  guardianName: string;
  guardianPhone: string;
  guardianId?: string;
  status: 'active' | 'inactive' | 'graduated';
  groupId: string; // Foreign key to Group
}

export interface Disbursement {
  id: string;
  groupId: string;
  groupName: string;
  amountKes: number;
  notes?: string;
  dateDisbursed: Date;
  recordedBy: string;
}

export interface CashbookEntry {
  id: string;
  date: Date;
  description: string;
  type: 'inflow' | 'outflow';
  amountKes: number;
  sourceOrTarget: string; // Donor name or Group name
}