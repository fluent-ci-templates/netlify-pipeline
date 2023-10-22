import { gql } from "../../deps.ts";

export const build = gql`
  query build($src: String!) {
    build(src: $src)
  }
`;

export const deploy = gql`
  query deploy(
    $src: String!
    $token: String!
    $siteId: String!
    $siteDir: String!
  ) {
    deploy(src: $src, token: $token, siteId: $siteId, siteDir: $siteDir)
  }
`;
