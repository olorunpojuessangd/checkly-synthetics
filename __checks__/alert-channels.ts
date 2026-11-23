import { EmailAlertChannel } from 'checkly/constructs';

export const emailChannel = new EmailAlertChannel('raccoon-email-alerts', {
  address: 'raccoon@checklyhq.com',
});