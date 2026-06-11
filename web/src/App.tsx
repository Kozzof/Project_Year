import { Navigate, Route, Routes } from 'react-router-dom';
import { Nav } from './components/Nav';
import { useAuth } from './context/AuthContext';
import { AdminPage } from './pages/AdminPage';
import { FeedPage } from './pages/FeedPage';
import { LibraryPage } from './pages/LibraryPage';
import { ListsPage } from './pages/ListsPage';
import { LoginPage } from './pages/LoginPage';
import { MediaDetailPage } from './pages/MediaDetailPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { MessagesPage } from './pages/MessagesPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SearchPage } from './pages/SearchPage';

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  if (loading) return <main>Chargement...</main>;
  return user ? children : <Navigate to="/login" />;
}

export function App() {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/" element={<FeedPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/media/:type/:tmdbId" element={<MediaDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/library" element={<PrivateRoute><LibraryPage /></PrivateRoute>} />
        <Route path="/lists" element={<PrivateRoute><ListsPage /></PrivateRoute>} />
        <Route path="/notifications" element={<PrivateRoute><NotificationsPage /></PrivateRoute>} />
        <Route path="/messages" element={<PrivateRoute><MessagesPage /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
        <Route path="/users/:id" element={<ProfilePage />} />
        <Route path="/admin" element={<PrivateRoute><AdminPage /></PrivateRoute>} />
      </Routes>
    </>
  );
}
