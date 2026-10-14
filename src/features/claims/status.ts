import type { Decision, Verdict } from '../../types'

export interface ClaimStatus {
  verdict: Verdict
  decided: boolean
}

export const VERDICT_LABELS: Record<Verdict, string> = {
  supported: 'Supported',
  contradicted: 'Contradicted',
  unverified: 'Unverified',
}

export function getClaimStatus(
  claimId: string,
  decisions: Decision[],
): ClaimStatus {
  let latest: Decision | undefined
  for (const decision of decisions) {
    if (decision.claimId !== claimId) continue
    if (!latest || decision.decidedAt >= latest.decidedAt) latest = decision
  }
  return latest
    ? { verdict: latest.verdict, decided: true }
    : { verdict: 'unverified', decided: false }
}
