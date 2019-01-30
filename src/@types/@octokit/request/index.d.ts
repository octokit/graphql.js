declare module '@octokit/request' {
  export interface RequestOptions {
    method: 'POST'
    headers?: { [key: string]: string }
  }
  export interface Request {
    (RequestOptions): Promise<any>
    defaults (RequestOptions): Request
  }
}