var text = {};
//var baseUrl = 'http://seb.herokuapp.com';

text.vote = {
  title: 'Voting App',
  link: '/vote',
  userStories: [
    'As an authenticated user, I can keep my polls and come back later to access them.',
    'As an authenticated user, I can share my polls with my friends.',
    'As an authenticated user, I can see the aggregate results of my polls.',
    'As an authenticated user, I can delete polls that I decide I don\'t want anymore.',
    'As an authenticated user, I can create a poll with any number of possible items.',
    'As an unauthenticated or authenticated user, I can see and vote on everyone\'s polls.',
    'As an unauthenticated or authenticated user, I can see the results of polls in chart form. (This could be implemented using Chart.js or Google Charts.)',
    'As an authenticated user, if I don\'t like the options on a poll, I can create a new option.'
  ],
  examples: []
}

text.nightlife = {
  title: 'Nightlife coordination',
  link: '/nightlife',
  userStories: [
    'As an unauthenticated user, I can view all bars in my area.',
    'As an authenticated user, I can add myself to a bar to indicate I am going there tonight.',
    'As an authenticated user, I can remove myself from a bar if I no longer want to go there.',
    'As an unauthenticated user, when I login I should not have to search again.'
  ],
  examples: []
}


module.exports = text;
