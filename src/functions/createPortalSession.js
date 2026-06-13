import { base44 } from '../api/base44Client';

export async function createPortalSession(data = {}) {
    return base44.functions.invoke('createPortalSession', data);
}
