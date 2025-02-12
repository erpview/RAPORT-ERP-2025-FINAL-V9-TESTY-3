import { System } from './system';

export interface SystemDetailProps {
  systemId: string;
}

export interface SystemDetailData extends System {
  description: string;
  features?: string[];
  targetIndustries?: string[];
  implementationTime?: string;
  pricing?: {
    model: string;
    range?: string;
  };
}

export interface SystemDetailState {
  system: SystemDetailData | null;
  loading: boolean;
  error: string | null;
}
