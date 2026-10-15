import { useState } from 'react'
import { ClaimForm } from './features/claims/ClaimForm'
import { ClaimList } from './features/claims/ClaimList'
import {
  claimCreatedEvent,
  decisionRecordedEvent,
  evidenceAddedEvent,
  recordAuditEvent,
} from './features/audit/events'
import type { NewAuditEvent } from './features/audit/events'
import {
  auditStore,
  claimsStore,
  decisionsStore,
  evidenceStore,
} from './lib/storage'
import type { AuditEntry, Claim, Decision, Evidence } from './types'
import './App.css'

interface LoadState {
  claims: Claim[]
  claimsError: string | null
  decisions: Decision[]
  decisionsError: string | null
  evidence: Evidence[]
  evidenceError: string | null
  audit: AuditEntry[]
  auditError: string | null
  auditWarning: string | null
}

function loadInitialState(): LoadState {
  const claims = claimsStore.list()
  const decisions = decisionsStore.list()
  const evidence = evidenceStore.list()
  const audit = auditStore.list()
  return {
    claims: claims.ok ? claims.value : [],
    claimsError: claims.ok ? null : claims.error.message,
    decisions: decisions.ok ? decisions.value : [],
    decisionsError: decisions.ok ? null : decisions.error.message,
    evidence: evidence.ok ? evidence.value : [],
    evidenceError: evidence.ok ? null : evidence.error.message,
    audit: audit.ok ? audit.value : [],
    auditError: audit.ok ? null : audit.error.message,
    auditWarning: null,
  }
}

function App() {
  const [state, setState] = useState<LoadState>(loadInitialState)

  function record(event: NewAuditEvent) {
    const result = recordAuditEvent(event)
    if (result.ok) {
      setState((current) => ({
        ...current,
        audit: [...current.audit, result.value],
        auditWarning: null,
      }))
    } else {
      setState((current) => ({
        ...current,
        auditWarning: `The change was saved, but its history entry could not be recorded: ${result.error.message}`,
      }))
    }
  }

  function handleCreated(claim: Claim) {
    setState((current) => ({ ...current, claims: [...current.claims, claim] }))
    record(claimCreatedEvent(claim))
  }

  function handleEvidenceAdded(item: Evidence) {
    setState((current) => ({
      ...current,
      evidence: [...current.evidence, item],
    }))
    record(evidenceAddedEvent(item))
  }

  function handleDecisionAdded(item: Decision) {
    setState((current) => ({
      ...current,
      decisions: [...current.decisions, item],
    }))
    record(decisionRecordedEvent(item))
  }

  const count = state.claims.length

  return (
    <main className="app">
      <header className="app-header">
        <h1>SherlockLedger</h1>
        <p className="tagline">Every claim. Every source. Every decision.</p>
      </header>

      {state.claimsError && (
        <p className="form-error" role="alert">
          Saved claims could not be loaded: {state.claimsError}
        </p>
      )}
      {state.decisionsError && (
        <p className="form-error" role="alert">
          Decisions could not be loaded, so claim statuses are unavailable:{' '}
          {state.decisionsError}
        </p>
      )}
      {state.auditWarning && (
        <p className="form-error" role="alert">
          {state.auditWarning}
        </p>
      )}

      <ClaimForm onCreated={handleCreated} />

      {!state.claimsError && (
        <>
          <p className="summary">
            {count === 1 ? '1 claim' : `${count} claims`} saved in this browser.
          </p>
          <ClaimList
            claims={state.claims}
            decisions={state.decisions}
            decisionsError={state.decisionsError}
            evidence={state.evidence}
            evidenceError={state.evidenceError}
            audit={state.audit}
            auditError={state.auditError}
            onEvidenceAdded={handleEvidenceAdded}
            onDecisionAdded={handleDecisionAdded}
          />
        </>
      )}
    </main>
  )
}

export default App
