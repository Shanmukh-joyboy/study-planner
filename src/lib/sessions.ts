import { supabase } from './supabase'
import type {
    SessionChanges,
    SessionInput,
    SessionWithTopic,
    StudySession,
    TopicOption,
} from '../types'

export async function fetchSessions(from: string, to: string): Promise<SessionWithTopic[]> {
    const { data, error } = await supabase
        .from('study_sessions')
        .select('*, topics(title, subjects(name, color))')
        .gte('date', from)
        .lte('date', to)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true })
    if (error) throw error
    return data as SessionWithTopic[]
}

/** Topics a session can be linked to, for the dropdown. */
export async function fetchTopicOptions(): Promise<TopicOption[]> {
    const { data, error } = await supabase
        .from('topics')
        .select('id, title, subjects(name)')
        .order('title', { ascending: true })
    if (error) throw error
    return data as unknown as TopicOption[]
}

export async function createSession(input: SessionInput): Promise<StudySession> {
    const { data, error } = await supabase.from('study_sessions').insert(input).select().single()
    if (error) throw error
    return data as StudySession
}

export async function updateSession({
    id,
    changes,
}: {
    id: string
    changes: SessionChanges
}): Promise<StudySession> {
    const { data, error } = await supabase
        .from('study_sessions')
        .update(changes)
        .eq('id', id)
        .select()
        .single()
    if (error) throw error
    return data as StudySession
}

export async function deleteSession(id: string): Promise<void> {
    const { error } = await supabase.from('study_sessions').delete().eq('id', id)
    if (error) throw error
}