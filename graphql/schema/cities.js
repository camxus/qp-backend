module.exports = /* GraphQL */ `
  type City {
    cityId: ID!
    name: String
    country: String
    location: Location
  }

  input cityInput {
    name: String
    country: String
    location: locationInput
  }
`;
