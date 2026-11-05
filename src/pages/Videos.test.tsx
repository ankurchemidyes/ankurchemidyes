import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import Videos from "./Videos";
const mocks = vi.hoisted(() => ({
  access: { userId: null as string | null, isAdmin: false, checking: false },
  gallery: vi.fn(), invoke: vi.fn(), insert: vi.fn(),
}));
vi.mock("@/hooks/use-video-admin", () => ({ useVideoAdmin: () => mocks.access }));
vi.mock("@/components/Navbar", () => ({ Navbar: () => null }));
vi.mock("@/components/Footer", () => ({ Footer: () => null }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: {
  from: () => ({ select: () => ({ eq: () => ({ order: mocks.gallery }) }), insert: mocks.insert }),
  functions: { invoke: mocks.invoke },
} }));
beforeEach(() => {
  mocks.access = { userId: null, isAdmin: false, checking: false };
  mocks.gallery.mockResolvedValue({ data: [], error: null });
  mocks.invoke.mockResolvedValue({ data: null, error: new Error("Unavailable") });
  mocks.insert.mockResolvedValue({ error: null });
  vi.stubGlobal("IntersectionObserver", class { observe() {} unobserve() {} disconnect() {} });
});
afterEach(cleanup);
it("shows the requested embed and full official widget but no admin controls publicly", async () => {
  const { container } = render(<Videos />);
  await screen.findByText(/Live statistics are temporarily unavailable/);
  expect(container.querySelector('iframe[src="https://www.youtube.com/embed/gxpAlDUWIOQ"]')).toHaveAttribute("referrerpolicy", "strict-origin-when-cross-origin");
  expect(container.querySelector('.g-ytsubscribe')).toHaveAttribute("data-channelid", "UCuG7-r1F3b2RzGoRFIe0MnQ");
  expect(container.querySelector('.g-ytsubscribe')).toHaveAttribute("data-layout", "full");
  expect(screen.queryByRole("button", { name: "Add Video" })).not.toBeInTheDocument();
  expect(screen.queryByLabelText("YouTube video URL")).not.toBeInTheDocument();
});
it("deduplicates the featured video when it also exists in the database", async () => {
  mocks.gallery.mockResolvedValue({ data: [{ id: "db-feature", youtube_video_id: "gxpAlDUWIOQ", title: "Duplicate", description: null }], error: null });
  const { container } = render(<Videos />);
  await waitFor(() => expect(screen.queryByText("Loading more videos…")).not.toBeInTheDocument());
  expect(container.querySelectorAll('iframe[src*="/embed/gxpAlDUWIOQ"]')).toHaveLength(1);
});
it("opens the add dialog only for an admin, saves and refreshes, then removes controls on sign-out", async () => {
  mocks.access = { userId: "admin-user", isAdmin: true, checking: false };
  const { rerender } = render(<Videos />);
  fireEvent.click(screen.getByRole("button", { name: "Add Video" }));
  fireEvent.change(screen.getByLabelText("YouTube video URL"), { target: { value: "https://youtu.be/abcdefghijk" } });
  fireEvent.change(screen.getByLabelText("Title"), { target: { value: "New vlog" } });
  fireEvent.click(screen.getByRole("button", { name: "Add video" }));
  await waitFor(() => expect(mocks.insert).toHaveBeenCalledWith(expect.objectContaining({ youtube_video_id: "abcdefghijk", title: "New vlog", created_by: "admin-user" })));
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  mocks.access = { userId: null, isAdmin: false, checking: false };
  rerender(<Videos />);
  expect(screen.queryByRole("button", { name: "Add Video" })).not.toBeInTheDocument();
});
it("retains the featured video when the database is unavailable", async () => {
  mocks.gallery.mockResolvedValue({ data: null, error: new Error("offline") });
  const { container } = render(<Videos />);
  await screen.findByText("More videos could not be loaded.");
  expect(container.querySelector('iframe[src*="/embed/gxpAlDUWIOQ"]')).toBeInTheDocument();
});
