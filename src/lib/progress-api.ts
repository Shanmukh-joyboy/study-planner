import { supabase } from './supabase'
import type { CompletedSession, ExamTopic } from '../types'

export async function fetchCompletedSessions(
    from: string,
    to: string,
): Promise<CompletedSession[]> {
    const { data, error } = await supabase
        .from('study_sessions')
        .select('date, duration_minutes, topics(subject_id, subjects(name, color))')
        .eq('completed', true)
        .gte('date', from)
        .lte('date', to)
    if (error) throw error
    return data as unknown as CompletedSession[]
}

/** Topics with an exam today or later. */
export async function fetchExamTopics(today: string): Promise<ExamTopic[]> {
    const { data, error } = await supabase
        .from('topics')
        .select('id, title, subject_id, exam_date, last_reviewed_at, subjects(name, color)')
        .gte('exam_date', today)
        .order('exam_date', { ascending: true })
    if (error) throw error
    return data as unknown as ExamTopic[]
}