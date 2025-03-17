export type JourneyObject = {
  name: string;
  flag: string;
};

export const convertTotalScoreToRank = (totalScore: number): JourneyObject => {
  switch (true) {
    case totalScore < 10:
      return {
        name: 'Staring the journey',
        flag: 'vietnam',
      };
    case totalScore < 20:
      return {
        name: 'Arrived in Laos',
        flag: 'laos',
      };
    case totalScore < 40:
      return {
        name: 'Arrived in Cambodia',
        flag: 'cambodia',
      };
    case totalScore < 60:
      return {
        name: 'Arrived in Thailand',
        flag: 'thailand',
      };
    case totalScore < 80:
      return {
        name: 'Arrived in Malaysia',
        flag: 'malaysia',
      };
    case totalScore < 100:
      return {
        name: 'Arrived in Singapore',
        flag: 'singapore',
      };
    case totalScore < 150:
      return {
        name: 'Arrived in Indonesia',
        flag: 'indonesia',
      };
    default:
      return {
        name: 'Safely returned home in Australia',
        flag: 'australia',
      };
  }
};
