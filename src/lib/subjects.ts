import { supabase } from './supabase'
import type { Subject, SubjectInput } from '../types'

export async function fetchSubjects(): Promise<Subject[]> {
    const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('created_at', { ascending: true })
    if (error) throw error
    return data as Subject[]
}

export async function createSubject(input: SubjectInput): Promise<Subject> {
    const { data, error } = await supabase.from('subjects').insert(input).select().single()
    if (error) throw error
    return data as Subject
}

export async function updateSubject({
    id,
    ...changes
}: SubjectInput & { id: string }): Promise<Subject> {
    const { data, error } = await supabase
        .from('subjects')
        .update(changes)
        .eq('id', id)
        .select()
        .single()
    if (error) throw error
    return data as Subject
}

export async function deleteSubject(id: string): Promise<void> {
    const { error } = await supabase.from('subjects').delete().eq('id', id)
    if (error) throw error
}