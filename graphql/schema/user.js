module.exports = /* GraphQL */ `
  type Attributes {
    email: String
    phoneNumber: String
    birthdate: String
  }

  type UserData {
    username: String
    attributes: Attributes
  }

  type UserImages {
    imageId: ID!
    s3location: S3location
    url: String
  }

  type Name {
    firstName: String
    lastName: String
  }

  type UserRoom {
    roomId: ID
  }
  
  type User {
    userId: ID
    name: Name
    username: String
    email: String
    phoneNumber: Int
    birthdate: String
    userImages: [UserImages]
    createdAt: String
    currentLocation: String
  }

  input inputName {
    firstName: String
    lastName: String
  }

  input userInput {
    userId: ID
    name: inputName
    username: String
    email: String
    phoneNumber: Int
    birthdate: String
    userImages: [inputUserImages]
    createdAt: String
  }

  input createUserInput {
    userId: ID
    name: inputName
    username: String
    email: String
    phoneNumber: Int
    birthdate: String
    userImages: [inputUserImages]
    createdAt: String
    password: String
  }

  input signInInput {
    username: String
    password: String
  }

  input inputUserImages {
    imageId: ID!
    s3location: s3locationInput
    url: String
  }
`;
