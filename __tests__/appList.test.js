import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import AppList from "../components/AppList";
import { AutoRefreshProvider } from "../components/AutoRefreshContext";

jest.mock("axios");
jest.mock("react-chartjs-2", () => ({
  Line: () => <div data-testid="chart" />,
}));

test("fetches timeline data when time-based toggled", async () => {
  axios.get.mockResolvedValue({ data: [] });
  render(
    <AutoRefreshProvider>
      <AppList />
    </AutoRefreshProvider>
  );
  await waitFor(() => {
    expect(axios.get).toHaveBeenCalledWith("/api/apps", undefined);
  });

  const onRadio = screen.getByRole("radio", { name: /on/i });
  fireEvent.click(onRadio);

  await waitFor(() => {
    expect(axios.get).toHaveBeenLastCalledWith(
      "/api/apps-timeline",
      expect.objectContaining({
        params: {
          startTimestamp: expect.any(String),
          endTimestamp: expect.any(String),
        },
      })
    );
  });
});

test("hides nodes and certificate when time-based is on", async () => {
  axios.get.mockReset();
  axios.get
    .mockResolvedValueOnce({
      data: [
        {
          name: "App1",
          nodes: ["node1"],
          certificate: "cert1",
          keyConsumptionHistory: [],
          errorHistory: [],
        },
      ],
    })
    .mockResolvedValueOnce({
      data: [
        {
          name: "App1",
          nodes: ["node1"],
          certificate: "cert1",
          keyConsumptionHistory: [],
          errorHistory: [],
        },
      ],
    });

  render(
    <AutoRefreshProvider>
      <AppList />
    </AutoRefreshProvider>
  );

  // initial render shows nodes and certificate
  await waitFor(() => expect(axios.get).toHaveBeenCalledWith("/api/apps", undefined));
  expect(screen.getByText(/Accessible Nodes/i)).toBeInTheDocument();
  expect(screen.getByText(/Certificate/i)).toBeInTheDocument();

  const onRadio = screen.getByRole("radio", { name: /on/i });
  fireEvent.click(onRadio);

  await waitFor(() =>
    expect(axios.get).toHaveBeenLastCalledWith(
      "/api/apps-timeline",
      expect.objectContaining({ params: { startTimestamp: expect.any(String), endTimestamp: expect.any(String) } })
    )
  );

  await waitFor(() => {
    expect(screen.queryByText(/Accessible Nodes/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Certificate/i)).not.toBeInTheDocument();
  });
});
