import { params } from '@/utils/url';
import { WorkReport, WorkReportExport, WorkReportSchedule, WorkReportType } from '@/types/app/workReport';

const baseUrl = process.env.NEXT_PUBLIC_PROJECT_API;
const authTokenKey = 'thrivex_blog_token';

async function reportRequest<T>(method: string, api: string, data?: unknown): Promise<ResponseData<T>> {
  const token = typeof window !== 'undefined' ? localStorage.getItem(authTokenKey) : '';
  const isBodyMethod = ['POST', 'PATCH', 'PUT'].includes(method);
  const response = await fetch(`${baseUrl}${api}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
    body: isBodyMethod ? JSON.stringify(data ?? {}) : undefined,
    cache: 'no-store',
  });

  return response.json();
}

export const getWorkReportAPI = (type: WorkReportType, period: string) => {
  return reportRequest<WorkReport | null>('GET', `/work_report${params({ type, period })}`);
};

export const saveWorkReportAPI = (data: WorkReport) => {
  return reportRequest<WorkReport>('POST', '/work_report', data);
};

export const updateWorkReportAPI = (id: number, data: WorkReport) => {
  return reportRequest<WorkReport>('PATCH', `/work_report/${id}`, data);
};

export const listWorkReportExportsAPI = (page = 1, size = 20) => {
  return reportRequest<Paginate<WorkReportExport[]>>('GET', `/work_report/export/list${params({ page, size })}`);
};

export const exportWorkReportAPI = (id: number) => {
  return reportRequest<WorkReportExport>('POST', `/work_report/${id}/export`);
};

export const getWorkReportSchedulesAPI = () => {
  return reportRequest<WorkReportSchedule[]>('GET', '/work_report/schedule');
};

export const updateWorkReportSchedulesAPI = (data: WorkReportSchedule[]) => {
  return reportRequest<WorkReportSchedule[]>('PATCH', '/work_report/schedule', data);
};

export const getWorkReportDownloadUrl = (id: number) => `${baseUrl}/work_report/export/${id}/download`;
