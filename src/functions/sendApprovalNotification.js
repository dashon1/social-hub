import { base44 } from '../api/base44Client';

export async function sendApprovalNotification(data = {}) {
    return base44.functions.invoke('sendApprovalNotification', data);
}
