"use client";

import { useEffect, useRef } from "react";
import type { PartnerListItem } from "@ioma/types";

interface PartnerLocatorMapProps {
  partners: PartnerListItem[];
  selectedPartner: PartnerListItem | null;
  onSelectPartner: (partner: PartnerListItem) => void;
  userLocation: { lat: number; lng: number } | null;
}

export function PartnerLocatorMap({
  partners,
  selectedPartner,
  onSelectPartner,
  userLocation,
}: PartnerLocatorMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const markersRef = useRef<unknown[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Dynamic import of Leaflet (only on client side)
    const initMap = async () => {
      const L = (await import("leaflet")).default;

      // Center on Dubai by default
      const center: [number, number] = userLocation
        ? [userLocation.lat, userLocation.lng]
        : [25.2048, 55.2708];

      if (!mapInstanceRef.current) {
        const map = L.map(mapRef.current!, {
          center,
          zoom: 11,
          scrollWheelZoom: false,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        mapInstanceRef.current = map;
      }

      // Clear old markers
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      markersRef.current.forEach((m: any) => m.remove());
      markersRef.current = [];

      // Add markers for each partner
      partners.forEach((partner) => {
        if (!partner.coordinates) return;

        const marker = L.marker([partner.coordinates.lat, partner.coordinates.lng])
          .addTo(mapInstanceRef.current as L.Map)
          .bindPopup(
            `<div>
              <p style="font-weight:600;margin:0 0 4px">${partner.name}</p>
              <p style="font-size:12px;color:#666;margin:0">${partner.city} — ${partner.type}</p>
            </div>`,
          )
          .on("click", () => onSelectPartner(partner));

        markersRef.current.push(marker);
      });

      // Fit bounds if partners exist
      if (partners.length > 0) {
        const bounds = L.latLngBounds(
          partners
            .filter((p) => p.coordinates)
            .map((p) => [p.coordinates.lat, p.coordinates.lng] as [number, number]),
        );
        (mapInstanceRef.current as L.Map).fitBounds(bounds, { padding: [40, 40] });
      }
    };

    initMap();
  }, [partners, onSelectPartner, userLocation]);

  // Update map center when user location changes
  useEffect(() => {
    if (userLocation && mapInstanceRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mapInstanceRef.current as any).setView([userLocation.lat, userLocation.lng], 11);
    }
  }, [userLocation]);

  // Highlight selected partner
  useEffect(() => {
    if (!selectedPartner || !mapInstanceRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (mapInstanceRef.current as any).setView(
      [selectedPartner.coordinates.lat, selectedPartner.coordinates.lng],
      14,
    );
  }, [selectedPartner]);

  return <div ref={mapRef} className="w-full h-full" />;
}
