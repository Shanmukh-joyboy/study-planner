import { supabase } from './supabase'
import type { Topic, TopicFields, TopicInput } from '../types'

export async function fetchTopics(subjectId: string): Promise<Topic[]> {
    const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('subject_id', subjectId)
        .order('created_at', { ascending: true })
    if (error) throw error
    return data as Topic[]
}

export async function createTopic(input: TopicInput): Promise<Topic> {
    const { data, error } = await supabase.from('topics').insert(input).select().single()
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

export async function deleteTopic(id: string): Promise<void> {
    const { error } = await supabase.from('topics').delete().eq('id', id)
    if (error) throw error
}