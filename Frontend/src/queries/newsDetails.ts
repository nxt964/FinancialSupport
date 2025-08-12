import { gql } from "@apollo/client";

export const NEWS_DETAILS = gql`
  query NewsDetails($id: Int!) {
    newsDetails(id: $id) {
      title
      content
      author
      publishedDate
      coverImageUrl
      sentimentLabel
      sentimentScore
      category {
        id
        name
      }
    }
  }
`;
