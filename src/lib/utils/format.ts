export const formatUtils = {
  // Format SOL amount with appropriate decimals
  formatSOL: (amount: number | string, decimals: number = 4): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    }).format(num);
  },

  // Format USD amount
  formatUSD: (amount: number | string): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  },

  // Format wallet address with ellipsis
  formatAddress: (address: string, startLength: number = 4, endLength: number = 4): string => {
    if (!address) return '';
    if (address.length <= startLength + endLength) return address;
    return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
  },

  // Format date for transactions
  formatDate: (date: Date | string | number): string => {
    const d = new Date(date);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  },

  // Format percentage change
  formatPercentage: (value: number, includeSign: boolean = true): string => {
    const formatted = Math.abs(value).toFixed(2);
    if (includeSign) {
      return value > 0 ? `+${formatted}%` : `${value < 0 ? '-' : ''}${formatted}%`;
    }
    return `${formatted}%`;
  },

  // Format large numbers with K, M, B suffixes
  formatLargeNumber: (num: number): string => {
    const suffixes = ['', 'K', 'M', 'B', 'T'];
    const magnitude = Math.floor(Math.log10(Math.abs(num)) / 3);
    const scaledNum = num / Math.pow(10, magnitude * 3);
    const suffix = suffixes[magnitude];
    return `${scaledNum.toFixed(2)}${suffix}`;
  },

  // Format time ago
  formatTimeAgo: (date: Date | string | number): string => {
    const now = new Date().getTime();
    const past = new Date(date).getTime();
    const diff = now - past;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 30) return `${days}d ago`;
    return formatUtils.formatDate(date);
  },

  // Format number with appropriate decimals
  formatNumber: (amount: number, decimals: number = 2): string => {
    return amount.toFixed(decimals);
  },
};



