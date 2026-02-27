import { Outlet } from 'react-router-dom';

// root component uses router outlet; specific pages are defined via routes
export default function App() {
  return (
    <div className='min-w-screen min-h-screen'>
      <Outlet />
    </div>
  );
}
