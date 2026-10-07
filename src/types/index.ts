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
export interface DueTopic extends Topic {
    subjects: Pick<Subject, 'name' | 'color'>
}
export interface StudySession {
    id: string
    user_id: string
    topic_id: string | null
    date: string
    start_time: string
    duration_minutes: number
    completed: boolean
    created_at: string
}

export interface SessionWithTopic extends StudySession {
    topics: { title: string; subjects: { name: string; color: string } } | null
}

export interface SessionInput {
    topic_id: string | null
    date: string
    start_time: string
    duration_minutes: number
}

export type SessionChanges = Partial<
    Pick<StudySession, 'topic_id' | 'date' | 'start_time' | 'duration_minutes' | 'completed'>
>

export interface TopicOption {
    id: string
    title: string
    subjects: { name: string }
}
export interface CompletedSession {
    date: string
    duration_minutes: number
    topics: { subject_id: string; subjects: { name: string; color: string } } | null
}

export interface ExamTopic {
    id: string
    title: string
    subject_id: string
    exam_date: string
    last_reviewed_at: string | null
    subjects: { name: string; color: string }
}