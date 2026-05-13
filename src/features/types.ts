export interface FeatureLogo {
  symbol: string;
  accent: string;
  background: string;
}

export interface FeatureDiagramNode {
  id: string;
  label: string;
  detail: string;
}

export interface FeatureDiagramEdge {
  from: string;
  to: string;
  label: string;
}

export interface FeatureVisualization {
  title: string;
  summary: string;
  points: string[];
}

export interface FeatureFaq {
  question: string;
  answer: string;
}

export interface FeatureDoc {
  slug: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  logo: FeatureLogo;
  narrative: string[];
  keyPoints: string[];
  workflow: string[];
  architectureLayers: string[];
  implementationNotes: string[];
  qualityChecks: string[];
  risks: string[];
  roadmap: string[];
  visualizations: FeatureVisualization[];
  diagram: {
    title: string;
    nodes: FeatureDiagramNode[];
    edges: FeatureDiagramEdge[];
  };
  faqs: FeatureFaq[];
}
