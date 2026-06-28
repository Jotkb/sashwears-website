import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description: 'The story behind Sashwears — elevated women\'s fashion from Accra, Ghana.',
}

export default function AboutPage() {
  return (
    <div className="pt-[60px]">
      {/* Hero */}
      <div
        className="w-full flex items-center justify-center"
        style={{ minHeight: '50vh', backgroundColor: 'var(--color-cream)' }}
      >
        <h1 className="font-display text-5xl lg:text-8xl text-center px-8" style={{ color: 'var(--color-ink)' }}>
          A study in<br />restraint.
        </h1>
      </div>

      {/* Story */}
      <div className="max-w-2xl mx-auto px-6 section-padding">
        <div className="space-y-8">
          <div>
            <p className="text-label mb-4" style={{ color: 'var(--color-rose-deep)' }}>The Beginning</p>
            <p className="font-display text-2xl lg:text-3xl leading-snug">
              Sashwears began as a quiet conviction: that Ghanaian women deserve fashion
              that speaks before they do.
            </p>
          </div>

          <p style={{ color: 'var(--color-ink-soft)', lineHeight: 1.8 }}>
            Founded in Accra, Sashwears sources and curates pieces that move between
            the contemporary and the timeless. Each collection is an edit — deliberate,
            considered, uncluttered. We believe in dressing for the life you are building,
            not the occasion you are attending.
          </p>

          <p style={{ color: 'var(--color-ink-soft)', lineHeight: 1.8 }}>
            Our pieces are selected with the West African climate and silhouette in mind.
            Breathable fabrics, generous cuts, and a palette that reads well in natural
            light and Accra evening. Nothing we carry is here by accident.
          </p>

          <div>
            <p className="text-label mb-4" style={{ color: 'var(--color-rose-deep)' }}>Made in Ghana</p>
            <p style={{ color: 'var(--color-ink-soft)', lineHeight: 1.8 }}>
              Where possible, we collaborate with local artisans and Ghanaian-owned
              manufacturers. This is not a marketing point — it is a principle.
              What is made here should stay here, circulate here, and elevate here.
            </p>
          </div>

          <div>
            <p className="text-label mb-4" style={{ color: 'var(--color-rose-deep)' }}>How We Work</p>
            <p style={{ color: 'var(--color-ink-soft)', lineHeight: 1.8 }}>
              Small batches. Careful selection. No endless markdown cycles.
              When something sells out, it is because it was worth having.
              We restock thoughtfully, not reactively.
            </p>
          </div>

          <p className="font-display text-xl" style={{ color: 'var(--color-ink)' }}>
            Sashwears is for women who have already decided.
          </p>
        </div>
      </div>
    </div>
  )
}
