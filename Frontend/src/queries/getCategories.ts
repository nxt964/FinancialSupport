import { gql } from "@apollo/client";

export const GET_CATEGORIES = gql`
  query GetAllCategories {
    getAllCategories {
      id
      name
      # any other fields defined in your Category type
    }
  }
`;
