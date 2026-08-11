const DISABLED_VALUES = new Set(["0", "false", "off", "disabled"]);

export function isExternalDiscoveryEnabled(): boolean {
  const value = process.env.PAPERWORDS_EXTERNAL_DISCOVERY_ENABLED?.trim().toLowerCase();
  return !value || !DISABLED_VALUES.has(value);
}
