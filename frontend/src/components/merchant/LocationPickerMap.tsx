'use client';

import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icon issue in Next.js
const iconUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png';

const customIcon = new L.Icon({
    iconUrl,
    iconRetinaUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Component to update map center when props change
function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, map.getZoom());
    }, [center, map]);
    return null;
}

interface LocationPickerMapProps {
    latitude: number;
    longitude: number;
    maxDeliveryDistance: number;
    onLocationChange: (lat: number, lng: number) => void;
}

// Component to handle map clicks and drags
function LocationMarker({ latitude, longitude, maxDeliveryDistance, onLocationChange }: { latitude: number, longitude: number, maxDeliveryDistance: number, onLocationChange: (lat: number, lng: number) => void }) {
    const [position, setPosition] = useState<L.LatLng>(new L.LatLng(latitude, longitude));

    const map = useMapEvents({
        click(e) {
            const newPos = e.latlng;
            setPosition(newPos);
            onLocationChange(newPos.lat, newPos.lng);
            map.flyTo(newPos, map.getZoom());
        },
    });

    useEffect(() => {
        setPosition(new L.LatLng(latitude, longitude));
    }, [latitude, longitude]);

    return (
        <>
            <Marker
                position={position}
                draggable={true}
                icon={customIcon}
                eventHandlers={{
                    dragend: (e) => {
                        const marker = e.target;
                        const newPos = marker.getLatLng();
                        setPosition(newPos);
                        onLocationChange(newPos.lat, newPos.lng);
                    },
                }}
            >
                <Popup>Lokasi Toko Anda</Popup>
            </Marker>
            <Circle
                center={position}
                radius={maxDeliveryDistance * 1000} // radius in meters
                pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }}
            />
        </>
    );
}

export default function LocationPickerMap({ latitude, longitude, maxDeliveryDistance, onLocationChange }: LocationPickerMapProps) {
    // Default to Jakarta if no location provided
    const defaultCenter: [number, number] = [-6.2088, 106.8456];
    const center: [number, number] = latitude && longitude ? [latitude, longitude] : defaultCenter;

    return (
        <div className="h-full w-full rounded-xl overflow-hidden z-0">
            <MapContainer
                center={center}
                zoom={13}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapUpdater center={center} />
                <LocationMarker
                    latitude={latitude}
                    longitude={longitude}
                    maxDeliveryDistance={maxDeliveryDistance}
                    onLocationChange={onLocationChange}
                />
            </MapContainer>
        </div>
    );
}
