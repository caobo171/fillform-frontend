import useSWR from 'swr';

import CountriesNow from '@/lib/countries_now';

type City = {
  name: string;
};

export function useCities() {
  const result: {
    data?: {
      states?: City[];
    };
  } =
    useSWR(CountriesNow.CITY_URL, async () => {
      const res = await fetch(CountriesNow.CITY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          country: 'vietnam',
        }),
      });
      return res.json();
    })?.data || {};

  return {
    cities: result?.data?.states || [],
  };
}
