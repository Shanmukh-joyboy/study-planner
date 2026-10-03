import { skipToken, useMutation, useQuery } from '@tanstack/react-query'
import {
    createTopic,
    deleteTopic,
    fetchDueTopics,
    fetchTopics,
    saveReview,
    updateTopic,
} from '../lib/topics'
import { useAuth } from './useAuth'
import { useInvalidate } from './useInvalidate'

export function useTopics(subjectId: string | undefined) {
    const { user } = useAuth()
    return useQuery({
        queryKey: ['topics', user?.id, subjectId],
        queryFn: user && subjectId ? () => fetchTopics(subjectId) : skipToken,
    })
}

export function useDueTopics(today: string) {
    const { user } = useAuth()
    return useQuery({
        queryKey: ['due-topics', user?.id, today],
        queryFn: user ? () => fetchDueTopics(today) : skipToken,
    })
}

export function useCreateTopic() {
    const invalidate = useInvalidate()
    return useMutation({
        mutationFn: createTopic,
        onSuccess: () => invalidate('topics', 'due-topics'),
    })
}

export function useUpdateTopic() {
    const invalidate = useInvalidate()
    return useMutation({
        mutationFn: updateTopic,
        onSuccess: () => invalidate('topics', 'due-topics'),
    })
}

export function useReviewTopic() {
    const invalidate = useInvalidate()
    return useMutation({
        mutationFn: saveReview,
        onSuccess: () => invalidate('topics', 'due-topics'),
    })
}

export function useDeleteTopic() {
    const invalidate = useInvalidate()
    return useMutation({
        mutationFn: deleteTopic,
        onSuccess: () => invalidate('topics', 'due-topics'),
    })
}