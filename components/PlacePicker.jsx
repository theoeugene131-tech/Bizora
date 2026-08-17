"use client";

import { useEffect, useRef, useState } from "react";

const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export default function PlacePicker({ onSelect, countryCode = "ng" }) {
  const inputRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!KEY) return;
    if (window.google?.maps?.places) {
      setLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${KEY}&libraries=places`;
    script.onload = () => setLoaded(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!loaded || !inputRef.current) return;
    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: countryCode },
    });
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place.geometry?.location) {
        const result = {
          name: place.name,
          address: place.formatted_address,
          placeId: place.place_id,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        setSelected(result);
        onSelect?.(result);
      }
    });
  }, [loaded, countryCode, onSelect]);

  return (
    <div>
      <input
        ref={inputRef}
        placeholder="Search Google Maps for the business location..."
        className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
      />
      {selected && (
        <p className="text-sm text-green-700 mt-2">
          ✔ {selected.address} ({selected.lat.toFixed(5)}, {selected.lng.toFixed(5)})
        </p>
      )}
      {!KEY && (
        <p className="text-xs text-gray-400 mt-1">
          Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local to enable this.
        </p>
      )}
    </div>
  );
}
