import { Link, Navigate } from 'react-router-dom'
import { AuthForm } from '../components/AuthForm'
import { useAuth } from '../hooks/useAuth'

export function LoginPage() {
    const { user, signIn } = useAuth()

    if (user) return <Navigate to="/" replace />

    return (
        <AuthForm
            title="Log in"
            submitLabel="Log in"
            onSubmit={async (email, password) => {
                await signIn(email, password)
                return null
            }}
            footer={
                <>
                    No account?{' '}
                    <Link to="/signup" className="font-medium text-indigo-600 hover:underline">
                        Sign up
                    </Link>
                </>
            }
        />
    )
}