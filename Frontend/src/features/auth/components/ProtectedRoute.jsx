import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import "../styles/ProtectedRoute.css";



const ProtectedRoute = ({ children, allowedRoles }) => {
    const { loading, user } = useAuth();


    if (loading) {
        return (
            <main className="auth-page-container">
                <div className="auth-wrapper">
                    <h1 className="auth-title">Loading...</h1>
                </div>
            </main>
        )
    }


    if (!user) {
        return <Navigate to="/login" replace />
    }

    if (allowedRoles && Array.isArray(allowedRoles)) {
        const isAllowed = allowedRoles.includes(user.role) || user.isAdmin;
        if (!isAllowed) {
            return <Navigate to="/" replace />;
        }
    } else {
        if (!user.isAdmin && user.role !== "admin") {
            return <Navigate to="/" replace />;
        }
    }
    return children;
}



export default ProtectedRoute;