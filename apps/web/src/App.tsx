import { Outlet } from 'react-router-dom';
import AuthSessionManager from './app/AuthSessionManager';

export default function App() {
  return (
    <div className='min-w-screen min-h-screen'>
      <AuthSessionManager />
      <Outlet />
    </div>
  )
}
