import { Link, Navigate } from 'react-router-dom'
import { AuthForm } from '../components/AuthForm'
import { useAuth } from '../hooks/useAuth'

export function SignupPage() {
    const { user, signUp } = useAuth()

    if (user) return <Navigate to="/" replace />

    return (
        <AuthForm
            title="Create account"
            submitLabel="Sign up"
            onSubmit={async (email, password) => {
                const { needsConfirmation } = await signUp(email, password)
                return needsConfirmation
                    ? 'Check your email to confirm your account, then log in.'
                    : null
            }}
            footer={
                <>
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-indigo-600 hover:underline">
                        Log in
                    </Link>
                </>
            }
        />
    )
}