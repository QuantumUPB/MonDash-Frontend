import { render, waitFor, fireEvent } from "@testing-library/react";
import axios from "axios";

jest.mock("ol/ol.css", () => ({}));
jest.mock("ol", () => ({
  Map: jest.fn().mockImplementation(() => ({
    setTarget: jest.fn(),
    addOverlay: jest.fn(),
    removeOverlay: jest.fn(),
    removeLayer: jest.fn(),
    render: jest.fn(),
    on: jest.fn(),
    un: jest.fn(),
    forEachFeatureAtPixel: jest.fn(),
  })),
  View: jest.fn(),
}));
jest.mock("ol/layer", () => ({ Tile: jest.fn() }));
jest.mock("ol/source", () => ({ XYZ: jest.fn() }));
jest.mock("ol/proj", () => ({ fromLonLat: jest.fn((c) => c) }));
jest.mock("ol/style", () => ({
  Style: jest.fn(),
  Fill: jest.fn(),
  Stroke: jest.fn(),
  Text: jest.fn(),
  Circle: jest.fn(),
  CircleStyle: jest.fn(),
  Icon: jest.fn(),
}));
jest.mock("ol/format/GeoJSON", () => {
  return jest.fn().mockImplementation(() => ({ readFeatures: jest.fn(() => []) }));
});
jest.mock("ol/layer/Vector", () => jest.fn());
jest.mock("ol/source/Vector", () => jest.fn());
jest.mock("ol/Overlay", () =>
  jest.fn().mockImplementation(() => ({ setPosition: jest.fn() }))
);
jest.mock("ol/Feature", () => jest.fn().mockImplementation(() => ({
  getGeometry: jest.fn(() => ({ setCoordinates: jest.fn() })),
  setStyle: jest.fn(),
  set: jest.fn(),
})));
jest.mock("ol/geom/Point", () => jest.fn());

import MapView from "../components/MapView";
import { AutoRefreshProvider } from "../components/AutoRefreshContext";

jest.mock("axios");

test("warns when connection references missing nodes", async () => {
  const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
  axios.get.mockImplementation((url) => {
    if (url === "/api/map") {
      return Promise.resolve({
        data: {
          nodes: [
            { id: "A", name: "A", coordinates: [0, 0], endpoint: true },
          ],
          connections: [{ from: "A", to: "B", status: "green" }],
        },
      });
    }
    if (url === "/api/apps") {
      return Promise.resolve({ data: [] });
    }
    return Promise.resolve({ data: {} });
  });

  render(
    <AutoRefreshProvider>
      <MapView />
    </AutoRefreshProvider>
  );

  expect(document.querySelector('.mapview')).toBeInTheDocument();

  await waitFor(() => {
    expect(warnSpy).toHaveBeenCalledWith("Invalid connection: A -> B");
  });

  warnSpy.mockRestore();
});

test("toggle animation button switches text", async () => {
  axios.get.mockImplementation((url) => {
    if (url === "/api/map") {
      return Promise.resolve({ data: { nodes: [], connections: [] } });
    }
    if (url === "/api/apps") {
      return Promise.resolve({ data: [] });
    }
    return Promise.resolve({ data: {} });
  });

  const { getByRole } = render(
    <AutoRefreshProvider>
      <MapView />
    </AutoRefreshProvider>
  );

  const button = getByRole("button", { name: /disable animations/i });
  fireEvent.click(button);
  expect(button).toHaveTextContent(/enable animations/i);
});
