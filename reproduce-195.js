const { graphql } = require("./pkg");

run()

async function run () {
  console.log('Sending GraphQL request')

  try {
    const userToken = process.env.GITHUB_TOKEN
    const graphqlWithAuth = graphql.defaults({
      headers: {
        authorization: `token ${userToken}`,
      },
    });

    const result = await graphqlWithAuth(`{
      viewer {
        login
      }
    }`)
    console.log(result);
  } catch(error) {
    console.error(error)
  }
}
