import { gql } from "@apollo/client";

export const GET_FEATURED_NEWS_BY_CATEGORY = gql`
  query GetFeaturedNewsByCategory($categoryId: Int!, $page: Int) {
    featuredNewsByCategory(categoryId: $categoryId, page: $page) {
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
