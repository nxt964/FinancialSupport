import { gql } from "@apollo/client";

export const FEATURED_NEWS = gql`
  query ($page: Int) {
    featuredNews(page: $page) {
      items {
        id
        title
        coverImageUrl
        publishedDate
        category {
          id
          name
        }
      }
      totalCount
    }
  }
`;
