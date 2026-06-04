import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Flights from './pages/Flights'

export default function App() {
    // Check if the user has a token saved in their browser
    const isAuthenticated = !!localStorage.getItem('token')

    return (
        <BrowserRouter>
            <Routes>

                {/* DEFAULT LANDING PAGE:
            If logged in -> go straight to Flights.
            If not logged in -> show the Login page.
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

                {/* PROTECTED ROUTE: FLIGHTS DASHBOARD
            If logged in -> show Flights.
            If not logged in -> kick them back to Login.
        */}
                <Route
                    path="/flights"
                    element={
                        isAuthenticated ? <Flights /> : <Navigate to="/login" replace />
                    }
                />

                {/* CATCH-ALL ROUTE (404 Handling):
            If they type a random URL like localhost:5173/potato, send them home.
        */}
                <Route
                    path="*"
                    element={<Navigate to="/" replace />}
                />

            </Routes>
        </BrowserRouter>
    )
}