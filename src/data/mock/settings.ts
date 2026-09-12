export type AttendanceSettings = {
  dueTime: string;              // HH:MM — when roll call is due
  gracePeriodMinutes: number;   // extra minutes after due time
  cutoffTime: string;           // HH:MM — after this, unmarked → unexplained absence
  allowLateSubmission: boolean; // teachers can submit after cutoff
  requireReview: boolean;       // post-submit review is mandatory
  notifyParentsOnAbsence: boolean;
  notifyParentsOnLate: boolean;
  alertDelayMinutes: number;    // wait X minutes after cutoff before alerting parents
  retentionDays: number;        // how long attendance records are kept
  archiveAfterDays: number;     // move to archive after X days
};

export const defaultSettings: AttendanceSettings = {
  dueTime: "09:00",
  gracePeriodMinutes: 15,
  cutoffTime: "09:45",
  allowLateSubmission: true,
  requireReview: true,
  notifyParentsOnAbsence: true,
  notifyParentsOnLate: false,
  alertDelayMinutes: 30,
  retentionDays: 730,   // 2 years
  archiveAfterDays: 180,
};