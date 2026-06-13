import { base44 } from '../api/base44Client';

export async function createCheckout(data = {}) {
    return base44.functions.invoke('createCheckout', data);
}
