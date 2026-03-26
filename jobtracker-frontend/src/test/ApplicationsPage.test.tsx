import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ApplicationsPage from "../pages/ApplicationsPage";
import { fetchApplications } from "../services/applications";

vi.mock("../services/applications", async () => {
  const actual = await vi.importActual<typeof import("../services/applications")>(
    "../services/applications",
  );

  return {
    ...actual,
    fetchApplications: vi.fn(),
    createApplication: vi.fn(),
    updateApplication: vi.fn(),
    deleteApplication: vi.fn(),
  };
});

describe("ApplicationsPage", () => {
  it("filters and sorts the application list", async () => {
    vi.mocked(fetchApplications).mockResolvedValue([
      {
        id: 1,
        companyName: "Beta Labs",
        jobTitle: "Frontend Engineer",
        source: "LinkedIn",
        status: "APPLIED",
        appliedDate: "2026-03-20",
        notes: "React role",
        createdAt: "2026-03-20T00:00:00Z",
        updatedAt: "2026-03-21T00:00:00Z",
      },
      {
        id: 2,
        companyName: "Acme Corp",
        jobTitle: "Backend Engineer",
        source: "Seek",
        status: "OFFER",
        appliedDate: "2026-03-18",
        notes: "Java role",
        createdAt: "2026-03-18T00:00:00Z",
        updatedAt: "2026-03-22T00:00:00Z",
      },
    ]);

    render(<ApplicationsPage />);

    await waitFor(() => {
      expect(screen.getByText("Beta Labs")).toBeInTheDocument();
      expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText("Search Applications"), {
      target: { value: "backend" },
    });

    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.queryByText("Beta Labs")).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Search Applications"), {
      target: { value: "" },
    });
    fireEvent.change(screen.getByLabelText("Status Filter"), {
      target: { value: "OFFER" },
    });

    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.queryByText("Beta Labs")).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Status Filter"), {
      target: { value: "ALL" },
    });
    fireEvent.change(screen.getByLabelText("Sort By"), {
      target: { value: "companyName" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Desc" }));

    const rows = screen.getAllByRole("row");
    const firstDataRow = rows[1];
    expect(within(firstDataRow).getByText("Acme Corp")).toBeInTheDocument();
  });
});
