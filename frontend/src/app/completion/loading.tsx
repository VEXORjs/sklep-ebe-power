'use client';

interface LoadingProps {
    message?: string;
    inline?: boolean;
}

export default function Loading({ message, inline = false }: LoadingProps) {
    if (inline) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
                <div style={{
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '2px solid #ffffff',
                    borderRadius: '50%',
                    width: '16px',
                    height: '16px',
                    animation: 'spin 1s linear infinite'
                }} />
                <span>{message || 'Ładowanie...'}</span>
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            fontFamily: 'sans-serif',
            textAlign: 'center',
            padding: '2rem'
        }}>
            <style>{`
            @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
            }
            `}</style>

            <div style={{
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #635bff',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                animation: 'spin 1s linear infinite',
                marginBottom: '1.5rem'
            }} />

            <p style={{ color: '#666', fontSize: '0.9rem', maxWidth: '300px', margin: '0 auto' }}>
                Prosimy nie odświeżać strony i nie klikać przycisku wstecz.
            </p>
        </div>
    );
}