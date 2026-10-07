import { skipToken, useQuery } from '@tanstack/react-query'
import { fetchCompletedSessions, fetchExamTopics } from '../lib/progress-api'
import { useAuth } from './useAuth'

export function useCompletedSessions(from: string, to: string) {
    const { user } = useAuth()
    return useQuery({
        queryKey: ['sessions', user?.id, 'completed', from, to],
        queryFn: user ? () => fetchCompletedSessions(from, to) : skipToken,
    })
}

export function useExamTopics(today: string) {
    const { user } = useAuth()
    return useQuery({
        queryKey: ['topics', user?.id, 'exams', today],
        queryFn: user ? () => fetchExamTopics(today) : skipToken,
    })
}