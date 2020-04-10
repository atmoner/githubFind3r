//'use strict';
const { Octokit } = require("@octokit/rest");
const octokit = new Octokit();
var inquirer = require('inquirer');
var chalkPipe = require('chalk-pipe');
const chalk = require('chalk');
const figlet = require('figlet');
var Table = require('cli-table');

/**
 * Input prompt example
 */
console.log(
  chalk.yellow(
    figlet.textSync('GithubFind3r', {
    font: 'Rectangles',
    horizontalLayout: 'default',
    verticalLayout: 'default'
} )
  )
);
console.log(
  chalk.yellow(
     '                        Dev by @atmon3r - 2020 \n'
  )
);

var output = [];

var questions = [
    {
      type: 'list',
      name: 'ghAction',
      message: 'What do you want to do?',
      choices: [
      	new inquirer.Separator(),
        'Search repositories',
        'Search commits',        
        'Search users'
      ]
    }
];

var qsearchRepo = [
		{
		  type: 'input',
		  name: 'repoSearch',
		  message: "Your research:",
		  default: function() {
		    return 'OSINT';
		  }
		},
    {
      type: 'list',
      name: 'sortBy',
      message: 'Sort by?',
      choices: [
      	new inquirer.Separator(),
        'Updated',
        'Forks',
        'Stars',
        'Best match',
        new inquirer.Separator(),
      ]
    },
    {
      type: 'list',
      name: 'orderBy',
      message: 'Order by?',
      choices: [
      	new inquirer.Separator(),
        'desc',
        'asc'
      ]
    }
];

var qsearchUsers = [
		{
		  type: 'input',
		  name: 'usersSearch',
		  message: "Your research:",
		  default: function() {
		    return 'atmo';
		  }
		},
    {
      type: 'list',
      name: 'sortBy',
      message: 'Sort by?',
      choices: [
      	new inquirer.Separator(),
        'Followers',
        'Repositories',
        'Joined'
      ]
    },
    {
      type: 'list',
      name: 'orderBy',
      message: 'Order by?',
      choices: [
      	new inquirer.Separator(),
        'desc',
        'asc'
      ]
    }
];

var qcreateGists = [
		{
		  type: 'input',
		  name: 'commitsSearch',
		  message: "Your research:",
		  default: function() {
		    return 'security';
		  }
		},
    {
      type: 'list',
      name: 'sortBy',
      message: 'Sort by?',
      choices: [
      	new inquirer.Separator(),
        'author-date',
        'committer-date'
      ]
    },
    {
      type: 'list',
      name: 'orderBy',
      message: 'Order by?',
      choices: [
      	new inquirer.Separator(),
        'desc',
        'asc'
      ]
    }
];

function main() {
  bootStart();
}

function truncateString(str, num) {
  if (str.length <= num) {
    return str
  }
  return str.slice(0, num) + '...'
}

function check(array, key, value) {
    return array.some(object => object[key] === value);
}


function bootStart() {
  inquirer.prompt(questions).then(answers => {
		switch (answers.ghAction) {
			case 'Search repositories':
				searchRepo();
				break;
			case 'Search users':
				searchUser();
				break;
			case 'Search commits':
				createGists();
				break;
			default:
				console.log(':/');
		}
  });
}

function searchRepo() {
  inquirer.prompt(qsearchRepo).then(answers => {

		octokit.search.repos({
			q: answers.repoSearch.toLowerCase(),
			sort: answers.sortBy.toLowerCase(),
			order: answers.orderBy,
			per_page: '10'
		}).then(({ data }) => {
				//console.log(data);
				console.log('\n  Results:', data.total_count);
				console.log('  Display:', data.items.length + '\n');
				var res = [];
				for (var i = 0; i < data.items.length; i++) {
					res.push({
						url: data.items[i].html_url, 
						updated: data.items[i].updated_at, 
						created: data.items[i].created_at,
						stars: data.items[i].stargazers_count,
						forks: data.items[i].forks
					});
				}
				var table = new Table({ head: ["Id", "Created", "Update", "Repo url", "Stars", "Forks"] });
				var test = 1;
				res.forEach(function(item){
					table.push(
							{ [test++]: [ item.created, item.updated, item.url, item.stars, item.forks] }
					);
				});
				console.log(table.toString());
				console.log('\n');
				bootStart();
		});
  });
}

function searchUser() {
  inquirer.prompt(qsearchUsers).then(answers => {
  
		octokit.search.users({
			q: answers.usersSearch.toLowerCase(),
			sort: answers.sortBy.toLowerCase(),
			order: answers.orderBy.toLowerCase(),
			per_page: '10'
		}).then(({ data }) => {
				//console.log(data);
				console.log('\n  Results:', data.total_count);
				console.log('  Display:', data.items.length + '\n');
				var res = [];
				for (var i = 0; i < data.items.length; i++) {
					res.push({ghId: data.items[i].id, login: data.items[i].login, html_url: data.items[i].html_url});
				}
				var table = new Table({ head: ["Id", "Github id", "Name", "User url"] });
				var test = 1;
				res.forEach(function(item){
					table.push(
							{ [test++]: [ item.ghId, item.login, item.html_url] }
					);
				});
				console.log(table.toString());
				console.log('\n');	
				bootStart();			
		});
  });
}

function createGists() {
  inquirer.prompt(qcreateGists).then(answers => {
  
		octokit.search.commits({
			q: answers.commitsSearch.toLowerCase(),
			sort: answers.sortBy.toLowerCase(),
			order: answers.orderBy.toLowerCase(),
			per_page: '10'
		}).then(({ data }) => {
		
				var res = [];
				for (var i = 0; i < data.items.length; i++) {
					if (!check(res, 'commitRepoId', data.items[i].repository.id)) {
			 			res.push({
			 				id: i, 
			 				commitRepoId: data.items[i].repository.id, 
			 				message: truncateString(data.items[i].commit.message, 100) +'\n\n'+data.items[i].html_url
			 			});
			 		} 
				}

				var table = new Table({ head: ["Id", "Repository id", "Message commit"] });				
				res.forEach(function(item){
					table.push(
							{ [item.id]: [ item.commitRepoId, item.message ] }
					);
				});
				console.log(table.toString());
				//bootStart();			
		});
  });
}

main();
