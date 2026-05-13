export interface FeatureListItem {
  title: string;
  summary: string;
  link: string;
}

export interface FeatureDiagramNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface FeatureVisualization {
  title: string;
  metric: string;
  detail: string;
}

export interface FeaturePageContent {
  title: string;
  route: string;
  description: string;
  keywords: string;
  category: string;
  summary: string;
  schemaType?: 'TechArticle' | 'WebPage' | 'Article';
  workflow: string[];
  highlights: string[];
  implementationPoints: string[];
  visualizations: FeatureVisualization[];
  diagramNodes: FeatureDiagramNode[];
}
