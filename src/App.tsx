import { useState } from 'react'
import { ClaimForm } from './features/claims/ClaimForm'
import { ClaimList } from './features/claims/ClaimList'
import { claimsStore, decisionsStore } from './lib/storage'
import type { Claim, Decision } from './types'
import './App.css'

interface LoadState {
  claims: Claim[]
  claimsError: string | null
  decisions: Decision[]
  decisionsError: string | null
}

function loadInitialState(): LoadState {
  const claims = claimsStore.list()
  const decisions = decisionsStore.list()
  return {
    claims: claims.ok ? claims.value : [],
    claimsError: claims.ok ? null : claims.error.message,
    decisions: decisions.ok ? decisions.value : [],
    decisionsError: decisions.ok ? null : decisions.error.message,
  }
}

function App() {
  const [state, setState] = useState<LoadState>(loadInitialState)

  function handleCreated(claim: Claim) {
    setState((current) => ({ ...current, claims: [...current.claims, claim] }))
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
          />
        </>
      )}
    </main>
  )
}

export default App
