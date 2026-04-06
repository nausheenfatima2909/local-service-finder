
import { SERVICE_CATEGORIES } from './data/categories';

// Backward-compatible exports (the app now pulls from `data/` directly).
export const CATEGORIES = SERVICE_CATEGORIES.map(({ unsplashKeyword, ...rest }) => rest);

export { MOCK_PROVIDERS, MOCK_BOOKINGS, MOCK_USERS } from './data/mockData';
