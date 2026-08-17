export default function MapEmbed({ address, location }) {
  const query = location ? `${location.lat},${location.lng}` : address;
  const zoom = location ? 16 : 14;
  const src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=${zoom}&output=embed`;

  return (
    <iframe
      title="Business location on map"
      src={src}
      className="w-full h-64 rounded-xl border border-gray-200"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
    />
  );
}
