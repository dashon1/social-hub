import { base44 } from '../api/base44Client';

export async function publishToBlotato(data = {}) {
    return base44.functions.invoke('publishToBlotato', data);
}
