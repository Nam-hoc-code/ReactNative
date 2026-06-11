import AsyncStorage from '@react-native-async-storage/async-storage';

const GUEST_KEY = 'opencode_guest_id';

let cachedId: number | null = null;

export async function getGuestId(): Promise<number> {
  if (cachedId !== null) return cachedId;
  const stored = await AsyncStorage.getItem(GUEST_KEY);
  if (stored) {
    cachedId = parseInt(stored, 10);
    return cachedId;
  }
  const newId = -Math.floor(Math.random() * 1_000_000) - 1;
  await AsyncStorage.setItem(GUEST_KEY, String(newId));
  cachedId = newId;
  return cachedId;
}

export async function resetGuestId() {
  cachedId = null;
  await AsyncStorage.removeItem(GUEST_KEY);
}
