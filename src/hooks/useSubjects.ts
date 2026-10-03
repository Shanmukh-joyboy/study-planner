import { skipToken, useMutation, useQuery } from '@tanstack/react-query'
import { createSubject, deleteSubject, fetchSubjects, updateSubject } from '../lib/subjects'
import { useAuth } from './useAuth'
import { useInvalidate } from './useInvalidate'

export function useSubjects() {
    const { user } = useAuth()
    return useQuery({
        queryKey: ['subjects', user?.id],
        queryFn: user ? fetchSubjects : skipToken,
    })
}

export function useCreateSubject() {
    const invalidate = useInvalidate()
    return useMutation({
        mutationFn: createSubject,
        onSuccess: () => invalidate('subjects'),
    })
}

export function useUpdateSubject() {
    const invalidate = useInvalidate()
    return useMutation({
        mutationFn: updateSubject,
        onSuccess: () => invalidate('subjects', 'due-topics', 'sessions'),
    })
}

export function useDeleteSubject() {
    const invalidate = useInvalidate()
    return useMutation({
        mutationFn: deleteSubject,
        onSuccess: () => invalidate('subjects', 'topics', 'due-topics', 'sessions'),
    })
}