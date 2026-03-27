export type AnalyticsTarget = 'umami' | 'ga4' | 'both';

export type AnalyticsEventName =
  | 'toc_click'
  | 'copy_code'
  | 'open_search'
  | 'click_cover'
  | 'read_related_post'
  | 'outbound_link'
  | 'subscribe'
  | 'generate_lead'
  | 'download_file'
  | 'sign_up';

export interface AnalyticsEventDefinition {
  target: AnalyticsTarget;
  category: 'content' | 'engagement' | 'conversion' | 'acquisition';
  description: string;
}

export const ANALYTICS_EVENT_REGISTRY: Record<AnalyticsEventName, AnalyticsEventDefinition> = {
  toc_click: {
    target: 'umami',
    category: 'content',
    description: 'Reader clicked a table-of-contents item.',
  },
  copy_code: {
    target: 'umami',
    category: 'engagement',
    description: 'Reader copied code from an article.',
  },
  open_search: {
    target: 'umami',
    category: 'engagement',
    description: 'Reader opened site search.',
  },
  click_cover: {
    target: 'umami',
    category: 'content',
    description: 'Reader clicked an article cover image.',
  },
  read_related_post: {
    target: 'umami',
    category: 'content',
    description: 'Reader opened a related article.',
  },
  outbound_link: {
    target: 'both',
    category: 'engagement',
    description: 'Reader clicked an outbound link.',
  },
  subscribe: {
    target: 'ga4',
    category: 'conversion',
    description: 'Reader completed a subscription action.',
  },
  generate_lead: {
    target: 'ga4',
    category: 'conversion',
    description: 'Reader completed a lead-generation action.',
  },
  download_file: {
    target: 'ga4',
    category: 'conversion',
    description: 'Reader downloaded a file.',
  },
  sign_up: {
    target: 'ga4',
    category: 'conversion',
    description: 'Reader completed a sign-up action.',
  },
};
