// Tipos para sistema Computer Vision Edge
export interface CVDetectionResult {
  id: string;
  type: 'count' | 'damage' | 'label' | 'barcode' | 'quality';
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  metadata: Record<string, any>;
}

export interface CVCountingResult {
  sessionId: string;
  imageUrl: string;
  detectedItems: CVDetectionResult[];
  totalCount: number;
  confidence: number;
  processingTimeMs: number;
  algorithm: string;
}

export interface CVDamageDetection {
  sessionId: string;
  imageUrl: string;
  damageAreas: Array<{
    type: 'scratch' | 'dent' | 'tear' | 'stain' | 'crack';
    severity: 'low' | 'medium' | 'high' | 'critical';
    boundingBox: CVDetectionResult['boundingBox'];
    confidence: number;
  }>;
  overallCondition: 'excellent' | 'good' | 'fair' | 'poor' | 'damaged';
  processingTimeMs: number;
}

export interface CVLabelReading {
  sessionId: string;
  imageUrl: string;
  extractedText: string;
  detectedBarcodes: Array<{
    type: 'qr' | 'code128' | 'ean13' | 'code39';
    value: string;
    confidence: number;
    boundingBox: CVDetectionResult['boundingBox'];
  }>;
  extractedData: Record<string, string>;
  confidence: number;
  processingTimeMs: number;
}

export interface CVProcessingSession {
  id: string;
  type: 'receiving' | 'packing' | 'quality' | 'damage';
  startTime: number;
  endTime?: number;
  status: 'processing' | 'completed' | 'failed' | 'cancelled';
  results: CVCountingResult | CVDamageDetection | CVLabelReading | null;
  userId: string;
  productId?: string;
  orderId?: string;
  warehouseId: string;
}

export interface CVConfiguration {
  countingEnabled: boolean;
  damageDetectionEnabled: boolean;
  labelReadingEnabled: boolean;
  minimumConfidence: number;
  maxProcessingTimeMs: number;
  algorithms: {
    counting: 'yolo' | 'rcnn' | 'ssd';
    damage: 'cnn' | 'segmentation' | 'anomaly';
    ocr: 'tesseract' | 'paddle' | 'easyocr';
  };
}