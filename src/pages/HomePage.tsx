import { Link } from 'react-router-dom'
import { primaryButtonClass } from '../lib/styles'

export function HomePage() {
    return (
        <section>
            <h1 className="text-2xl font-semibold text-slate-900">Welcome</h1>
            <p className="mt-2 text-slate-600">
                Organise what you study into subjects and topics. Reviews arrive in Phase 3.
            </p>
            <Link to="/subjects" className={`mt-4 inline-block ${primaryButtonClass}`}>
                Go to subjects
            </Link>
        </section>
    )
}