export function log(...args: unknown[]): void {
  // Use console under the hood; centralized for easier control
  // In production you can route this to native logging/analytics
  // Only important events should call this to avoid noise

  console.log('[VintageVendor]', ...args);
}
