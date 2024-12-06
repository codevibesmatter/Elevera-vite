import { Outlet, useNavigate } from '@tanstack/react-router'
import { useAuth } from '@clerk/clerk-react'
import { useEffect } from 'react'

function App() {
  const { isSignedIn } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isSignedIn) {
      navigate({ to: '/dashboard' })
    }
  }, [isSignedIn, navigate])

  return (
    <div className="min-h-screen bg-base-100">
      <header className="navbar bg-base-200">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl">Elevra</a>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default App
