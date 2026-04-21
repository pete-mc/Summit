import { TerrainState } from '@/helpers';
import type { TerrainRootState } from '@/types/terrainState';

describe('TerrainState', () => {
  const originalNuxt = window.$nuxt;

  afterEach(() => {
    if (originalNuxt) {
      window.$nuxt = originalNuxt;
      return;
    }

    delete (window as Partial<Window>).$nuxt;
  });

  it('returns one of two profile member IDs based on the selected profile index', () => {
    const state = {
      user: {
        profileIndex: 0,
        profiles: [
          {
            member: { id: 'profile-member-0', name: 'Profile Zero', roles: [] },
            unit: { id: 'unit-0', name: 'Unit Zero', roles: [] },
            group: { id: 'group-0', name: 'Group Zero', roles: [] },
          },
          {
            member: { id: 'profile-member-1', name: 'Profile One', roles: [] },
            unit: { id: 'unit-1', name: 'Unit One', roles: [] },
            group: { id: 'group-1', name: 'Group One', roles: [] },
          },
        ],
      },
    } as unknown as TerrainRootState;

    window.$nuxt = {
      $store: {
        state,
      },
    } as typeof window.$nuxt;

    expect(TerrainState.getProfileMemberID()).toBe('profile-member-0');

    state.user.profileIndex = 1;

    expect(TerrainState.getProfileMemberID()).toBe('profile-member-1');
  });
});