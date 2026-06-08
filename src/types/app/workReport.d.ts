export type WorkReportType = 'daily' | 'weekly' | 'monthly';

export interface WorkReport {
  id?: number;
  userId?: number;
  type: WorkReportType;
  period: string;
  title?: string;
  summary?: string;
  details?: string;
  nextPlan?: string;
  attachmentNote?: string;
  status?: 'draft' | 'final';
  draftVersion?: number;
  createTime?: string;
  updateTime?: string;
}

export interface WorkReportExport {
  id: number;
  userId: number;
  reportId: number;
  type: WorkReportType;
  period: string;
  fileName: string;
  filePath: string;
  source: 'manual' | 'schedule' | string;
  exportTime: string;
}

export interface WorkReportSchedule {
  id?: number;
  userId?: number;
  type: WorkReportType;
  enabled: boolean;
  exportTime: string;
  weeklyDay: number;
  monthlyMode: string;
  lastExportPeriod?: string;
}
