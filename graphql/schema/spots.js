module.exports = /* GraphQL */ `
  scalar Blob

  type Coordinates {
    lon: Float
    lat: Float
  }

  type Spot {
    spotId: ID!
    coordinates: Coordinates
    occupied: Boolean
    reserved: Boolean
    cityId: ID
    active: Boolean
    ping: String
    createdAt: String
  }

  input coordinatesInput {
    lon: Float
    lat: Float
  }

  input spotInput {
    spotId: ID
    coordinates: coordinatesInput
    occupied: Boolean
    reserved: Boolean
    cityId: ID
    active: Boolean
    ping: String
    createdAt: String
  }

  input spotsByLocationInput {
    lon: Float
    lat: Float
    latDelta: Float
    lonDelta: Float
  }
`;
