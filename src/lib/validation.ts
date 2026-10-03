export const NAME_MAX = 80
export const TITLE_MAX = 120
export const NOTES_MAX = 2000

export function validateSubjectName(name: string): string | null {
    const trimmed = name.trim()
    if (!trimmed) return 'Name is required'
    if (trimmed.length > NAME_MAX) return `Name must be ${NAME_MAX} characters or fewer`
    return null
}

export function validateTopicTitle(title: string): string | null {
    const trimmed = title.trim()
    if (!trimmed) return 'Title is required'
    if (trimmed.length > TITLE_MAX) return `Title must be ${TITLE_MAX} characters or fewer`
    return null
}

export function validateNotes(notes: string): string | null {
    if (notes.trim().length > NOTES_MAX) return `Notes must be ${NOTES_MAX} characters or fewer`
    return null
}