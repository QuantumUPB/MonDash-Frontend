import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import axios from "axios";
import DeviceList from "../components/DeviceList";
import { AutoRefreshProvider } from "../components/AutoRefreshContext";

const push = jest.fn();

jest.mock("next/router", () => ({
    useRouter: () => ({ push }),
}));

jest.mock("axios");
jest.mock("../components/NodeDevicesMap", () => () => <div data-testid="node-map" />);
jest.mock("react-chartjs-2", () => ({
    Line: () => <div data-testid="chart" />,
}));

test("renders device ids", async () => {
    axios.get.mockResolvedValue({
        data: [
            {
                id: "QKD1-A",
                device: "DeviceOne",
                status: "",
                node_id: "",
                connected_to: { id: "QKD1-B" },
                self_reporting: {
                    keyrate: [
                        { timestamp: '2025-06-19T00:00:00Z', rate: 0 }
                    ],
                    max_key_rate: 1,
                    gen_rate: 0,
                    usage_rate: 0,
                    logs: [],
                },
            },
            {
                id: "QKD1-B",
                device: "DeviceTwo",
                status: "",
                node_id: "",
                connected_to: { id: "QKD1-A" },
                self_reporting: {
                    keyrate: [
                        { timestamp: '2025-06-19T00:00:00Z', rate: 0 }
                    ],
                    max_key_rate: 1,
                    gen_rate: 0,
                    usage_rate: 0,
                    logs: [],
                },
            },
        ],
    });
    render(
        <AutoRefreshProvider>
            <DeviceList />
        </AutoRefreshProvider>
    );
    await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith("/api/devices?numEntries=15");
    });
    expect(await screen.findByRole("heading", { name: "QKD1-A" })).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "QKD1-B" })).toBeInTheDocument();
});

test("set alert navigates to alerts page", async () => {
    axios.get.mockResolvedValue({
        data: [
            {
                id: "QKD1-A",
                device: "DeviceOne",
                status: "",
                node_id: "",
                connected_to: { id: "QKD1-B" },
                self_reporting: {
                    keyrate: [
                        { timestamp: '2025-06-19T00:00:00Z', rate: 0 }
                    ],
                    max_key_rate: 1,
                    gen_rate: 0,
                    usage_rate: 0,
                    logs: [],
                },
            },
        ],
    });

    render(
        <AutoRefreshProvider>
            <DeviceList />
        </AutoRefreshProvider>
    );

    const button = await screen.findByRole("button", { name: /set alert/i });
    fireEvent.click(button);

    expect(push).toHaveBeenCalledWith({
        pathname: "/alerts",
        query: { device: "DeviceOne" },
    });
});
