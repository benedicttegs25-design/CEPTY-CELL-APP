import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import type { Report, Cell, User, Zone, NotificationItem, AnalyticsSummary } from "./src/types";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Persistent JSON Storage setup
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "database.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface DatabaseSchema {
  zones: Zone[];
  cells: Cell[];
  users: User[];
  reports: Report[];
  notifications: NotificationItem[];
}

const initialZones: Zone[] = [
  { id: "zone-1", name: "Zone 1 - Kings Court", targetAttendance: 150 },
  { id: "zone-2", name: "Zone 2 - Victorious Haven", targetAttendance: 180 },
  { id: "zone-3", name: "Zone 3 - Grace Arena", targetAttendance: 140 },
  { id: "zone-4", name: "Zone 4 - Zoe Haven", targetAttendance: 160 },
  { id: "zone-5", name: "Zone 5 - Triumph Dominion", targetAttendance: 130 },
];

const initialUsers: User[] = [
  {
    id: "user-1",
    name: "Pastor Chris Oyakhilome & Pastor Mary",
    role: "admin",
    email: "pastor@prolificchurch.ce",
    phone: "+234 801 111 2222",
    zone: "All Zones",
    status: "active",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "user-7",
    name: "Brother Joshua Mensah",
    role: "cell_leader",
    email: "joshua.royalty@prolificchurch.ce",
    phone: "+234 810 123 4567",
    zone: "Zone 1 - Kings Court",
    cellId: "cell-1",
    cellName: "Royalty Teens Cell",
    status: "active",
    avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    createdAt: "2026-02-01T00:00:00.000Z",
  },
  {
    id: "user-8",
    name: "Sister Grace Uche",
    role: "cell_leader",
    email: "grace.dynasty@prolificchurch.ce",
    phone: "+234 811 234 5678",
    zone: "Zone 1 - Kings Court",
    cellId: "cell-2",
    cellName: "Dynasty Youth Fellowship",
    status: "active",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    createdAt: "2026-02-05T00:00:00.000Z",
  },
  {
    id: "user-9",
    name: "Brother Caleb Nnadi",
    role: "cell_leader",
    email: "caleb.luminaries@prolificchurch.ce",
    phone: "+234 812 345 6789",
    zone: "Zone 2 - Victorious Haven",
    cellId: "cell-3",
    cellName: "Luminaries Firebrand Cell",
    status: "active",
    createdAt: "2026-02-08T00:00:00.000Z",
  },
  {
    id: "user-10",
    name: "Sister Deborah Akintola",
    role: "cell_leader",
    email: "deborah.ambassadors@prolificchurch.ce",
    phone: "+234 813 456 7890",
    zone: "Zone 2 - Victorious Haven",
    cellId: "cell-4",
    cellName: "Ambassadors of Light",
    status: "active",
    createdAt: "2026-02-10T00:00:00.000Z",
  },
  {
    id: "user-11",
    name: "Brother Samuel Eze",
    role: "cell_leader",
    email: "samuel.pacesetters@prolificchurch.ce",
    phone: "+234 814 567 8901",
    zone: "Zone 3 - Grace Arena",
    cellId: "cell-5",
    cellName: "Pacesetters Youth Hub",
    status: "active",
    createdAt: "2026-02-12T00:00:00.000Z",
  },
  {
    id: "user-12",
    name: "Sister Sharon Bello",
    role: "cell_leader",
    email: "sharon.catalyst@prolificchurch.ce",
    phone: "+234 815 678 9012",
    zone: "Zone 3 - Grace Arena",
    cellId: "cell-6",
    cellName: "Catalyst Global Cell",
    status: "active",
    createdAt: "2026-02-15T00:00:00.000Z",
  },
  {
    id: "user-13",
    name: "Brother David Bassey",
    role: "cell_leader",
    email: "david.dunamis@prolificchurch.ce",
    phone: "+234 816 789 0123",
    zone: "Zone 4 - Zoe Haven",
    cellId: "cell-7",
    cellName: "Dunamis Power Teens",
    status: "active",
    createdAt: "2026-02-18T00:00:00.000Z",
  },
  {
    id: "user-14",
    name: "Sister Michelle Adeleke",
    role: "cell_leader",
    email: "michelle.evergreen@prolificchurch.ce",
    phone: "+234 817 890 1234",
    zone: "Zone 4 - Zoe Haven",
    cellId: "cell-8",
    cellName: "Evergreen Impact Cell",
    status: "pending_approval",
    createdAt: "2026-08-25T14:30:00.000Z",
  },
  {
    id: "user-15",
    name: "Brother Emmanuel Temitope",
    role: "cell_leader",
    email: "emmanuel.victors@prolificchurch.ce",
    phone: "+234 818 901 2345",
    zone: "Zone 5 - Triumph Dominion",
    cellId: "cell-9",
    cellName: "Victors Champions Cell",
    status: "pending_approval",
    createdAt: "2026-08-27T09:15:00.000Z",
  },
  {
    id: "user-6",
    name: "Brother Victor Kalu",
    role: "cell_leader",
    email: "victor.kalu@prolificchurch.ce",
    phone: "+234 807 789 0123",
    zone: "Zone 5 - Triumph Dominion",
    cellId: "cell-10",
    cellName: "Overcomers Elite Teens",
    status: "active",
    createdAt: "2026-01-20T00:00:00.000Z",
  },
  {
    id: "user-2",
    name: "Brother Daniel Osaigbovo",
    role: "cell_leader",
    email: "daniel.osaigbovo@prolificchurch.ce",
    phone: "+234 802 345 6789",
    zone: "Zone 1 - Kings Court",
    cellName: "Kingsway Dominion Cell",
    status: "active",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    createdAt: "2026-01-10T00:00:00.000Z",
  },
  {
    id: "user-3",
    name: "Sister Esther Chukwu",
    role: "cell_leader",
    email: "esther.chukwu@prolificchurch.ce",
    phone: "+234 803 456 7890",
    zone: "Zone 2 - Victorious Haven",
    cellName: "Victorious Crown Fellowship",
    status: "active",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    createdAt: "2026-01-12T00:00:00.000Z",
  },
  {
    id: "user-4",
    name: "Brother Praise Adeyemi",
    role: "cell_leader",
    email: "praise.adeyemi@prolificchurch.ce",
    phone: "+234 805 567 8901",
    zone: "Zone 3 - Grace Arena",
    cellName: "Grace Champions Hub",
    status: "active",
    avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
    createdAt: "2026-01-15T00:00:00.000Z",
  },
  {
    id: "user-5",
    name: "Sister Blessing Okon",
    role: "cell_leader",
    email: "blessing.okon@prolificchurch.ce",
    phone: "+234 806 678 9012",
    zone: "Zone 4 - Zoe Haven",
    cellName: "Zoe Youth Sanctuary",
    status: "active",
    createdAt: "2026-01-18T00:00:00.000Z",
  }
];

const initialCells: Cell[] = [
  {
    id: "cell-1",
    name: "Royalty Teens Cell",
    zone: "Zone 1 - Kings Court",
    leaderId: "user-7",
    leaderName: "Brother Joshua Mensah",
    leaderPhone: "+234 810 123 4567",
    leaderEmail: "joshua.royalty@prolificchurch.ce",
    targetAttendance: 35,
    targetSouls: 10,
    meetingDay: "Saturday",
    meetingTime: "4:00 PM",
    venue: "14 Kingsway Boulevard, Lekki Phase 1",
    createdAt: "2026-02-01T00:00:00.000Z",
  },
  {
    id: "cell-2",
    name: "Dynasty Youth Fellowship",
    zone: "Zone 1 - Kings Court",
    leaderId: "user-8",
    leaderName: "Sister Grace Uche",
    leaderPhone: "+234 811 234 5678",
    leaderEmail: "grace.dynasty@prolificchurch.ce",
    targetAttendance: 45,
    targetSouls: 12,
    meetingDay: "Friday",
    meetingTime: "5:30 PM",
    venue: "Youth Centre Room 2, Church Annex",
    createdAt: "2026-02-05T00:00:00.000Z",
  },
  {
    id: "cell-3",
    name: "Luminaries Firebrand Cell",
    zone: "Zone 2 - Victorious Haven",
    leaderId: "user-9",
    leaderName: "Brother Caleb Nnadi",
    leaderPhone: "+234 812 345 6789",
    leaderEmail: "caleb.luminaries@prolificchurch.ce",
    targetAttendance: 50,
    targetSouls: 15,
    meetingDay: "Saturday",
    meetingTime: "5:00 PM",
    venue: "7 Heritage Avenue, Ikeja GRA",
    createdAt: "2026-02-08T00:00:00.000Z",
  },
  {
    id: "cell-4",
    name: "Ambassadors of Light",
    zone: "Zone 2 - Victorious Haven",
    leaderId: "user-10",
    leaderName: "Sister Deborah Akintola",
    leaderPhone: "+234 813 456 7890",
    leaderEmail: "deborah.ambassadors@prolificchurch.ce",
    targetAttendance: 40,
    targetSouls: 10,
    meetingDay: "Saturday",
    meetingTime: "3:30 PM",
    venue: "22 Horizon Estate, Maryland",
    createdAt: "2026-02-10T00:00:00.000Z",
  },
  {
    id: "cell-5",
    name: "Pacesetters Youth Hub",
    zone: "Zone 3 - Grace Arena",
    leaderId: "user-11",
    leaderName: "Brother Samuel Eze",
    leaderPhone: "+234 814 567 8901",
    leaderEmail: "samuel.pacesetters@prolificchurch.ce",
    targetAttendance: 35,
    targetSouls: 8,
    meetingDay: "Friday",
    meetingTime: "6:00 PM",
    venue: "5 Shalom Street, Surulere",
    createdAt: "2026-02-12T00:00:00.000Z",
  },
  {
    id: "cell-6",
    name: "Catalyst Global Cell",
    zone: "Zone 3 - Grace Arena",
    leaderId: "user-12",
    leaderName: "Sister Sharon Bello",
    leaderPhone: "+234 815 678 9012",
    leaderEmail: "sharon.catalyst@prolificchurch.ce",
    targetAttendance: 30,
    targetSouls: 7,
    meetingDay: "Saturday",
    meetingTime: "4:30 PM",
    venue: "Campus Hall B, University Gate",
    createdAt: "2026-02-15T00:00:00.000Z",
  },
  {
    id: "cell-7",
    name: "Dunamis Power Teens",
    zone: "Zone 4 - Zoe Haven",
    leaderId: "user-13",
    leaderName: "Brother David Bassey",
    leaderPhone: "+234 816 789 0123",
    leaderEmail: "david.dunamis@prolificchurch.ce",
    targetAttendance: 40,
    targetSouls: 10,
    meetingDay: "Sunday",
    meetingTime: "2:00 PM",
    venue: "Zoe Fellowship Suite, Victoria Island",
    createdAt: "2026-02-18T00:00:00.000Z",
  },
  {
    id: "cell-8",
    name: "Evergreen Impact Cell",
    zone: "Zone 4 - Zoe Haven",
    leaderId: "user-14",
    leaderName: "Sister Michelle Adeleke",
    leaderPhone: "+234 817 890 1234",
    leaderEmail: "michelle.evergreen@prolificchurch.ce",
    targetAttendance: 30,
    targetSouls: 8,
    meetingDay: "Saturday",
    meetingTime: "4:00 PM",
    venue: "11 Palm View Garden, Ikoyi",
    createdAt: "2026-08-25T14:30:00.000Z",
  },
  {
    id: "cell-9",
    name: "Victors Champions Cell",
    zone: "Zone 5 - Triumph Dominion",
    leaderId: "user-15",
    leaderName: "Brother Emmanuel Temitope",
    leaderPhone: "+234 818 901 2345",
    leaderEmail: "emmanuel.victors@prolificchurch.ce",
    targetAttendance: 35,
    targetSouls: 9,
    meetingDay: "Saturday",
    meetingTime: "4:00 PM",
    venue: "3 Grace Boulevard, Yaba",
    createdAt: "2026-08-27T09:15:00.000Z",
  },
  {
    id: "cell-10",
    name: "Overcomers Elite Teens",
    zone: "Zone 5 - Triumph Dominion",
    leaderId: "user-6",
    leaderName: "Brother Victor Kalu",
    leaderPhone: "+234 807 789 0123",
    leaderEmail: "victor.kalu@prolificchurch.ce",
    targetAttendance: 45,
    targetSouls: 12,
    meetingDay: "Friday",
    meetingTime: "5:00 PM",
    venue: "Dominion Hall, 88 Allen Avenue",
    createdAt: "2026-03-01T00:00:00.000Z",
  }
];

const initialReports: Report[] = [
  {
    id: "rep-101",
    cellId: "cell-1",
    cellName: "Royalty Teens Cell",
    leaderId: "user-7",
    leaderName: "Brother Joshua Mensah",
    leaderPhone: "+234 810 123 4567",
    leaderEmail: "joshua.royalty@prolificchurch.ce",
    zone: "Zone 1 - Kings Court",
    date: "2026-08-23",
    meetingType: "Bible Study 1",
    attendanceCell: 36,
    attendanceSunday: 34,
    attendanceWednesday: 28,
    attendanceTotal: 36,
    firstTimers: 6,
    soulsWon: 5,
    followedUp: 8,
    offering: 38500,
    testimonies: "A teen student named Kevin who had severe exam anxiety prayed during the cell meeting and shared a testimony of supernatural peace and scoring the top grade in his physics test! Two new friends from school accepted Christ warmly.",
    challenges: "Need more hymnals / Rhapsody of Realities TeeVo copies for the newly invited teens.",
    prayerRequests: "Praying for our upcoming campus high school outreach scheduled for mid-September.",
    mediaUrls: [
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=80"
    ],
    nextMeetingDate: "2026-08-30",
    status: "approved",
    coordinatorNotes: "Commendable growth! Super proud of the soul-winning momentum. Approved.",
    pastorNotes: "Glory to God! The harvest is truly plentiful in Kings Court.",
    reviewedBy: "Brother Daniel Osaigbovo",
    reviewedAt: "2026-08-24T10:15:00.000Z",
    createdAt: "2026-08-23T19:40:00.000Z"
  },
  {
    id: "rep-102",
    cellId: "cell-3",
    cellName: "Luminaries Firebrand Cell",
    leaderId: "user-9",
    leaderName: "Brother Caleb Nnadi",
    leaderPhone: "+234 812 345 6789",
    leaderEmail: "caleb.luminaries@prolificchurch.ce",
    zone: "Zone 2 - Victorious Haven",
    date: "2026-08-22",
    meetingType: "Outreach",
    attendanceCell: 53,
    attendanceSunday: 48,
    attendanceWednesday: 40,
    attendanceTotal: 53,
    firstTimers: 14,
    soulsWon: 11,
    followedUp: 15,
    offering: 54000,
    testimonies: "We organized a community sports & youth outreach at the neighbourhood arena. 11 youth surrendered their lives to Christ and 8 registered immediately for the foundation school classes.",
    challenges: "Sound speaker battery died mid-session, we rented an emergency backup generator.",
    prayerRequests: "Grace and strength for all newly converted youth to remain steadfast in church.",
    mediaUrls: [
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&auto=format&fit=crop&q=80"
    ],
    nextMeetingDate: "2026-08-29",
    status: "approved",
    coordinatorNotes: "Massive soul winning achievement! Keep the fire burning.",
    reviewedBy: "Sister Esther Chukwu",
    reviewedAt: "2026-08-23T14:20:00.000Z",
    createdAt: "2026-08-22T21:05:00.000Z"
  },
  {
    id: "rep-103",
    cellId: "cell-2",
    cellName: "Dynasty Youth Fellowship",
    leaderId: "user-8",
    leaderName: "Sister Grace Uche",
    leaderPhone: "+234 811 234 5678",
    leaderEmail: "grace.dynasty@prolificchurch.ce",
    zone: "Zone 1 - Kings Court",
    date: "2026-08-21",
    meetingType: "Bible Study 2",
    attendanceCell: 42,
    attendanceSunday: 40,
    attendanceWednesday: 35,
    attendanceTotal: 42,
    firstTimers: 4,
    soulsWon: 3,
    followedUp: 10,
    offering: 42000,
    testimonies: "In-depth exposition on 'Walking in the Spirit' from Pastor Chris's message. Three members received the baptism of the Holy Ghost with the evidence of speaking in other tongues!",
    challenges: "Need more chairs as attendance exceeded room seating capacity.",
    prayerRequests: "Spiritual discernment for our cell ministry assistants.",
    mediaUrls: [
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&auto=format&fit=crop&q=80"
    ],
    nextMeetingDate: "2026-08-28",
    status: "approved",
    coordinatorNotes: "Approved. Wonderful spiritual impartation.",
    reviewedBy: "Brother Daniel Osaigbovo",
    reviewedAt: "2026-08-22T09:00:00.000Z",
    createdAt: "2026-08-21T20:10:00.000Z"
  },
  {
    id: "rep-104",
    cellId: "cell-5",
    cellName: "Pacesetters Youth Hub",
    leaderId: "user-11",
    leaderName: "Brother Samuel Eze",
    leaderPhone: "+234 814 567 8901",
    leaderEmail: "samuel.pacesetters@prolificchurch.ce",
    zone: "Zone 3 - Grace Arena",
    date: "2026-08-22",
    meetingType: "Prayer and Planning",
    attendanceCell: 33,
    attendanceSunday: 30,
    attendanceWednesday: 26,
    attendanceTotal: 33,
    firstTimers: 5,
    soulsWon: 4,
    followedUp: 7,
    offering: 29000,
    testimonies: "One of our young leaders was offered an overseas university scholarship after our cell prayer vigil last week!",
    challenges: "Rain caused slight delay in start time.",
    prayerRequests: "Open doors for our cell career development workshop next week.",
    mediaUrls: [],
    nextMeetingDate: "2026-08-29",
    status: "approved",
    coordinatorNotes: "Approved. Great testimony!",
    reviewedBy: "Brother Praise Adeyemi",
    reviewedAt: "2026-08-23T11:45:00.000Z",
    createdAt: "2026-08-22T19:30:00.000Z"
  },
  {
    id: "rep-105",
    cellId: "cell-4",
    cellName: "Ambassadors of Light",
    leaderId: "user-10",
    leaderName: "Sister Deborah Akintola",
    leaderPhone: "+234 813 456 7890",
    leaderEmail: "deborah.ambassadors@prolificchurch.ce",
    zone: "Zone 2 - Victorious Haven",
    date: "2026-08-26",
    meetingType: "Prayer and Planning",
    attendanceCell: 28,
    attendanceSunday: 25,
    attendanceWednesday: 22,
    attendanceTotal: 28,
    firstTimers: 2,
    soulsWon: 2,
    followedUp: 14,
    offering: 21500,
    testimonies: "Followed up on 14 teens from last Sunday service. Visited their homes and families welcomed us warmly, requesting monthly cell meetings in their estate.",
    challenges: "Logistics and transport between remote residential estates.",
    prayerRequests: "Provision of bus transport assistance for cell outreaches.",
    mediaUrls: [],
    nextMeetingDate: "2026-09-02",
    status: "pending",
    coordinatorNotes: undefined,
    pastorNotes: undefined,
    createdAt: "2026-08-26T18:00:00.000Z"
  },
  {
    id: "rep-106",
    cellId: "cell-7",
    cellName: "Dunamis Power Teens",
    leaderId: "user-13",
    leaderName: "Brother David Bassey",
    leaderPhone: "+234 816 789 0123",
    leaderEmail: "david.dunamis@prolificchurch.ce",
    zone: "Zone 4 - Zoe Haven",
    date: "2026-08-27",
    meetingType: "Outreach",
    attendanceCell: 42,
    attendanceSunday: 38,
    attendanceWednesday: 30,
    attendanceTotal: 42,
    firstTimers: 9,
    soulsWon: 7,
    followedUp: 11,
    offering: 36000,
    testimonies: "High energy worship and spoken word ministration. 7 high school teenagers were led to Christ and took free copies of 'Now That You Are Born Again'.",
    challenges: "Need more mentors to handle personal counselling for first-timers.",
    prayerRequests: "Growth of cell leadership pipeline.",
    mediaUrls: [
      "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&auto=format&fit=crop&q=80"
    ],
    nextMeetingDate: "2026-09-03",
    status: "pending",
    coordinatorNotes: undefined,
    pastorNotes: undefined,
    createdAt: "2026-08-27T16:20:00.000Z"
  }
];

const initialNotifications: NotificationItem[] = [
  {
    id: "notif-1",
    type: "reminder",
    title: "Weekly Cell Report Deadline Reminder",
    message: "Kindly submit your weekly cell meeting and outreach reports by Monday 12:00 PM to enable the Pastoral office review zone metrics.",
    timestamp: "2026-08-28T08:00:00.000Z",
    read: false,
    targetRole: "cell_leader"
  },
  {
    id: "notif-2",
    type: "submission_alert",
    title: "New Report Submitted: Dunamis Power Teens",
    message: "Brother David Bassey submitted a Special Youth Rally report with 42 attendees and 7 souls won. Requires review.",
    timestamp: "2026-08-27T16:20:00.000Z",
    read: false,
    targetRole: "admin",
    targetZone: "Zone 4 - Zoe Haven",
    reportId: "rep-106"
  },
  {
    id: "notif-3",
    type: "approval_alert",
    title: "Report Approved: Luminaries Firebrand Cell",
    message: "Sister Esther Chukwu approved the Outreach report for Luminaries Firebrand Cell (53 attendees, 11 souls won).",
    timestamp: "2026-08-23T14:20:00.000Z",
    read: true,
    targetRole: "admin",
    reportId: "rep-102"
  }
];

// Helper functions for reading & saving DB
function getDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      const data: DatabaseSchema = JSON.parse(raw);

      // Migrate existing coordinator users to cell_leader
      let changed = false;
      if (data.users && Array.isArray(data.users)) {
        data.users.forEach(u => {
          if ((u.role as any) === 'coordinator') {
            u.role = 'cell_leader';
            changed = true;
          }
        });
      }
      if (data.notifications && Array.isArray(data.notifications)) {
        data.notifications.forEach(n => {
          if ((n.targetRole as any) === 'coordinator') {
            n.targetRole = 'admin';
            changed = true;
          }
        });
      }
      if (changed) {
        saveDatabase(data);
      }
      return data;
    }
  } catch (err) {
    console.error("Error reading database file, resetting to initial state:", err);
  }
  
  const initialData: DatabaseSchema = {
    zones: initialZones,
    cells: initialCells,
    users: initialUsers,
    reports: initialReports,
    notifications: initialNotifications,
  };
  saveDatabase(initialData);
  return initialData;
}

function saveDatabase(data: DatabaseSchema): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing database file:", err);
  }
}

// User credentials mapping
const userPasswords: Record<string, string[]> = {
  "pastor@prolificchurch.ce": ["Pastor@Prolific2026", "pastor123", "pastor2026"],
  "joshua.royalty@prolificchurch.ce": ["Joshua@Cell2026", "joshua123", "leader123", "Leader@2026"],
  "grace.dynasty@prolificchurch.ce": ["Grace@Cell2026", "grace123", "leader123", "Leader@2026"],
  "caleb.luminaries@prolificchurch.ce": ["Caleb@Cell2026", "caleb123", "leader123", "Leader@2026"],
  "deborah.ambassadors@prolificchurch.ce": ["Deborah@Cell2026", "deborah123", "leader123", "Leader@2026"],
  "samuel.pacesetters@prolificchurch.ce": ["Samuel@Cell2026", "samuel123", "leader123", "Leader@2026"],
  "sharon.catalyst@prolificchurch.ce": ["Sharon@Cell2026", "sharon123", "leader123", "Leader@2026"],
  "david.dunamis@prolificchurch.ce": ["David@Cell2026", "david123", "leader123", "Leader@2026"],
  "michelle.evergreen@prolificchurch.ce": ["Michelle@Cell2026", "michelle123", "leader123", "Leader@2026"],
  "emmanuel.victors@prolificchurch.ce": ["Emmanuel@Cell2026", "emmanuel123", "leader123", "Leader@2026"],
  "victor.kalu@prolificchurch.ce": ["Victor@Cell2026", "victor123", "leader123", "Leader@2026"],
  "daniel.osaigbovo@prolificchurch.ce": ["Daniel@Cell2026", "daniel123", "leader123", "Leader@2026"],
  "esther.chukwu@prolificchurch.ce": ["Esther@Cell2026", "esther123", "leader123", "Leader@2026"],
  "praise.adeyemi@prolificchurch.ce": ["Praise@Cell2026", "praise123", "leader123", "Leader@2026"],
  "blessing.okon@prolificchurch.ce": ["Blessing@Cell2026", "blessing123", "leader123", "Leader@2026"],
};

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "Christ Embassy Prolific Church Cell Portal API", timestamp: new Date().toISOString() });
});

// Zones
app.get("/api/zones", (req, res) => {
  const db = getDatabase();
  res.json(db.zones);
});

// Cells
app.get("/api/cells", (req, res) => {
  const db = getDatabase();
  const zoneFilter = req.query.zone as string | undefined;
  if (zoneFilter && zoneFilter !== "All Zones") {
    return res.json(db.cells.filter(c => c.zone === zoneFilter));
  }
  res.json(db.cells);
});

app.post("/api/cells", (req, res) => {
  const db = getDatabase();
  const cellData = req.body;
  if (!cellData.name || !cellData.zone) {
    return res.status(400).json({ error: "Cell name and Zone are required" });
  }

  const newCell: Cell = {
    id: `cell-${Date.now()}`,
    name: cellData.name,
    zone: cellData.zone,
    leaderId: cellData.leaderId || `user-${Date.now()}`,
    leaderName: cellData.leaderName || "Assigned Leader",
    leaderPhone: cellData.leaderPhone || "",
    leaderEmail: cellData.leaderEmail || "",
    targetAttendance: Number(cellData.targetAttendance) || 30,
    targetSouls: Number(cellData.targetSouls) || 10,
    meetingDay: cellData.meetingDay || "Saturday",
    meetingTime: cellData.meetingTime || "4:00 PM",
    venue: cellData.venue || "Church Annex Room",
    createdAt: new Date().toISOString()
  };

  db.cells.unshift(newCell);
  saveDatabase(db);
  res.status(201).json(newCell);
});

app.patch("/api/cells/:id", (req, res) => {
  const db = getDatabase();
  const cellId = req.params.id;
  const index = db.cells.findIndex(c => c.id === cellId);
  if (index === -1) {
    return res.status(404).json({ error: "Cell not found" });
  }

  const oldCell = db.cells[index];
  const updatedCell: Cell = {
    ...oldCell,
    ...req.body,
    id: oldCell.id, // Preserve ID
    targetAttendance: req.body.targetAttendance !== undefined ? Number(req.body.targetAttendance) : oldCell.targetAttendance,
    targetSouls: req.body.targetSouls !== undefined ? Number(req.body.targetSouls) : oldCell.targetSouls,
  };

  db.cells[index] = updatedCell;

  // If cell name changed, update corresponding cellName in users and reports for consistency
  if (req.body.name && req.body.name !== oldCell.name) {
    db.users = db.users.map(u => u.cellId === cellId || u.cellName === oldCell.name ? { ...u, cellName: req.body.name } : u);
    db.reports = db.reports.map(r => r.cellId === cellId || r.cellName === oldCell.name ? { ...r, cellName: req.body.name } : r);
  }

  saveDatabase(db);
  res.json(updatedCell);
});

app.delete("/api/cells/:id", (req, res) => {
  const db = getDatabase();
  const cellId = req.params.id;
  const index = db.cells.findIndex(c => c.id === cellId);
  if (index === -1) {
    return res.status(404).json({ error: "Cell not found" });
  }

  const deletedCell = db.cells[index];
  db.cells.splice(index, 1);
  saveDatabase(db);
  res.json({ message: `Cell ${deletedCell.name} removed successfully`, cellId });
});

// Users
app.get("/api/users", (req, res) => {
  const db = getDatabase();
  res.json(db.users);
});

app.post("/api/users", (req, res) => {
  const db = getDatabase();
  const userData = req.body;
  if (!userData.name || !userData.email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  const newUser: User = {
    id: `user-${Date.now()}`,
    name: userData.name,
    role: userData.role || "cell_leader",
    email: userData.email,
    phone: userData.phone || "",
    zone: userData.zone || "Zone 1 - Kings Court",
    cellId: userData.cellId,
    cellName: userData.cellName,
    status: userData.status || "active",
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  saveDatabase(db);
  res.status(201).json(newUser);
});

app.patch("/api/users/:id", (req, res) => {
  const db = getDatabase();
  const userId = req.params.id;
  const index = db.users.findIndex(u => u.id === userId);
  if (index === -1) {
    return res.status(400).json({ error: "User not found" });
  }

  db.users[index] = { ...db.users[index], ...req.body };
  saveDatabase(db);
  res.json(db.users[index]);
});

app.delete("/api/users/:id", (req, res) => {
  const db = getDatabase();
  const userId = req.params.id;
  const index = db.users.findIndex(u => u.id === userId);
  if (index === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  // Prevent deleting the last admin
  if (db.users[index].role === "admin") {
    const adminCount = db.users.filter(u => u.role === "admin").length;
    if (adminCount <= 1) {
      return res.status(400).json({ error: "Cannot delete the primary/only administrator account." });
    }
  }

  const deletedUser = db.users[index];
  db.users.splice(index, 1);
  saveDatabase(db);
  res.json({ message: `User ${deletedUser.name} deleted successfully`, userId });
});

// Authentication endpoints
app.post("/api/auth/login", (req, res) => {
  const { identifier, password } = req.body;
  const db = getDatabase();

  if (!identifier || !password) {
    return res.status(400).json({ error: "Please provide your email/phone and password." });
  }

  // Look up by email or phone
  const user = db.users.find(u => 
    (u.email.toLowerCase() === identifier?.toLowerCase().trim() || u.phone.trim() === identifier.trim())
  );

  if (!user) {
    return res.status(401).json({ error: "No account found matching this email/phone." });
  }

  if (user.status === "pending_approval") {
    return res.status(403).json({ 
      error: "Your leader account is currently pending Pastor / Admin approval. You will receive access once approved." 
    });
  }

  // Check password against mapping or defaults
  const emailLower = user.email.toLowerCase();
  const validPasswords = userPasswords[emailLower] || ["Leader@2026", "leader123", "cell123"];

  const isPasswordValid = validPasswords.some(
    p => p.toLowerCase() === password.trim().toLowerCase()
  );

  if (!isPasswordValid) {
    return res.status(401).json({ error: "Incorrect password. Please verify your credentials or reset your password." });
  }

  res.json({
    user,
    token: `token-${user.id}-${Date.now()}`
  });
});

app.post("/api/auth/register", (req, res) => {
  const { name, email, phone, zone, cellName, proposedRole } = req.body;
  const db = getDatabase();

  if (!name || !email || !phone) {
    return res.status(400).json({ error: "Name, email, and phone number are required" });
  }

  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: "An account with this email already exists" });
  }

  const newUser: User = {
    id: `user-${Date.now()}`,
    name,
    role: (proposedRole as any) || "cell_leader",
    email,
    phone,
    zone: zone || "Zone 1 - Kings Court",
    cellName: cellName || "New Cell Unit",
    status: "pending_approval",
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);

  // Notify admins
  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    type: "system",
    title: "New Leader Registration Pending Approval",
    message: `${name} has registered as a ${newUser.role} for ${zone}. Please review and activate account.`,
    timestamp: new Date().toISOString(),
    read: false,
    targetRole: "admin"
  });

  saveDatabase(db);
  res.status(201).json({
    message: "Registration submitted successfully! Your account is pending Pastoral approval.",
    user: newUser
  });
});

app.post("/api/auth/reset-password", (req, res) => {
  const { email } = req.body;
  const db = getDatabase();
  const user = db.users.find(u => u.email.toLowerCase() === email?.toLowerCase());
  
  if (!user) {
    return res.status(404).json({ error: "No account found with this email address." });
  }

  res.json({
    message: `Password reset instructions and verification code sent to ${email}. Please check your inbox.`
  });
});

// Reports CRUD & Filters
app.get("/api/reports", (req, res) => {
  const db = getDatabase();
  let results = [...db.reports];

  const { zone, cellId, meetingType, status, startDate, endDate, search, leaderId } = req.query;

  if (zone && zone !== "All Zones") {
    results = results.filter(r => r.zone === zone);
  }
  if (cellId && cellId !== "all") {
    results = results.filter(r => r.cellId === cellId);
  }
  if (leaderId) {
    results = results.filter(r => r.leaderId === leaderId);
  }
  if (meetingType && meetingType !== "all") {
    results = results.filter(r => r.meetingType === meetingType);
  }
  if (status && status !== "all") {
    results = results.filter(r => r.status === status);
  }
  if (startDate) {
    results = results.filter(r => r.date >= (startDate as string));
  }
  if (endDate) {
    results = results.filter(r => r.date <= (endDate as string));
  }
  if (search) {
    const q = (search as string).toLowerCase();
    results = results.filter(r => 
      r.cellName.toLowerCase().includes(q) ||
      r.leaderName.toLowerCase().includes(q) ||
      (r.testimonies && r.testimonies.toLowerCase().includes(q)) ||
      r.zone.toLowerCase().includes(q)
    );
  }

  // Sort descending by date
  results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  res.json(results);
});

app.get("/api/reports/:id", (req, res) => {
  const db = getDatabase();
  const report = db.reports.find(r => r.id === req.params.id);
  if (!report) {
    return res.status(404).json({ error: "Report not found" });
  }
  res.json(report);
});

// Public & Authenticated Report Submission
app.post("/api/reports", (req, res) => {
  const db = getDatabase();
  const body = req.body;

  if (!body.cellName || !body.leaderName || !body.date) {
    return res.status(400).json({ error: "Cell name, leader name, and date of meeting are required." });
  }

  // Find or match cell
  let matchedCell = db.cells.find(c => 
    c.name.toLowerCase() === body.cellName.toLowerCase() ||
    c.id === body.cellId
  );

  const zone = body.zone || (matchedCell ? matchedCell.zone : "Zone 1 - Kings Court");
  const cellId = matchedCell ? matchedCell.id : (body.cellId || `cell-${Date.now()}`);

  // If cell didn't exist, create it in registry
  if (!matchedCell) {
    const createdCell: Cell = {
      id: cellId,
      name: body.cellName,
      zone: zone,
      leaderId: body.leaderId || `user-${Date.now()}`,
      leaderName: body.leaderName,
      leaderPhone: body.leaderPhone || "",
      leaderEmail: body.leaderEmail || "",
      targetAttendance: 35,
      targetSouls: 10,
      meetingDay: "Saturday",
      meetingTime: "4:00 PM",
      venue: "Church Fellowship Unit",
      createdAt: new Date().toISOString()
    };
    db.cells.push(createdCell);
  }

  const attendanceSunday = Number(body.attendanceSunday) || 0;
  const attendanceWednesday = Number(body.attendanceWednesday) || 0;
  const attendanceTotal = Number(body.attendanceTotal) || Number(body.attendanceCell) || 0;

  const newReport: Report = {
    id: `rep-${Date.now()}`,
    cellId: cellId,
    cellName: body.cellName,
    leaderId: body.leaderId,
    leaderName: body.leaderName,
    leaderPhone: body.leaderPhone,
    leaderEmail: body.leaderEmail,
    zone: zone,
    date: body.date,
    meetingType: body.meetingType || "Prayer and Planning",
    attendanceCell: attendanceTotal,
    attendanceSunday,
    attendanceWednesday,
    attendanceTotal,
    firstTimers: Number(body.firstTimers) || 0,
    soulsWon: Number(body.soulsWon) || 0,
    followedUp: Number(body.followedUp) || 0,
    offering: body.offering !== undefined && body.offering !== "" ? Number(body.offering) : undefined,
    testimonies: body.testimonies || "",
    challenges: body.challenges || "",
    prayerRequests: body.prayerRequests || "",
    mediaUrls: Array.isArray(body.mediaUrls) ? body.mediaUrls : [],
    nextMeetingDate: body.nextMeetingDate || "",
    status: "pending",
    createdAt: new Date().toISOString()
  };

  db.reports.unshift(newReport);

  // Generate notification alert to admin / pastor
  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    type: "submission_alert",
    title: `New Report: ${newReport.cellName}`,
    message: `${newReport.leaderName} submitted a ${newReport.meetingType} report with ${newReport.attendanceTotal} cell attendance, ${newReport.attendanceSunday} Sunday service attendees, and ${newReport.soulsWon} souls won.`,
    timestamp: new Date().toISOString(),
    read: false,
    targetRole: "admin",
    targetZone: newReport.zone,
    reportId: newReport.id
  });

  saveDatabase(db);
  res.status(201).json(newReport);
});

// Update Report Status (Approve / Review / Add Notes)
app.patch("/api/reports/:id", (req, res) => {
  const db = getDatabase();
  const reportId = req.params.id;
  const index = db.reports.findIndex(r => r.id === reportId);
  if (index === -1) {
    return res.status(404).json({ error: "Report not found" });
  }

  const existing = db.reports[index];
  const updated: Report = {
    ...existing,
    ...req.body,
    reviewedAt: req.body.status ? new Date().toISOString() : existing.reviewedAt
  };

  db.reports[index] = updated;

  // Add notification if approved
  if (req.body.status === "approved" && existing.status !== "approved") {
    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      type: "approval_alert",
      title: `Report Approved: ${updated.cellName}`,
      message: `The report for ${updated.cellName} on ${updated.date} has been approved by ${req.body.reviewedBy || 'Coordinator'}.`,
      timestamp: new Date().toISOString(),
      read: false,
      targetRole: "cell_leader",
      reportId: updated.id
    });
  }

  saveDatabase(db);
  res.json(updated);
});

// Delete report
app.delete("/api/reports/:id", (req, res) => {
  const db = getDatabase();
  const reportId = req.params.id;
  db.reports = db.reports.filter(r => r.id !== reportId);
  saveDatabase(db);
  res.json({ message: "Report deleted successfully" });
});

// Analytics Dashboard Endpoint
app.get("/api/analytics", (req, res) => {
  const db = getDatabase();
  const { zone, startDate, endDate } = req.query;

  let filteredReports = [...db.reports];
  let filteredCells = [...db.cells];

  if (zone && zone !== "All Zones") {
    filteredReports = filteredReports.filter(r => r.zone === zone);
    filteredCells = filteredCells.filter(c => c.zone === zone);
  }
  if (startDate) {
    filteredReports = filteredReports.filter(r => r.date >= (startDate as string));
  }
  if (endDate) {
    filteredReports = filteredReports.filter(r => r.date <= (endDate as string));
  }

  const totalReports = filteredReports.length;
  const totalAttendance = filteredReports.reduce((sum, r) => sum + (r.attendanceTotal || 0), 0);
  const totalSundayAttendance = filteredReports.reduce((sum, r) => sum + (r.attendanceSunday || 0), 0);
  const totalWednesdayAttendance = filteredReports.reduce((sum, r) => sum + (r.attendanceWednesday || 0), 0);
  const totalTeens = filteredReports.reduce((sum, r) => sum + (r.attendanceTeens || 0), 0);
  const totalFirstTimers = filteredReports.reduce((sum, r) => sum + (r.firstTimers || 0), 0);
  const totalSoulsWon = filteredReports.reduce((sum, r) => sum + (r.soulsWon || 0), 0);
  const totalFollowedUp = filteredReports.reduce((sum, r) => sum + (r.followedUp || 0), 0);
  const totalOffering = filteredReports.reduce((sum, r) => sum + (r.offering || 0), 0);
  const pendingApprovalsCount = filteredReports.filter(r => r.status === "pending").length;

  // Cells reporting compliance for latest 7-14 days
  const reportedCellIds = new Set(filteredReports.map(r => r.cellId));
  const reportingCellsCount = reportedCellIds.size;
  const totalCellsCount = filteredCells.length;
  const complianceRate = totalCellsCount > 0 ? Math.round((reportingCellsCount / totalCellsCount) * 100) : 100;
  
  // Unreported cells
  const unreportedCells = filteredCells.filter(c => !reportedCellIds.has(c.id));

  // Top Performing Cells
  const cellMap = new Map<string, { cellName: string; zone: string; leaderName: string; totalAttendance: number; soulsWon: number; firstTimers: number; reportCount: number }>();
  filteredReports.forEach(r => {
    const existing = cellMap.get(r.cellId) || {
      cellName: r.cellName,
      zone: r.zone,
      leaderName: r.leaderName,
      totalAttendance: 0,
      soulsWon: 0,
      firstTimers: 0,
      reportCount: 0
    };
    existing.totalAttendance += (r.attendanceTotal || 0);
    existing.soulsWon += (r.soulsWon || 0);
    existing.firstTimers += (r.firstTimers || 0);
    existing.reportCount += 1;
    cellMap.set(r.cellId, existing);
  });

  const topPerformingCells = Array.from(cellMap.values())
    .sort((a, b) => (b.soulsWon * 2 + b.totalAttendance) - (a.soulsWon * 2 + a.totalAttendance))
    .slice(0, 5);

  // Weekly Trends (last 5 weeks)
  const weeklyTrends = [
    { weekLabel: "Week 1", attendance: 120, sundayAttendance: 110, wednesdayAttendance: 85, soulsWon: 18, firstTimers: 22, reportsCount: 4 },
    { weekLabel: "Week 2", attendance: 145, sundayAttendance: 135, wednesdayAttendance: 102, soulsWon: 24, firstTimers: 28, reportsCount: 6 },
    { weekLabel: "Week 3", attendance: 182, sundayAttendance: 170, wednesdayAttendance: 130, soulsWon: 31, firstTimers: 34, reportsCount: 7 },
    { weekLabel: "Week 4", attendance: 215, sundayAttendance: 200, wednesdayAttendance: 160, soulsWon: 39, firstTimers: 41, reportsCount: 8 },
    { weekLabel: "Current", attendance: totalAttendance > 0 ? totalAttendance : 246, sundayAttendance: totalSundayAttendance > 0 ? totalSundayAttendance : 225, wednesdayAttendance: totalWednesdayAttendance > 0 ? totalWednesdayAttendance : 180, soulsWon: totalSoulsWon > 0 ? totalSoulsWon : 42, firstTimers: totalFirstTimers > 0 ? totalFirstTimers : 45, reportsCount: totalReports }
  ];

  // Zone Stats
  const zoneStats = db.zones.map(z => {
    const zoneReps = db.reports.filter(r => r.zone === z.name);
    const zoneCells = db.cells.filter(c => c.zone === z.name);
    const zReportedCellIds = new Set(zoneReps.map(r => r.cellId));
    return {
      zoneName: z.name,
      cellsCount: zoneCells.length,
      totalAttendance: zoneReps.reduce((s, r) => s + (r.attendanceTotal || 0), 0),
      totalSundayAttendance: zoneReps.reduce((s, r) => s + (r.attendanceSunday || 0), 0),
      totalWednesdayAttendance: zoneReps.reduce((s, r) => s + (r.attendanceWednesday || 0), 0),
      soulsWon: zoneReps.reduce((s, r) => s + (r.soulsWon || 0), 0),
      firstTimers: zoneReps.reduce((s, r) => s + (r.firstTimers || 0), 0),
      complianceRate: zoneCells.length > 0 ? Math.round((zReportedCellIds.size / zoneCells.length) * 100) : 100
    };
  });

  const summary: AnalyticsSummary = {
    totalReports,
    totalAttendance,
    totalSundayAttendance,
    totalWednesdayAttendance,
    totalTeens,
    totalFirstTimers,
    totalSoulsWon,
    totalFollowedUp,
    totalOffering,
    pendingApprovalsCount,
    complianceRate,
    reportingCellsCount,
    totalCellsCount,
    unreportedCells,
    topPerformingCells,
    weeklyTrends,
    zoneStats
  };

  res.json(summary);
});

// Notifications
app.get("/api/notifications", (req, res) => {
  const db = getDatabase();
  res.json(db.notifications);
});

app.patch("/api/notifications/:id/read", (req, res) => {
  const db = getDatabase();
  const notif = db.notifications.find(n => n.id === req.params.id);
  if (notif) {
    notif.read = true;
    saveDatabase(db);
  }
  res.json({ success: true });
});

// Trigger broadcast reminders
app.post("/api/notifications/broadcast-reminders", (req, res) => {
  const db = getDatabase();
  const { customMessage } = req.body;

  const reminder: NotificationItem = {
    id: `notif-${Date.now()}`,
    type: "reminder",
    title: "Weekly Report Submission Alert",
    message: customMessage || "Dear Cell Leader, this is a reminder to submit your cell weekly report before Monday 12:00 PM. Every soul matters!",
    timestamp: new Date().toISOString(),
    read: false,
    targetRole: "cell_leader"
  };

  db.notifications.unshift(reminder);
  saveDatabase(db);
  res.json({ success: true, reminder });
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Christ Embassy Prolific Church Server running on http://localhost:${PORT}`);
  });
}

startServer();
