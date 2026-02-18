export interface TeacherInterface {
  teacher_id?: number;
  teachername_kh: string;
  teachername_en: string;
  password?: string;
  role: 'teacher' | 'admin';
  phone: string;
  is_active: boolean;
  image_url?: null | string;
}

export interface TeacherInfo {
  statusCode: number;
  message: string;
  data: {
    data: TeacherInterface[];
    page: number;
    totalPages: number;
  };
  error: any;
}

export interface TeacherReport {
  statusCode: number;
  message: string;
  data: {
    totalTeacher: number;
    totalTeacherRole: number;
    totalAdminRole: number;
    totalActive: number;
  };
  error: any;
}
