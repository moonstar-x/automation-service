export const ALL_METRICS = ['visitors', 'pageviews', 'bounce_rate', 'visit_duration', 'events', 'visits'] as const;

export type MetricKey = typeof ALL_METRICS[number];

export interface MetricValue {
  value: number
  change: number
}

export type Stats = {
  [k in MetricKey]: MetricValue;
};

export type Breakdown<P extends string> = {
  [k in MetricKey]: number | null
} & {
  [k in P]: string
}

export interface FullBreakdown {
  top_pages: Breakdown<'page'>[]
  top_sources: Breakdown<'source'>[]
  top_countries: Breakdown<'country'>[]
  top_devices: Breakdown<'device'>[]
}
