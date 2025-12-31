export interface PlantAnalysisResult {
  id: string;
  date: string;
  imageUrl?: string; // Optional for storage optimization
  userNotes?: string; // User custom notes
  isPlant: boolean;
  diagnosis: string;
  scientificName?: string;
  confidence: number;
  description: string;
  symptoms: string[];
  causes: string[];
  nutritionalDeficiencies?: { name: string; solution: string }[];
  treatment: {
    biological: string[];
    chemical: string[];
    prevention: string[];
  };
  cultureInfo?: {
    commonName: string;
    scientificName: string;
    family: string;
    description: string;
    idealConditions: {
      description: string;
      soil: string;
      ph: string;
      humidity: string;
    };
    commonPests: string[];
    commonDiseases: string[];
  };
}

export interface AnalysisError {
  message: string;
}