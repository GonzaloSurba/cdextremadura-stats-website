/* https://css-loaders.com */
import './Loader.css';

export default function Loader() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center" role="status" aria-live="polite">
            <div className="loader"></div>
            <span className="sr-only">Cargando contenido...</span>
        </div>
    )
}