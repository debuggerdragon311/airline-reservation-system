import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Flights from './pages/Flights'

export default function App() {
    // CRITIQUE FIX: Changed from localStorage to sessionStorage per architecture guidelines
    const isAuthenticated = !!sessionStorage.getItem('token')

    return (
        <BrowserRouter>
            <Routes>

                {/* DEFAULT LANDING PAGE:
            If logged in -> redirect to flights dashboard.
            If not logged in -> load your default animated Login view.
        */}
                <Route
                    path="/"
                    element={
                        isAuthenticated ? <Navigate to="/flights" replace /> : <Login />
                    }
                />

                {/* EXPLICIT LOGIN ROUTE */}
                <Route
                    path="/login"
                    element={
                        isAuthenticated ? <Navigate to="/flights" replace /> : <Login />
                    }
                />

                {/* CRITIQUE FIX: PUBLIC ROUTE
            Removed the authentication guard check entirely.
            Unauthenticated guest users can now directly access and search flights.
        */}
                <Route
                    path="/flights"
                    element={<Flights />}
                />

                {/* CATCH-ALL ROUTE (404 Handling):
            If they hit a broken URL link, route them cleanly back to the home base path.
        */}
                <Route
                    path="*"
                    element={<Navigate to="/" replace />}
                />

            </Routes>
        </BrowserRouter>
    )
}