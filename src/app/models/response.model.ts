export interface ResponseInterface {
  statusCode: number;
  success: boolean;
  message: string;
  data: any[];
  error: string;
}

export interface AuthResponseInterface {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    teacher_id: number;
    teachername_kh: string;
    teachername_en: string;
    role: 'admin' | 'teacher';
    phone: string;
    is_active: boolean;
    image_url: string;
    token: string;
  };
  error: string;
}
