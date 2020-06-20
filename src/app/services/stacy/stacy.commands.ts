const StacyCommands = {
  GREETING: ['Hi', 'Hello 😊', 'Hi, I\'m Stacy.', 'Howdy', 'Holla'],
  INTRODUCTION: [
    `I could help you find a movie.
    Just quote a movie title or type <strong>search</strong> followed by your search term to find a movie.
    <br><br> Wanna try?`,
    'I happen to know a lot about movies. Just quote a title and I\'ll tell you about the movie.'
  ],
  PROMPT: [
    'Just quote the title of the movie or type <strong>search</strong> followed by your search term to find a movie',
    'You could try <strong>search avengers</strong>',
    'You could try typing \'Titanic\' with the quotes',
  ],
  PERSUADE: [
    'You sure?',
    'Not even a test run?',
    'How about now?',
    'You sure you don\'t want to change your mind?',
    'Life gets easier you know?'
  ],
  ERROR: [
    'Ah! I see what you are doing 🤔 <br> You did not quote a title, yeah?',
    'Oh well, I tried. Just quote a title next time, it is that simple',
    'Oops, even I wasn\'t expecting that 🤭'
  ],
  POSITIVE: [
    'Yes', 'Yup',
    'Yeah', 'Yas',
    'Yaas', 'Yelz',
    'Yippie', 'Oui',
    'Beni', 'Okay',
    'Alright', 'Go',
    'Do it', 'Fine',
    'Well', 'Good',
    'Great', 'Nice',
    'Chilled'
  ],
  NEGATIVE: ['No', 'Nah', 'Nada', 'Zip', 'Nope', 'Neh'],
  RANDOM: ['Hey, do you know fishes can swim? Lol. I joked.'],
  TITLE: [''],
  NAVIGATE: [''],
  SEARCH: [''],
};

type Commands = typeof StacyCommands;
export type StacyCommand = keyof Commands;

export const getCommand = (command: StacyCommand) => StacyCommands[command];

