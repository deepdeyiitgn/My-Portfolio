import FeaturePageTemplate from '../FeaturePageTemplate';

export default function FeatureContentDensity() {
  return (
    <FeaturePageTemplate
      content={{
        title: 'Feature Content Density',
        route: '/feature/feature-content-density',
        category: 'Content Strategy',
        summary: 'Feature Content Density is a high-detail custom TSX feature page focused on architecture clarity, visual communication, and animation-led readability for complex implementation layers.',
        description: 'Feature Content Density documents workflows, diagrams, implementation points, and visualization metrics so contributors can understand intent, execution sequence, and quality outcomes quickly.',
        keywords: 'feature content density, deep dey feature, architecture, workflow, diagrams, visualization',
        schemaType: 'TechArticle',
        workflow: [
          'Discover requirements and map the exact user-facing objective before implementation.',
          'Design section hierarchy for hero, workflow, SVG diagram, visualization panels, and implementation notes.',
          'Implement animated page blocks using motion transitions with predictable rendering behavior.',
          'Validate visual structure, summary clarity, and route-level SEO metadata consistency.',
          'Ship with stable back-navigation to the main feature page for user orientation.'
        ],
        highlights: [
          'Feature Content Density includes structured point-wise communication for high-density reading.',
          'Inline SVG architecture representation gives immediate system context.',
          'Animation transitions are content-first and readability-preserving.',
          'Section sequencing supports quick scanning and deep inspection modes.',
          'Route-level SEO tags and Schema.org JSON-LD are embedded on-page.'
        ],
        implementationPoints: [
          'Use shared feature page template to keep style and accessibility consistent.',
          'Keep this TSX page independent so custom blocks can be added later without touching other pages.',
          'Maintain explicit route in App.tsx to follow manual feature page registration flow.',
          'Add/adjust this page entry in feature-links.json so it appears on the feature index.',
          'Preserve top and bottom Back to Feature Page actions for navigation continuity.'
        ],
        visualizations: [
          {
            title: 'Feature Content Density Coverage Panel',
            metric: '98% Narrative Coverage',
            detail: 'Covers architecture, workflow, implementation, and operational perspective in one continuous page.'
          },
          {
            title: 'Feature Content Density Stability Panel',
            metric: 'Low Navigation Friction',
            detail: 'Dedicated return actions and structured sections keep movement and comprehension predictable.'
          }
        ],
        diagramNodes: [
          { id: 'REQ', label: 'Requirements', x: 90, y: 90 },
          { id: 'PLAN', label: 'Design', x: 230, y: 170 },
          { id: 'UI', label: 'TSX Page', x: 360, y: 90 },
          { id: 'SEO', label: 'Metadata', x: 500, y: 170 },
          { id: 'QA', label: 'Validation', x: 620, y: 90 }
        ]
      }}
    />
  );
}
