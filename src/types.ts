export interface GraphQlQueryResponse {
  data: { [ key: string ]: any } | null
  errors?: [{
    message: string
    path: [string]
    extensions: { [ key: string ]: any }
    locations: [{
      line: number,
      column: number
    }]
  }]
}
