module.exports = /* GraphQL */ `
  type Location {
    lon: Float
    lat: Float
  }

  input locationInput {
    lon: Float
    lat: Float
  }

  input requestPresignedURL {
    bucket: String
    key: String
  }

  type S3location {
    bucket: String
    key: String
  }

  input s3locationInput {
    bucket: String
    key: String
  }

  # QUERY
  type RootQuery {
    getPresignedURL(input: requestPresignedURL): String
    getObjectURL(input: requestPresignedURL): String

    usersByFilter(input: userInput): [User]

    hello: String
    quotes: [Quote]

    cities: [City]

    spots: [Spot]
    spotsByFilter(input: spotInput): [Spot]
    spotsByLocation(input: spotsByLocationInput): [Spot]
  }

  # MUTATION
  type RootMutation {
    createUser(input: createUserInput): User
    updateUser(input: userInput): User
    signIn(input: signInInput): String
    editUser(input: userInput): User

    createCity(input: cityInput): City

    createSpot(input: spotInput): Spot
    updateSpot(input: spotInput): Spot
  }

  schema {
    query: RootQuery
    mutation: RootMutation
  }
`;
