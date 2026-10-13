import { useState } from 'react'
import { ClaimForm } from './features/claims/ClaimForm'
import { claimsStore } from './lib/storage'
import type { Claim } from './types'
import './App.css'

interface LoadState {
  claims: Claim[]
  loadError: string | null
}

function loadInitialState(): LoadState {
  const result = claimsStore.list()
  return result.ok
    ? { claims: result.value, loadError: null }
    : { claims: [], loadError: result.error.message }
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

      {state.loadError && (
        <p className="form-error" role="alert">
          Saved claims could not be loaded: {state.loadError}
        </p>
      )}

      <ClaimForm onCreated={handleCreated} />

      {!state.loadError && (
        <p className="summary">
          {count === 1 ? '1 claim' : `${count} claims`} saved in this browser.
        </p>
      )}
    </main>
  )
}

export default App
