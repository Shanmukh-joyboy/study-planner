import { keepPreviousData, skipToken, useMutation, useQuery } from '@tanstack/react-query'
import {
    createSession,
    deleteSession,
    fetchSessions,
    fetchTopicOptions,
    updateSession,
} from '../lib/sessions'
import { useAuth } from './useAuth'
import { useInvalidate } from './useInvalidate'

export function useSessions(from: string, to: string) {
    const { user } = useAuth()
    return useQuery({
        queryKey: ['sessions', user?.id, from, to],
        queryFn: user ? () => fetchSessions(from, to) : skipToken,
        placeholderData: keepPreviousData,
    })
}

// The key starts with 'topics', so any topic change refreshes this list too.
export function useTopicOptions() {
    const { user } = useAuth()
    return useQuery({
        queryKey: ['topics', user?.id, 'options'],
        queryFn: user ? fetchTopicOptions : skipToken,
    })
}

export function useCreateSession() {
    const invalidate = useInvalidate()
    return useMutation({
        mutationFn: createSession,
        onSuccess: () => invalidate('sessions'),
    })
}

export function useUpdateSession() {
    const invalidate = useInvalidate()
    return useMutation({
        mutationFn: updateSession,
        onSuccess: () => invalidate('sessions'),
    })
}

export function useDeleteSession() {
    const invalidate = useInvalidate()
    return useMutation({
        mutationFn: deleteSession,
        onSuccess: () => invalidate('sessions'),
    })
}