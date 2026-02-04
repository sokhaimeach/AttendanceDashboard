export interface ResponseInterface {
    statusCode: number,
    success: boolean,
    message: string,
    data: any[],
    error: string
}