"use client";

import { useState, useMemo, useEffect } from "react";
import { geoNaturalEarth1, geoPath, type GeoPermissibleObjects } from "d3-geo";
import { interpolateYlOrRd } from "d3-scale-chromatic";
import type { TrendMapPoint } from "@/types/trend";

interface GlobalTrendMapProps {
  data: TrendMapPoint[];
  onRegionClick?: (region: string) => void;
}

interface TopoJSON {
  type: string;
  objects: {
    countries: {
      type: string;
      geometries: any[];
    };
  };
  arcs: number[][][];
}

// Minimal TopoJSON to GeoJSON conversion
function topoToGeo(topology: TopoJSON): GeoJSON.FeatureCollection {
  const { objects, arcs } = topology;
  const geometries = objects.countries.geometries;

  function decodeArc(arcIndex: number): number[][] {
    const reversed = arcIndex < 0;
    const arc = arcs[reversed ? ~arcIndex : arcIndex];
    const coords: number[][] = [];
    let x = 0, y = 0;
    for (const [dx, dy] of arc) {
      x += dx;
      y += dy;
      coords.push([x, y]);
    }
    if (reversed) coords.reverse();
    return coords;
  }

  function decodeRing(indices: number[]): number[][] {
    const coords: number[][] = [];
    for (const idx of indices) {
      const arc = decodeArc(idx);
      coords.push(...(coords.length > 0 ? arc.slice(1) : arc));
    }
    return coords;
  }

  const transform = (topology as any).transform;
  function transformPoint(point: number[]): number[] {
    if (!transform) return point;
    return [
      point[0] * transform.scale[0] + transform.translate[0],
      point[1] * transform.scale[1] + transform.translate[1],
    ];
  }

  const features: GeoJSON.Feature[] = geometries.map((geom: any) => {
    let geometry: GeoJSON.Geometry;

    if (geom.type === "Polygon") {
      const rings = geom.arcs.map((ring: number[]) =>
        decodeRing(ring).map(transformPoint)
      );
      geometry = { type: "Polygon", coordinates: rings };
    } else if (geom.type === "MultiPolygon") {
      const polygons = geom.arcs.map((polygon: number[][]) =>
        polygon.map((ring: number[]) => decodeRing(ring).map(transformPoint))
      );
      geometry = { type: "MultiPolygon", coordinates: polygons };
    } else {
      geometry = { type: "Point", coordinates: [0, 0] };
    }

    return {
      type: "Feature" as const,
      id: geom.id,
      properties: geom.properties || {},
      geometry,
    };
  });

  return { type: "FeatureCollection", features };
}

// ISO numeric to ISO alpha-2 mapping (common countries)
const numericToAlpha2: Record<string, string> = {
  "840": "US", "826": "GB", "410": "KR", "392": "JP", "156": "CN",
  "356": "IN", "250": "FR", "276": "DE", "076": "BR", "124": "CA",
  "036": "AU", "380": "IT", "724": "ES", "484": "MX", "360": "ID",
  "764": "TH", "702": "SG", "458": "MY", "608": "PH", "704": "VN",
  "158": "TW", "643": "RU", "710": "ZA", "818": "EG", "566": "NG",
  "682": "SA", "784": "AE", "792": "TR", "616": "PL", "528": "NL",
  "752": "SE", "578": "NO", "208": "DK", "246": "FI", "756": "CH",
  "040": "AT", "056": "BE", "620": "PT", "300": "GR", "203": "CZ",
  "032": "AR", "170": "CO", "152": "CL", "604": "PE",
};

export default function GlobalTrendMap({ data, onRegionClick }: GlobalTrendMapProps) {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: TrendMapPoint } | null>(null);
  const [geoData, setGeoData] = useState<GeoJSON.FeatureCollection | null>(null);

  useEffect(() => {
    fetch("/geo/world-110m.json")
      .then((res) => res.json())
      .then((topo: TopoJSON) => {
        setGeoData(topoToGeo(topo));
      })
      .catch(() => {
        // Fallback: render without map data
      });
  }, []);

  const regionScores = useMemo(() => {
    const scores: Record<string, TrendMapPoint> = {};
    for (const d of data) {
      scores[d.region] = d;
    }
    return scores;
  }, [data]);

  const maxScore = useMemo(() => {
    return Math.max(...data.map((d) => d.avg_score), 1);
  }, [data]);

  const projection = geoNaturalEarth1()
    .scale(160)
    .translate([480, 260]);

  const pathGenerator = geoPath().projection(projection);

  const getColor = (regionId: string) => {
    const alpha2 = numericToAlpha2[regionId] || regionId;
    const point = regionScores[alpha2];
    if (!point) return "#1e293b";
    const intensity = point.avg_score / maxScore;
    return interpolateYlOrRd(0.2 + intensity * 0.7);
  };

  const handleMouseMove = (e: React.MouseEvent, regionId: string) => {
    const alpha2 = numericToAlpha2[regionId] || regionId;
    const point = regionScores[alpha2];
    if (point) {
      setTooltip({ x: e.clientX, y: e.clientY, data: point });
    }
    setHoveredRegion(regionId);
  };

  return (
    <div className="relative rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          Global Beauty Trend Intensity
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted">
          <span>Low</span>
          <div className="flex h-2 w-24 overflow-hidden rounded-full">
            {[0.2, 0.35, 0.5, 0.65, 0.8].map((v, i) => (
              <div
                key={i}
                className="flex-1"
                style={{ backgroundColor: interpolateYlOrRd(v) }}
              />
            ))}
          </div>
          <span>High</span>
        </div>
      </div>

      <svg viewBox="0 0 960 520" className="w-full" style={{ background: "#0a0b14" }}>
        {geoData ? (
          geoData.features.map((feature, i) => {
            const regionId = String(feature.id || i);
            const path = pathGenerator(feature as GeoPermissibleObjects);
            if (!path) return null;

            return (
              <path
                key={regionId}
                d={path}
                fill={getColor(regionId)}
                stroke="#0a0b14"
                strokeWidth={0.5}
                opacity={hoveredRegion === regionId ? 1 : 0.85}
                className="cursor-pointer transition-opacity"
                onMouseMove={(e) => handleMouseMove(e, regionId)}
                onMouseLeave={() => {
                  setHoveredRegion(null);
                  setTooltip(null);
                }}
                onClick={() => {
                  const alpha2 = numericToAlpha2[regionId] || regionId;
                  onRegionClick?.(alpha2);
                }}
              />
            );
          })
        ) : (
          <text x="480" y="260" textAnchor="middle" fill="#64748b" fontSize="14">
            Loading map data...
          </text>
        )}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 rounded-lg border border-border bg-card p-3 shadow-xl"
          style={{ left: tooltip.x + 12, top: tooltip.y - 10 }}
        >
          <p className="text-xs font-bold text-foreground">
            {tooltip.data.region}
          </p>
          <p className="text-xs text-muted">
            Score: {tooltip.data.avg_score.toFixed(1)} | Volume:{" "}
            {tooltip.data.total_volume.toLocaleString()}
          </p>
          <div className="mt-1 flex flex-wrap gap-1">
            {tooltip.data.top_keywords.slice(0, 3).map((kw) => (
              <span
                key={kw}
                className="rounded bg-accent/20 px-1.5 py-0.5 text-[10px] text-accent-light"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
