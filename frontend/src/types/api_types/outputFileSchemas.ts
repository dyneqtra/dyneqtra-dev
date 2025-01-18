export interface OutputFileResponse {
    id: string
    file_name: string
    created_at: string
    updated_at: string
}

export interface OutputFileCreate {
    run_id: string
    file_name: string
    file_path: string
}

export interface OutputFileUpdate {
    id: string
}
