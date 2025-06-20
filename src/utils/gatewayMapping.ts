// Gateway mapping utilities to hide real gateway names from users

export interface GatewayInfo {
  id: string;
  name: string;
  displayName: string;
  description: string;
  features: string[];
  color: string;
  fee: string;
  payout: string;
}

// Gateway ID mapping - users only see IDs, not real names
// ✅ FIXED: Support both cases for server compatibility
export const GATEWAY_ID_MAP: Record<string, string> = {
  'Plisio': '0001',
  'plisio': '0001',    // ✅ Support lowercase from server
  'Rapyd': '0010',
  'rapyd': '0010',     // ✅ Support lowercase from server
  'CoinToPay': '0100',
  'cointopay': '0100', // ✅ Support lowercase from server
  'Noda': '1000',
  'noda': '1000'       // ✅ Support lowercase from server
};

// Reverse mapping for internal use
export const ID_TO_GATEWAY_MAP: Record<string, string> = {
  '0001': 'Plisio',
  '0010': 'Rapyd',
  '0100': 'CoinToPay',
  '1000': 'Noda'
};

// Gateway information for UI display (using IDs)
export const GATEWAY_INFO: Record<string, GatewayInfo> = {
  '0001': {
    id: '0001',
    name: 'Plisio',
    displayName: 'Cryptocurrency (Global)',
    description: 'Modern payment infrastructure - ID: 0001',
    features: ['Crypto'],
    color: 'bg-orange-500',
    fee: '10%',
    payout: 'T+5'
  },
  '0010': {
    id: '0010',
    name: 'Rapyd',
    displayName: 'Bank Card (Visa, Master, AmEx, Maestro)',
    description: 'Global payment processing - ID: 0010',
    features: ['Multi-currency'],
    color: 'bg-purple-500',
    fee: '10%',
    payout: 'T+5'
  },
  '0100': {
    id: '0100',
    name: 'CoinToPay',
    displayName: 'Open Banking (EU) + SEPA',
    description: 'Digital payment solutions - ID: 0100',
    features: ['EUR', 'SEPA'],
    color: 'bg-green-500',
    fee: '10%',
    payout: 'T+5'
  },
  '1000': {
    id: '1000',
    name: 'Noda',
    displayName: 'Open Banking (EU)',
    description: 'Modern payment infrastructure - ID: 1000',
    features: ['EUR', 'SEPA'],
    color: 'bg-blue-500',
    fee: '10%',
    payout: 'T+5'
  }
};

// Utility functions
export function getGatewayIdFromName(gatewayName: string): string {
  if (!gatewayName) return '';
  // ✅ FIXED: Support both exact match and case-insensitive fallback
  return GATEWAY_ID_MAP[gatewayName] || GATEWAY_ID_MAP[gatewayName.toLowerCase()] || gatewayName;
}

export function getGatewayNameFromId(gatewayId: string): string {
  if (!gatewayId) return '';
  return ID_TO_GATEWAY_MAP[gatewayId] || gatewayId;
}

export function getGatewayInfo(gatewayId: string): GatewayInfo | null {
  if (!gatewayId) return null;
  return GATEWAY_INFO[gatewayId] || null;
}

export function getAllGatewayIds(): string[] {
  return Object.keys(GATEWAY_INFO);
}

export function getAllGatewayNames(): string[] {
  return Object.values(ID_TO_GATEWAY_MAP);
}

// Convert gateway names array to IDs array (for API responses)
export function convertGatewayNamesToIds(gatewayNames: string[]): string[] {
  if (!Array.isArray(gatewayNames)) {
    console.warn('convertGatewayNamesToIds: Expected array, got:', typeof gatewayNames, gatewayNames);
    return [];
  }
  
  const result = gatewayNames
    .filter(name => name && typeof name === 'string') // Filter out invalid values
    .map(name => {
      const id = getGatewayIdFromName(name);
      console.log('🔍 Converting gateway name to ID:', name, '->', id); // Debug log
      return id;
    })
    .filter(id => id && id !== ''); // Filter out empty results
  
  console.log('🔍 Final conversion result:', gatewayNames, '->', result); // Debug log
  return result;
}

// Convert gateway IDs array to names array (for API requests)
export function convertGatewayIdsToNames(gatewayIds: string[]): string[] {
  if (!Array.isArray(gatewayIds)) {
    console.warn('convertGatewayIdsToNames: Expected array, got:', typeof gatewayIds, gatewayIds);
    return [];
  }
  
  return gatewayIds
    .filter(id => id && typeof id === 'string') // Filter out invalid values
    .map(id => getGatewayNameFromId(id))
    .filter(name => name); // Filter out empty results
}