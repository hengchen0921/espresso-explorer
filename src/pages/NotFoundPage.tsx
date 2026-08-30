import { ArrowGlyph, ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Section'

export function NotFoundPage() {
  return (
    <Container className="grid min-h-[62vh] place-items-center py-24 text-center">
      <div>
        <p className="eyebrow">404 · no such machine</p>
        <h1 className="mx-auto mt-7 max-w-[18ch] text-[clamp(2.2rem,5vw,3.8rem)] leading-[1]">
          That one is not on the counter.
        </h1>
        <p className="mx-auto mt-6 max-w-[46ch] text-[1rem] leading-[1.7] text-ash">
          The page you asked for does not exist — or the machine has not been modelled yet.
        </p>
        <ButtonLink to="/" className="group mt-10">
          Back to the shortlist
          <ArrowGlyph className="group-hover:translate-x-1" />
        </ButtonLink>
      </div>
    </Container>
  )
}
