import { useNavigate } from 'react-router-dom';
import '../styles/404NotFound.css';

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <div className="not-found-container">
            <div className="not-found-content">
                <h1 className="not-found-title">404</h1>
                <h2 className="not-found-subtitle">Page Not Found</h2>
                <p className="not-found-text">
                    Oops! The page you are looking for does not exist or requires a valid table QR token.
                </p>
                <button className="not-found-button" onClick={() => navigate('/')}>
                    Go to Homepage
                </button>
            </div>
        </div>
    );
};

export default NotFoundPage;
