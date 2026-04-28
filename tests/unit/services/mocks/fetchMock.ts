type MockFetchResponseOptions = {
  ok: boolean;
  status?: number;
  jsonData?: unknown;
};

export function createFetchMock(): jest.Mock {
  const fetchMock = jest.fn();
  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

export function mockFetchResponse(fetchMock: jest.Mock, options: MockFetchResponseOptions): void {
  const { ok, status = ok ? 200 : 500, jsonData } = options;

  fetchMock.mockResolvedValue({
    ok,
    status,
    json: jest.fn().mockResolvedValue(jsonData),
  });
}

export function mockFetchReject(fetchMock: jest.Mock, error: Error): void {
  fetchMock.mockRejectedValue(error);
}
