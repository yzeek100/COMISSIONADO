
import { Creator, ServiceType } from './types';

export const PLATFORM_FEE_PERCENTAGE = 0.25;

// Dados zerados para o lançamento oficial
export const MOCK_CREATORS: Creator[] = [];

export const SERVICE_PRICES = {
  [ServiceType.VIDEO_CALL]: 100,
  [ServiceType.DIGITAL_CONTENT]: 50,
  [ServiceType.RESERVED_TIME]: 300,
  [ServiceType.TIP]: 20
};
