import type { FunnelRes, Root } from '../../models/theme.classic.blocks';

const baseUrl = "https://backend.dev.baseet.co/api/funnels/";

const headers = {
  'Accept': 'application/json',
  'Accept-Language': 'ar',
  'App-Version': '11',
  'Device-Name': 'iphone 11 pro',
  'Device-OS-Version': '13',
  'Device-UDID': '1234',
  'Device-Push-Token': '123456',
  'Device-Type': 'web',
  'country-code': 'EG'
};

export async function getFunnelPage(id: number): Promise<Root> {
  const res = await fetch(`${baseUrl}${id}`, { headers });
  if (!res.ok) throw new Error("Failed to fetch funnel page");
  return await res.json();
} 