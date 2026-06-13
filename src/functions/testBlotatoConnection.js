import { base44 } from '../api/base44Client';

export async function testBlotatoConnection(data = {}) {
    return base44.functions.invoke('testBlotatoConnection', data);
}
