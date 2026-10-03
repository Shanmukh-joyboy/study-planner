import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'

export function useInvalidate() {
    const queryClient = useQueryClient()
    const { user } = useAuth()

    return (...keys: string[]) =>
        Promise.all(
            keys.map((key) => queryClient.invalidateQueries({ queryKey: [key, user?.id] })),
        )
}