# Knowledge base source content

This folder is where real, sourced Nigerian ADR/legal knowledge base
documents belong before running `npm run ingest-knowledge`. Each file
should be plain text or markdown, with a matching entry added to
`scripts/ingest-knowledge.ts`'s manifest describing its title, source
type, jurisdiction, authority level, and (critically) where it actually
came from.

## `examples/` is placeholder content, not real law

The files in `examples/` are clearly-labeled, deliberately generic
descriptions of how ADR processes work in general. They exist only to
demonstrate that the ingestion -> embedding -> retrieval -> grounded
generation pipeline actually works end to end. They are **not** sourced
from, and must not be treated as, actual Nigerian legislation, case law,
or an official ADR institution's rules.

**Do not deploy this to real users without replacing `examples/` with
real, professionally sourced, and legally reviewed content.** Every entry
should be traceable to an actual publication (an Act, a court/tribunal
rule, an ADR institution's published procedure) with its `sourceUrl`,
`publicationDate`, and `authorityLevel` filled in accurately. Getting this
wrong is exactly the "AI invents law" failure mode the RAG requirements
are designed to prevent, the fix has to happen in what gets fed into the
knowledge base, not just in the prompt.
