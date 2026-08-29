export type UserRole = 'admin' | 'cell_leader';

export type MeetingType = 
  | 'Prayer and Planning'
  | 'Bible Study 1'
  | 'Bible Study 2'
  | 'Outreach';

export type ReportStatus = 'pending' | 'approved' | 'reviewed';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  phone: string;
  zone: string;
  cellId?: string;
  cellName?: string;
  status: 'active' | 'pending_approval';
  password?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Cell {
  id: string;
  name: string;
  zone: string;
  leaderId: string;
  leaderName: string;
  leaderPhone: string;
  leaderEmail: string;
  targetAttendance: number;
  targetSouls: number;
  meetingDay: string;
  meetingTime: string;
  venue: string;
  createdAt: string;
}

export interface Zone {
  id: string;
  name: string;
  coordinatorId?: string;
  coordinatorName?: string;
  coordinatorPhone?: string;
  targetAttendance: number;
}

export interface Report {
  id: string;
  cellId: string;
  cellName: string;
  leaderId?: string;
  leaderName: string;
  leaderPhone?: string;
  leaderEmail?: string;
  zone: string;
  date: string;
  meetingType: MeetingType;
  attendanceCell?: number;
  attendanceSunday: number;
  attendanceWednesday: number;
  attendanceTotal: number;
  attendanceTeens?: number;
  firstTimers: number;
  soulsWon: number;
  followedUp: number;
  offering?: number;
  testimonies?: string;
  challenges?: string;
  prayerRequests?: string;
  mediaUrls: string[];
  nextMeetingDate: string;
  status: ReportStatus;
  coordinatorNotes?: string;
  pastorNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  type: 'reminder' | 'submission_alert' | 'approval_alert' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  targetRole?: UserRole | 'all';
  targetZone?: string;
  reportId?: string;
}

export interface AnalyticsSummary {
  totalReports: number;
  totalAttendance: number;
  totalSundayAttendance: number;
  totalWednesdayAttendance: number;
  totalTeens: number;
  totalFirstTimers: number;
  totalSoulsWon: number;
  totalFollowedUp: number;
  totalOffering: number;
  pendingApprovalsCount: number;
  complianceRate: number;
  reportingCellsCount: number;
  totalCellsCount: number;
  unreportedCells: Cell[];
  topPerformingCells: {
    cellName: string;
    zone: string;
    leaderName: string;
    totalAttendance: number;
    soulsWon: number;
    firstTimers: number;
    reportCount: number;
  }[];
  weeklyTrends: {
    weekLabel: string;
    attendance: number;
    sundayAttendance?: number;
    wednesdayAttendance?: number;
    soulsWon: number;
    firstTimers: number;
    reportsCount: number;
  }[];
  zoneStats: {
    zoneName: string;
    cellsCount: number;
    totalAttendance: number;
    totalSundayAttendance?: number;
    totalWednesdayAttendance?: number;
    soulsWon: number;
    firstTimers: number;
    complianceRate: number;
  }[];
}
