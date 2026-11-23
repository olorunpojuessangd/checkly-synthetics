import * as fs from 'fs';
import * as path from 'path';
import { ApiCheck, AssertionBuilder, CheckGroupV2, Frequency } from 'checkly/constructs';

type User = { id: number; name: string; profile_url: string };

// Read the users from users.json, which sits next to this file
const { users } = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'users.json'), 'utf-8'),
) as { users: User[] };

export const apiGroup = new CheckGroupV2('user-api-checks-group', {
  name: 'User API Checks',
  activated: true,
  frequency: Frequency.EVERY_10M,
  locations: ['us-east-1', 'eu-west-1'],
});

// Reusable: give it any user and a group, and it creates an API check for that user
export function createUserApiCheck(user: User, group: CheckGroupV2) {
  return new ApiCheck(`user-api-check-${user.id}`, {
    name: `User API: ${user.name} (id ${user.id})`,
    group,
    degradedResponseTime: 10000,
    maxResponseTime: 30000, // the API host can be slow to wake up
    request: {
      method: 'GET',
      url: user.profile_url,
      headers: [{ key: 'Authorization', value: 'Bearer {{API_TOKEN}}' }],
      assertions: [
        AssertionBuilder.statusCode().equals(200),
        AssertionBuilder.jsonBody('$.id').equals(user.id),
        AssertionBuilder.jsonBody('$.name').equals(user.name),
      ],
    },
  });
}

// One check per user in the JSON file
users.forEach((user) => createUserApiCheck(user, apiGroup));