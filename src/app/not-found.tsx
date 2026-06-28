import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-6 pt-[60px]">
      <p className="text-label" style={{ color: 'var(--color-rose-deep)' }}>404</p>
      <h1 className="font-display text-4xl lg:text-6xl text-center">
        This page doesn&apos;t exist.
      </h1>
      <p className="text-center max-w-sm" style={{ color: 'var(--color-ink-soft)' }}>
        It may have moved, or perhaps it was never here.
      </p>
      <Link href="/" className="btn-primary mt-4">Back to Home</Link>
    </div>
  )
}
