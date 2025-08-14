import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import Alerts from '../components/Alerts';
import { AutoRefreshProvider } from '../components/AutoRefreshContext';

jest.mock('axios');

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

const useRouter = require('next/router').useRouter;

test('prefills new alert device from query param', async () => {
  axios.get.mockResolvedValue({
    data: {
      devices: ['DeviceA', 'DeviceB'],
      alertLevels: ['Low', 'High'],
      alerts: [],
    },
  });

  useRouter.mockReturnValue({ isReady: true, query: { device: 'DeviceB' } });

  render(
    <AutoRefreshProvider>
      <Alerts />
    </AutoRefreshProvider>
  );

  await waitFor(() => {
    expect(screen.getByDisplayValue('DeviceB')).toBeInTheDocument();
  });
});
