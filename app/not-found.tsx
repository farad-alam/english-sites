import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <p className="text-sm font-bold uppercase tracking-widest text-brand-primary mb-3">404</p>
      <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-text-primary mb-4">Page not found</h1>
      <p className="text-text-muted mb-8">The page you’re looking for doesn’t exist or has moved.</p>
      <Link href="/" className="btn btn-primary">
        Back to the home page
      </Link>
    </div>
  )
}
