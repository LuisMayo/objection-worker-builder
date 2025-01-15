export interface User {
    displayName?: string;
    preferedCharacter?: string;
    id?: string;
}
// 256 * 192
export interface EngineJob {
    tmpDir: string,
    comments: {
        text?: string;
        evidence?: string;
        user: User
    }[]
}

export enum JobStatus {
    PENDING = 'PENDING',
    RUNNING = 'RUNNING',
    FAILED = 'FAILED',
    COMPLETE = 'COMPLETE'
}

export interface FullJob {
    ID: number;
    status: JobStatus
    final_file?: string;
    worker_id?: number;
    timestamp?: string;
    failed_attempts?: string;
    engine_job: EngineJob;
}