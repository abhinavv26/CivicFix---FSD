import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import CategoryBadge from '../common/CategoryBadge';
import { ExternalLink, ThumbsUp } from 'lucide-react';

// Create custom colored markers using SVG data URIs
const createCustomPin = (status) => {
  let color = '#D97706'; // Reported (amber)
  if (status === 'Assigned') color = '#2563EB';
  if (status === 'In Progress') color = '#7C3AED';
  if (status === 'Resolved') color = '#059669';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="28" height="42">
    <path fill="${color}" stroke="#FFFFFF" stroke-width="1.5" d="M12 0C5.37 0 0 5.37 0 12c0 9 12 24 12 24s12-15 12-24c0-6.63-5.37-12-12-12zm0 17a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"/>
  </svg>`;

  return L.divIcon({
    className: 'custom-leaflet-pin',
    html: svg,
    iconSize: [28, 42],
    iconAnchor: [14, 42],
    popupAnchor: [0, -38],
  });
};

export const InteractiveMap = ({
  issues = [],
  center = [19.076, 72.8777],
  zoom = 11,
  selectedIssueId,
  onMarkerClick,
}) => {
  return (
    <div className="w-full h-full rounded-2xl overflow-hidden shadow-inner border border-sand-300 dark:border-charcoal-700 relative z-0">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full min-h-[450px]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {issues.map((issue) => {
          if (
            !issue.location ||
            !issue.location.coordinates ||
            issue.location.coordinates.length < 2
          ) {
            return null;
          }

          // GeoJSON order: [lng, lat] -> Leaflet order: [lat, lng]
          const [lng, lat] = issue.location.coordinates;
          const pinIcon = createCustomPin(issue.status);

          return (
            <Marker
              key={issue._id}
              position={[lat, lng]}
              icon={pinIcon}
              eventHandlers={{
                click: () => onMarkerClick && onMarkerClick(issue),
              }}
            >
              <Popup className="civicfix-popup">
                <div className="p-1 max-w-[220px]">
                  {issue.images && issue.images[0] && (
                    <img
                      src={issue.images[0]}
                      alt={issue.title}
                      className="w-full h-24 object-cover rounded-lg mb-2"
                    />
                  )}
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <CategoryBadge category={issue.category} />
                    <StatusBadge status={issue.status} size="xs" />
                  </div>
                  <h4 className="text-xs font-semibold text-charcoal-900 leading-snug line-clamp-2">
                    {issue.title}
                  </h4>
                  <p className="text-[11px] text-charcoal-500 mt-1 line-clamp-1">
                    {issue.address}
                  </p>
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1 text-charcoal-600 font-medium">
                      <ThumbsUp className="w-3 h-3 text-brand-600" />
                      {issue.upvotes?.length || 0}
                    </span>
                    <Link
                      to={`/issues/${issue._id}`}
                      className="inline-flex items-center gap-1 text-brand-700 font-semibold hover:underline"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default InteractiveMap;
