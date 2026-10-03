export interface Subject {
    id: string
    user_id: string
    name: string
    color: string
    created_at: string
}

export interface SubjectInput {
    name: string
    color: string
}

export interface Topic {
    id: string
    user_id: string
    subject_id: string
    title: string
    notes: string | null
    exam_date: string | null
    ease_factor: number
    interval_days: number
    repetitions: number
    next_review_date: string
    last_reviewed_at: string | null
    created_at: string
}

export interface TopicFields {
    title: string
    notes: string | null
    exam_date: string | null
}

export interface TopicInput extends TopicFields {
    subject_id: string
}