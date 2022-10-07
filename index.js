const { ApolloServer, gql } = require('apollo-server');

const db = require("./models");


db.sequelize.sync()
	.then(() => {
		console.log("sync db");
	})
	.catch((err) => {
		console.log("error: " + err.message);
	});

const news = db.newss;
const comments = db.comments;

const resolvers = {
	Query: {
		Newss: () => {
			//console.log("call products");
			return news.findAll({
				where: {
				  dlt: 0
				}
			  })
				.then(news => {
					//console.log(products);
					return news;
				})
				.catch(err => {
					return [];
				});
		},
		Commentss: () => {
				return comments.findAll()
					.then(comment => {
						return comment;
					})
					.catch(err => {
						return [];
					});
		}
	},

	Mutation: {
		add_comment: (parent, { name, comment, id_news }) => {
				var data = {
					name: name,
					comment: comment,
					id_news: id_news,
				}
				return comments.create(data)
					.then(comment => {
						return comment;
					})
					.catch(err => {
						return err;
					});
		},
		add_news: (parent, { title, image, news_content }) => {
			var data = {
				title: title,
				image: image,
				news_content: news_content,
			}
			return news.create(data)
				.then(data => {
					return data;
				})
				.catch(err => {
					return {};
				});
		},
		news_detail: (parent, { id_news }) => {
			var id_news=id_news;
			return news.findOne({
				include: [{
					model: comments, as:"comments"
				}],
				where: {
					id_news: id_news
				}
			}).then(data => {
				if(data){
					return data;
				}else{
					return {};
				}
			})
			.catch(err => {
				return err;
			});

			// return news.findByPk(id)
			// 	.then(data => {
			// 		return data;
			// 	})
			// 	.catch(err => {
			// 		return {};
			// 	});
		},
		edit_news: (parent, { id_news, title, image, news_content}) => {
			var data = {
				title: title,
				image: image,
				news_content: news_content
			}
			return news.update(data, {
				where: { id_news: id_news }
			})
				.then(num => {
					return {
						id_news: id_news,
						title: title,
						image: image,
						news_content: news_content
					}

				})
				.catch(err => {
					return {};
				});
		},
		delete_news: (parent, { id_news }) => {
			return news.findByPk(id_news)
				.then(data => {
					if (data) {
						return news.update({dlt: 1},{
							where: { id_news: id_news }
						})
							.then(num => {
								return num;
							})
							.catch(err => {
								return err;
							});
					} else {
						return {};
					}
				})
				.catch(err => {
					return {};
				});

		},
	}
};


const {
	ApolloServerPluginLandingPageLocalDefault
} = require('apollo-server-core');

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.

const fs = require('fs');
const path = require('path');
const { sequelize } = require('./models');
const typeDefs = fs.readFileSync("./schema.graphql", "utf8").toString();

//server without auth?
const server = new ApolloServer({
	typeDefs,
	resolvers,
	csrfPrevention: true,
	cache: 'bounded',
	/**
	 * What's up with this embed: true option?
	 * These are our recommended settings for using AS;
	 * they aren't the defaults in AS3 for backwards-compatibility reasons but
	 * will be the defaults in AS4. For production environments, use
	 * ApolloServerPluginLandingPageProductionDefault instead.
	**/
	plugins: [
	  ApolloServerPluginLandingPageLocalDefault({ embed: true }),
	],
  });

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
	console.log(`🚀  Server ready at ${url}`);
});  