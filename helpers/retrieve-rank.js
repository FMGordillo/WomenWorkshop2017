const RetrieveAndRankV1 = require('watson-developer-cloud/retrieve-and-rank/v1');
const retrieve = new RetrieveAndRankV1({
  username: process.env.RETRIEVEandRANK_username || '',
  password: process.env.RETRIEVEandRANK_pw || ''
});

var solrClient = retrieve.createSolrClient({
  cluster_id: 'INSERT YOUR CLUSTER ID HERE',
  collection_name: 'example_collection'
});
