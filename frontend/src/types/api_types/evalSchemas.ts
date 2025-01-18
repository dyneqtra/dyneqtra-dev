export interface EvalRunRequest {
    workflow_id: string
    eval_name: string
    output_variable: string
    num_samples: number
}

export type EvalRunStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'

export interface EvalRunResponse {
    run_id: string
    eval_name: string
    workflow_id: string
    status: EvalRunStatus
    start_time?: string
    end_time?: string
    results?: Record<string, any>
}
