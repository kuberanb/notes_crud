import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { store } from './app/store.js'
import { Provider } from 'react-redux'
import { api } from './services/api'
import { setCredentials } from './features/auth/authSlice'
import { LoaderCircle } from "lucide-react";

const root = createRoot(document.getElementById('root'))

async function startApp() {
  root.render(
    <div className="flex min-h-screen flex-col items-center justify-center gap-3">
      <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">
        Loading...
      </p>
    </div>
  )

  const { data } = await store.dispatch(
    api.endpoints.refresh.initiate()
  )

  if (data?.accessToken) {
    store.dispatch(
      setCredentials({ accessToken: data.accessToken })
    )
  }

  root.render(
    <StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </StrictMode>
  )
}

startApp()
