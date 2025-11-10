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
  disbursementRatio: number; // Percentage, e.g., 0.20 for 20%
  currentBalanceKes: number;
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