import { getUserRole } from "@/services/authService";

describe('getUserRole', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return null when no token exists', () => {
    expect(getUserRole()).toBeNull();
  });
}); 