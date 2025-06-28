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
  'noda': '1000',      // ✅ Support lowercase from server
  'KLYME_EU': '1001',
  'klyme_eu': '1001',  // ✅ Support lowercase from server
  'KLYME_GB': '1010',
  'klyme_gb': '1010',  // ✅ Support lowercase from server
  'KLYME_DE': '1100',
  'klyme_de': '1100',   // ✅ Support lowercase from server
  'klyme eu': '1001',  // ✅ Support lowercase with space
  'klyme gb': '1010',  // ✅ Support lowercase with space
  'klyme de': '1100',   // ✅ Support lowercase with space
  'KLYME EU': '1001',  // ✅ Support uppercase with space
  'KLYME GB': '1010',  // ✅ Support uppercase with space
  'KLYME DE': '1100'   // ✅ Support uppercase with space
};

// Reverse mapping for internal use
export const ID_TO_GATEWAY_MAP: Record<string, string> = {
  '0001': 'Plisio',
  '0010': 'Rapyd',
  '0100': 'CoinToPay',
  '1000': 'Noda',
  '1001': 'KLYME EU',
  '1010': 'KLYME GB',
  '1100': 'KLYME DE'
};

// Gateway information for UI display (using IDs)
export const GATEWAY_INFO: Record<string, GatewayInfo> = {
  '0001': {
    id: '0001',
    name: 'Plisio',
    displayName: 'Gateway 0001 - Cryptocurrency (Global)',
    description: 'Modern payment infrastructure - ID: 0001',
    features: ['Crypto'],
    color: 'bg-orange-500',
    fee: '10%',
    payout: 'T+5'
  },
  '0010': {
    id: '0010',
    name: 'Rapyd',
    displayName: 'Gateway 0010 - Bank Card (Visa, Master, AmEx, Maestro)',
    description: 'Global payment processing - ID: 0010',
    features: ['Multi-currency'],
    color: 'bg-purple-500',
    fee: '10%',
    payout: 'T+5'
  },
  '0100': {
    id: '0100',
    name: 'CoinToPay',
    displayName: 'Gateway 0100 - Open Banking (EU) + SEPA',
    description: 'Digital payment solutions - ID: 0100',
    features: ['EUR', 'SEPA'],
    color: 'bg-green-500',
    fee: '10%',
    payout: 'T+5'
  },
  '1000': {
    id: '1000',
    name: 'Noda',
    displayName: 'Gateway 1000 - Open Banking (EU)',
    description: 'Modern payment infrastructure - ID: 1000',
    features: ['EUR', 'SEPA'],
    color: 'bg-blue-500',
    fee: '10%',
    payout: 'T+5'
  },
  '1001': {
    id: '1001',
    name: 'KLYME_EU',
    displayName: 'Gateway 1001 - Open Banking (EU) KL',
    description: 'Bank transfer infrastructure - ID: 1001',
    features: ['EUR', 'SEPA'],
    color: 'bg-indigo-500',
    fee: '10%',
    payout: 'T+5'
  },
  '1010': {
    id: '1010',
    name: 'KLYME_GB',
    displayName: 'Gateway 1010 - Open Banking (GB) KL',
    description: 'Bank transfer infrastructure - ID: 1010',
    features: ['GBP', 'SEPA', 'Faster Payments'],
    color: 'bg-cyan-500',
    fee: '10%',
    payout: 'T+5'
  },
  '1100': {
    id: '1100',
    name: 'KLYME_DE',
    displayName: 'Gateway 1100 - Open Banking (DE) KL',
    description: 'Bank transfer infrastructure - ID: 1100',
    features: ['EUR', 'SEPA'],
    color: 'bg-teal-500',
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

// ✅ FIXED: Enhanced conversion function with better error handling and logging
export function convertGatewayNamesToIds(gatewayNames: string[]): string[] {
  if (!Array.isArray(gatewayNames)) {
    console.warn('convertGatewayNamesToIds: Expected array, got:', typeof gatewayNames, gatewayNames);
    return [];
  }
  
  const result = gatewayNames
    .filter(name => name && typeof name === 'string') // Filter out invalid values
    .map(name => {
      const trimmedName = name.trim();
      const id = getGatewayIdFromName(trimmedName);
      console.log('🔍 Converting gateway name to ID:', trimmedName, '->', id); // Debug log
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

// ✅ NEW: Function to safely display gateway name - always returns ID or display name
export function getGatewayDisplayName(gatewayNameOrId: string): string {
  if (!gatewayNameOrId) return '';
  
  // First try to convert name to ID
  const gatewayId = getGatewayIdFromName(gatewayNameOrId);
  
  // If we got an ID, get the display name
  if (gatewayId && GATEWAY_INFO[gatewayId]) {
    return GATEWAY_INFO[gatewayId].displayName;
  }
  
  // If it's already an ID, get the display name
  if (GATEWAY_INFO[gatewayNameOrId]) {
    return GATEWAY_INFO[gatewayNameOrId].displayName;
  }
  
  // Fallback: return the ID if we can convert, otherwise return the original
  return gatewayId || gatewayNameOrId;
}

// ✅ NEW: Function to safely get gateway ID - always returns ID
export function getGatewayIdSafe(gatewayNameOrId: string): string {
  if (!gatewayNameOrId) return '';
  
  // First try to convert name to ID
  const gatewayId = getGatewayIdFromName(gatewayNameOrId);
  
  // If we got a valid ID, return it
  if (gatewayId && GATEWAY_INFO[gatewayId]) {
    return gatewayId;
  }
  
  // If it's already a valid ID, return it
  if (GATEWAY_INFO[gatewayNameOrId]) {
    return gatewayNameOrId;
  }
  
  // Fallback: return the converted ID or original value
  return gatewayId || gatewayNameOrId;
}