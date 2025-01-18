export interface DatasetResponse {
    id: string
    name: string
    description?: string
    filename: string
    created_at: string
    updated_at: string
}

export interface DatasetListResponse {
    datasets: DatasetResponse[]
}
