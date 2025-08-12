import { gql } from "@apollo/client";

export const RELATED_NEWS = gql`
  query RelatedNews($id: Int!) {
    relatedNews(id: $id) {
      id
      title
      coverImageUrl
      publishedDate
      category {
        id
        name
      }
    }
  }
`;
