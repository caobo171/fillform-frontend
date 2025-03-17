class CountriesNow {
  public static ALL_COUNTRIES_URL =
    'https://countriesnow.space/api/v0.1/countries';

  public static CITY_URL = `${this.ALL_COUNTRIES_URL}/states`;
}

export default CountriesNow;
