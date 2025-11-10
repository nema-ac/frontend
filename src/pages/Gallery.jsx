import { useState, useEffect } from 'react';
import nemaService from '../services/nema.js';
import GalleryCard from '../components/GalleryCard.jsx';

const Gallery = () => {
    const [nemas, setNemas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [total, setTotal] = useState(0);

    useEffect(() => {
        fetchGallery();
    }, []);

    const fetchGallery = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await nemaService.getGallery();
            setNemas(data.nemas || []);
            setTotal(data.total || 0);
        } catch (err) {
            setError('Failed to load gallery: ' + err.message);
            console.error('Gallery fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-14 pb-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nema-cyan mx-auto mb-4"></div>
                            <p className="text-nema-gray-darker font-anonymous">Loading gallery...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen pt-14 pb-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="text-center">
                            <p className="text-red-400 font-anonymous mb-4">{error}</p>
                            <button
                                onClick={fetchGallery}
                                className="nema-button px-6 py-2"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-14 pb-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                {/* Header */}
                <div className="mb-8 pt-4">
                    <h1 className="nema-display nema-display-1 text-nema-cyan mb-2">
                        GALLERY
                    </h1>
                    <p className="text-nema-gray-darker font-anonymous text-sm">
                        Discover {total} {total === 1 ? 'Nema' : 'Nemas'} in the ecosystem
                    </p>
                </div>

                {/* Gallery Grid */}
                {nemas.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-nema-gray-darker font-anonymous">
                            No nemas found in the gallery yet.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {nemas.map((nema) => (
                            <GalleryCard key={nema.nema_id} nema={nema} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Gallery;

