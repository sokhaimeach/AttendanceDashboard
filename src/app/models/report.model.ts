export interface AttendanceReport {
  statusCode: number;
  success: boolean;
  message: string;
  data: LineChartInterface;
  error: string;
}

export interface LineChartInterface {
  labels: string[];
  p: number[];
  a: number[];
  ap: number[];
  l: number[];
}

export interface KpisInterface {
  title: string;
  total: number;
  text: string;
  icon: string;
  bg_color: string;
  text_color: string;
}
