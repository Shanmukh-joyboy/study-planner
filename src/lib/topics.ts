import { supabase } from './supabase'
import { toISODate } from './dates'
import type { Sm2Result } from './sm2'
import type { DueTopic, Topic, TopicFields, TopicInput } from '../types'

export async function fetchTopics(subjectId: string): Promise<Topic[]> {
    const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('subject_id', subjectId)
        .order('created_at', { ascending: true })
    if (error) throw error
    return data as Topic[]
}

export async function fetchDueTopics(today: string): Promise<DueTopic[]> {
    const { data, error } = await supabase
        .from('topics')
        .select('*, subjects(name, color)')
        .lte('next_review_date', today)
        .order('next_review_date', { ascending: true })
        .order('created_at', { ascending: true })
    if (error) throw error
    return data as DueTopic[]
}

export async function createTopic(input: TopicInput): Promise<Topic> {
    const { data, error } = await supabase
        .from('topics')
        .insert({ ...input, next_review_date: toISODate(new Date()) })
        .select()
        .single()
    if (error) throw error
    return data as Topic
}

export async function updateTopic({
    id,
    ...fields
}: TopicFields & { id: string }): Promise<Topic> {
    const { data, error } = await supabase
        .from('topics')
        .update(fields)
        .eq('id', id)
        .select()
        .single()
    if (error) throw error
    return data as Topic
}

export async function saveReview({ id, ...result }: Sm2Result & { id: string }): Promise<Topic> {
    const { data, error } = await supabase
        .from('topics')
        .update({ ...result, last_reviewed_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
    if (error) throw error
    return data as Topic
}

export async function deleteTopic(id: string): Promise<void> {
    const { error } = await supabase.from('topics').delete().eq('id', id)
    if (error) throw error
}