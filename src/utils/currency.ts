// Utility functions for currency formatting

// List of supported fiat currencies for Intl.NumberFormat
const SUPPORTED_FIAT_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'];

// List of crypto currencies that should be displayed differently
const CRYPTO_CURRENCIES = ['USDT', 'TON', 'BTC', 'ETH', 'LTC', 'BCH', 'DOGE', 'USDC'];

/**
 * Safely format currency amount, handling both fiat and crypto currencies
 */
export function formatCurrency(amount: number, currency: string): string {
  // Handle crypto currencies
  if (CRYPTO_CURRENCIES.includes(currency.toUpperCase())) {
    return `${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8, // Crypto can have more decimal places
    })} ${currency.toUpperCase()}`;
  }

  // Handle fiat currencies
  if (SUPPORTED_FIAT_CURRENCIES.includes(currency.toUpperCase())) {
    try {
      return amount.toLocaleString('en-US', {
        style: 'currency',
        currency: currency.toUpperCase(),
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } catch (error) {
      // Fallback if currency is not supported
      return `${currency.toUpperCase()} ${amount.toFixed(2)}`;
    }
  }

  // Fallback for unknown currencies
  return `${amount.toFixed(2)} ${currency.toUpperCase()}`;
}

/**
 * Format currency for display in tables and lists
 */
export function formatCurrencyCompact(amount: number, currency: string): string {
  if (CRYPTO_CURRENCIES.includes(currency.toUpperCase())) {
    // For crypto, show fewer decimal places in compact view
    return `${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    })} ${currency.toUpperCase()}`;
  }

  return formatCurrency(amount, currency);
}

/**
 * Check if a currency is a cryptocurrency
 */
export function isCryptoCurrency(currency: string): boolean {
  return CRYPTO_CURRENCIES.includes(currency.toUpperCase());
}

/**
 * Check if a currency is a supported fiat currency
 */
export function isFiatCurrency(currency: string): boolean {
  return SUPPORTED_FIAT_CURRENCIES.includes(currency.toUpperCase());
}