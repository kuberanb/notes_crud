
import { useSelector } from 'react-redux'
import NotesPage from './features/notes/NotesPage';
import AuthForm from './features/auth/AuthForm';



function App() {
  const acessToken = useSelector((state) => state.auth.accessToken);


  return (
    <main>
      {acessToken ? <NotesPage /> : <AuthForm />}
    </main>
  )
}

export default App
