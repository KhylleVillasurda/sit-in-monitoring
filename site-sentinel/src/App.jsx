import { useState } from "react"
import Login from "./Login"

function App() {
  const [loggedIn, setLoggedIn] = useState(false)

  if (!loggedIn) return <Login onLogin={() => setLoggedIn(true)} />

  return <div><h1>Dashboard coming soon!</h1></div>
}

export default App