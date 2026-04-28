import { TerrainState } from '@/helpers';

type TerrainStateOverrides = {
  token?: string;
  unitId?: string;
  memberId?: string;
};

export function mockTerrainState(overrides: TerrainStateOverrides = {}): jest.SpyInstance[] {
  const { token = 'Bearer test-token', unitId = 'unit-123', memberId = 'member-456' } = overrides;

  const tokenSpy = jest.spyOn(TerrainState, 'getToken').mockReturnValue(token);
  const unitIdSpy = jest.spyOn(TerrainState, 'getUnitID').mockReturnValue(unitId);
  const memberIdSpy = jest.spyOn(TerrainState, 'getMemberID').mockReturnValue(memberId);

  return [tokenSpy, unitIdSpy, memberIdSpy];
}

export function restoreTerrainState(spies: jest.SpyInstance[]): void {
  spies.forEach((spy) => spy.mockRestore());
}
