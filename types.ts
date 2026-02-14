
export interface Task {
  id: string;
  label: string;
  completed: boolean;
}

export interface Session {
  id: string;
  title: string;
  duration: string;
  tasks: Task[];
  completed: boolean;
}

export interface DayProgress {
  dayNumber: number;
  sessions: Session[];
  dateString: string;
  mistakes: string;
  marks?: number; // Score out of 80
}

export interface VitalityStats {
  energy: number; 
  focus: number;  
  hydration: number; 
  sleep: number; 
}

export enum UserRank {
  BEGINNER = 'Beginner',
  FOCUSED = 'Focused',
  CONSISTENT = 'Consistent',
  EXAM_READY = 'Exam Ready'
}

export interface UserProgress {
  startDate: string;
  days: DayProgress[];
  points: number;
  streak: number;
  rank: UserRank;
  lastVisitDate: string;
  vitals: VitalityStats;
}
