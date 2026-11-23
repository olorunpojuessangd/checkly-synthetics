import { AlertEscalationBuilder, CheckGroupV2, Frequency } from 'checkly/constructs';
import { emailChannel } from '../alert-channels';

export const playwrightGroup = new CheckGroupV2('playwright-checks-group', {
  name: 'Playwright Checks',
  activated: true,
  frequency: Frequency.EVERY_1H,
  locations: ['us-east-1', 'eu-west-1'],
  // Required for the group's alert channels to apply to its checks
  alertEscalationPolicy: AlertEscalationBuilder.runBasedEscalation(1),
  alertChannels: [emailChannel],
  browserChecks: {
    // Every .spec.ts file in THIS folder becomes a browser check in this group
    testMatch: './*.spec.ts',
  },
});