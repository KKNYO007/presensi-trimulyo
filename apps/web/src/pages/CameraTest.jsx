import React, { useEffect, useRef, useState } from 'react';

const CameraTest = () => {
    const videoRef = useRef(null);
    const [error, setError] = useState(null);
    const [streamActive, setStreamActive] = useState(false);

    const startCamera = async () => {
        setError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setStreamActive(true);
            }
        } catch (err) {
            console.error(err);
            setError(err.name + ": " + err.message);
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
            setStreamActive(false);
        }
    };

    return (
        <div style={{ padding: 20, textAlign: 'center' }}>
            <h1>Minimal Camera Test</h1>
            {error && <div style={{ color: 'red', margin: 10 }}>{error}</div>}
            <div style={{ margin: 20 }}>
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ width: '100%', maxWidth: 400, background: '#000' }}
                />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button onClick={startCamera}>Start Camera</button>
                <button onClick={stopCamera}>Stop Camera</button>
            </div>
            <p>If this fails, the issue is likely with your Browser or OS/Hardware.</p>
        </div>
    );
};

export default CameraTest;
