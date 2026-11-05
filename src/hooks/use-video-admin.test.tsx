import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useVideoAdmin } from "./use-video-admin";

const mocks = vi.hoisted(() => ({ getUser: vi.fn(), role: vi.fn(), onAuth: vi.fn(), unsubscribe: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: {
  auth: { getUser: mocks.getUser, onAuthStateChange: mocks.onAuth },
  from: () => ({ select: () => ({ eq: () => ({ eq: () => ({ maybeSingle: mocks.role }) }) }) }),
} }));
let authChange: (event: string, session: { user: { id: string } } | null) => void;
beforeEach(() => {
  vi.clearAllMocks();
  mocks.getUser.mockResolvedValue({ data: { user: null } });
  mocks.role.mockResolvedValue({ data: null, error: null });
  mocks.onAuth.mockImplementation(callback => {
    authChange = callback;
    return { data: { subscription: { unsubscribe: mocks.unsubscribe } } };
  });
});
describe("video admin access", () => {
  it("keeps anonymous visitors out", async () => {
    const { result } = renderHook(useVideoAdmin);
    await waitFor(() => expect(result.current.checking).toBe(false));
    expect(result.current.isAdmin).toBe(false);
    expect(mocks.role).not.toHaveBeenCalled();
  });
  it("does not treat a signed-in user as an admin", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: "ordinary" } } });
    const { result } = renderHook(useVideoAdmin);
    await waitFor(() => expect(result.current.checking).toBe(false));
    expect(result.current.isAdmin).toBe(false);
  });
  it("grants verified admins access and clears it on sign-out", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: "admin" } } });
    mocks.role.mockResolvedValue({ data: { role: "admin" }, error: null });
    const { result } = renderHook(useVideoAdmin);
    await waitFor(() => expect(result.current.isAdmin).toBe(true));
    act(() => authChange("SIGNED_OUT", null));
    expect(result.current.isAdmin).toBe(false);
    await waitFor(() => expect(result.current.userId).toBeNull());
  });
  it("ignores an old role lookup that finishes after sign-out", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: "admin" } } });
    let resolveRole: (value: unknown) => void;
    mocks.role.mockReturnValue(new Promise(resolve => { resolveRole = resolve; }));
    const { result } = renderHook(useVideoAdmin);
    await waitFor(() => expect(mocks.role).toHaveBeenCalled());
    await act(async () => { authChange("SIGNED_OUT", null); });
    await act(async () => { resolveRole({ data: { role: "admin" }, error: null }); });
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.userId).toBeNull();
  });
  it("fails closed if the role query fails", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: "admin" } } });
    mocks.role.mockRejectedValue(new Error("offline"));
    const { result } = renderHook(useVideoAdmin);
    await waitFor(() => expect(result.current.checking).toBe(false));
    expect(result.current.isAdmin).toBe(false);
  });
});
