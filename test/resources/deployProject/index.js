'use strict';

var Alexa = require('alexa-app');
var skill = new Alexa.app('brandhaiku');

var dataProvider = require('./dataProvider');

var playhaiku = function(response, number) {
    response
        .say(
            "<speak> <audio src=\""+ dataProvider.findItem(number-1).url+"\" /> " +
            "You can say Next Haiku.  Or <break time='0.25s'/> More Choices.  Which would you like? </speak>"
        )
        .reprompt(
            "<speak> You can say Next Haiku.  Or <break time='0.25s'/> Help.  Which would you like? </speak>"
        )
        .shouldEndSession(false);

    response.session('number', number); // Remember it
}

skill.launch(function(request, response) {
    response
        .say(
            "<speak> <audio src=\"https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Home_Page.mp3\" /> " +
            "You can say <break time='0.25s'/> Play Haiku <break time=\"0.5s\"/>  What Is A Brand Haiku <break time=\"0.25s\"/> " +
            "Or <break time=\"0.25s\"/> About The Author.  Which would you like?  </speak>"
        )
        .reprompt(
            "<speak>  You can say Play Haiku <break time='0.25s'/> What is A Brand Haiku <break time='0.25s'/> " +
            "About The Author.   Or <break time='0.25s'/>if you're done, You can say Stop!   What would you like to do?  </speak>"
        )
        .shouldEndSession(false);

    response
        .card({
            type: "Standard",
            title: "Fifty-Seven Brand Haikus",
            text: "Fifty-Seven Brand Haikus by Joseph Benson",
            image: {
                smallImageUrl: "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/haikus57.png",
                largeImageUrl: "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/haikus57.png"
            }
        });
});

skill.intent('PlayHaiku',
    {
        "slots":{"haiku":"NUMBER"},
        "utterances":[
            "{haiku}",
            "Play {haiku}",
            "Play Haiku Number {haiku}",
            "Play Brand Haiku Number {haiku}",
            "Play Number {haiku}",
            "Haiku {haiku}",
            "Brand Haiku {haiku}",
            "Number {haiku}"
        ]
    },
    function(request, response) {
        var number = request.slot('haiku');

        if (number < 1 || number > 57) {
            response
                .say(
                    "I'm sorry. There are 57 brand haikus. Please say a number between 1 and 57, " +
                    "or <break time='0.25s'/> You can say help. What would you like to do?"
                )
                .reprompt(
                    "Tell me a haiku number"
                )
                .shouldEndSession(false);
        } else {
            playhaiku(response,number);
        }
    }
);

skill.intent('HomePage',
    {
        "utterances":[
            "Home Page",
            "Home",
            "Go Home",
            "Start Over"
        ]
    },
    function(request, response) {
        response
            .say(
                "<speak> <audio src=\"https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Home_Page.mp3\" /> " +
                "You can say <break time='0.25s'/> Play Haiku <break time=\"0.5s\"/>  What Is A Brand Haiku <break time=\"0.25s\"/> " +
                "Or <break time=\"0.25s\"/> About The Author.  Which would you like?  </speak>"
            )
            .reprompt(
                "<speak>  You can say Play Haiku <break time='0.25s'/> What is A Brand Haiku <break time='0.25s'/> About The Author.   " +
                "Or <break time='0.25s'/>if you're done, You can say Stop!   What would you like to do?  </speak>"
            )
            .shouldEndSession(false);
    }
);

skill.intent('MoreChoices',
    {
        "utterances":[
            "More Choices",
            "More",
            "Other Choices"
        ]
    },
    function(request, response) {
        response
            .say(
                "<speak> You can say Play Haiku <break time='0.25s'/> What is A Brand Haiku <break time='0.25s'/> " +
                "Or <break time='0.25s'/>About The Author.  Which would you like? </speak>"
            )
            .reprompt(
                "<speak> You can say Play Haiku <break time='0.25s'/> What is A Brand Haiku <break time='0.25s'/> " +
                "About The Author <break time='0.25s'/> Or <break time='0.25s'/> Help.  Which would you like? </speak>"
            )
            .shouldEndSession(false);
    }
);

skill.intent('NextHaiku',
    {
        "utterances": [
            "Next Haiku",
            "Next",
            "Skip"
        ]
    },
    function (request, response) {
        var number = 1;

        if (request.session('number')) {
            number = +request.session('number');

            if (number == 57) {
                number = 1; // restart
            } else {
                number = number + 1;
            }
        }

        playhaiku(response,number);
    }
);

skill.intent('Previous',
    {
        "utterances": [
            "Previous Haiku",
            "Previous",
            "Skip Back",
            "Back",
            "Go Back"
        ]
    },
    function (request, response) {
        var number = 57;

        if (request.session('number')) {
            number = +request.session('number');

            if (number == 1) {
                number = 57; // restart
            } else {
                number = number - 1;
            }
        }

        playhaiku(response,number);
    }
);

skill.intent('Categories',
    {
        "utterances": [
            "Categories"
        ]
    },
    function (request, response) {
        response
            .say(
                "<speak> You can say Brand Strategy, Brand Elements Or <break time='0.25s'/> " +
                "Benefits Of A Strong Brand.  Which would you like? </speak>"
            )
            .reprompt(
                "<speak> You can say Brand Strategy. Brand Elements, Benefits Of A Strong Brand " +
                "Or <break time='0.25s'/> Help.  Which would you like? </speak>"
            )
            .shouldEndSession(false);
    }
);

skill.intent('BrandStrategy',
    {
        "utterances": [
            "Brand Strategy",
            "Strategy"
        ]
    },
    function (request, response) {
        response
            .say(
                "<speak> <audio src=\"https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-One.mp3\" /> " +
                "You can say Next Haiku.  Categories.  Or <break time='0.25s'/> More Choices.  Which would you like? </speak>"
            )
            .reprompt(
                "<speak> You can say Next Haiku.  Categories.  Or <break time='0.25s'/> " +
                "Help.  Which would you like? </speak>"
            )
            .shouldEndSession(false);
    }
);

skill.intent('BrandElements',
    {
        "utterances": [
            "Brand Elements",
            "Strategy"
        ]
    },
    function (request, response) {
        response
            .say(
                "<speak> <audio src=\"https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Six.mp3\" /> " +
                "You can say Next Haiku.  Categories.  Or <break time='0.25s'/> More Choices.  Which would you like? </speak>"
            )
            .reprompt(
                "<speak> You can say Next Haiku. Categories Or <break time='0.25s'/> Help. Which would you like? </speak>"
            )
            .shouldEndSession(false);
    }
);

skill.intent('BenefitsOfAStrongBrand',
    {
        "utterances": [
            "Benefits Of A Strong Brand",
            "Strong Brand",
            "Benefits"
        ]
    },
    function (request, response) {
        response
            .say(
                "<speak> <audio src=\"https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Three.mp3\" /> " +
                "You can say Next Haiku.  Categories.  Or <break time='0.25s'/> More Choices.  Which would you like? </speak>"
            )
            .reprompt(
                "<speak> You can say Next Haiku.  Categories.  Or <break time='0.25s'/> Help.  Which would you like? </speak>"
            )
            .shouldEndSession(false);
    }
);

skill.intent('WhatIsABrandHaiku',
    {
        "utterances": [
            "What Is A Brand Haiku",
            "Brand Haiku",
            "What's A Brand Haiku"
        ]
    },
    function (request, response) {
        response
            .say(
                "<speak> Benson Brand Strategy published the book 57 Brand Haikus in 2015. Each of the 57 brand haikus " +
                "is succinct <break time='0.5s'/> approximately 60 words. While not formal haikus in structure, " +
                "they each follow the same guiding principles of brevity and thoughtfulness.  " +
                "The haikus describe how to build and sustain a brand, and how customers think, " +
                "behave, and choose brands. Considered collectively, the 57 haikus convey the authority, " +
                "competitive advantage, and value of owning a strong and favorable brand<break time='1.0s'/>  " +
                "You can say, Play Haiku<break time='0.25s'/>  Or<break time='0.25s'/> " +
                "About The Author.  Which would you like? </speak>"
            )
            .reprompt(
                "<speak> You can say, Play Haiku<break time='0.25s'/>  About The Author. Or<break time='0.25s'/> " +
                "Help.  Which would you like? </speak>"
            )
            .shouldEndSession(false);
    }
);

skill.intent('AboutTheAuthor',
    {
        "utterances": [
            "About The Author",
            "About"
        ]
    },
    function (request, response) {
        response
            .say(
                "<speak> You can say Author Bio <break time='0.5s'/>  Hollywoods Lesson <break time='0.5s'/>   " +
                "Haiku Background.  Or<break time='0.25s'/>  Contact Info.  Which would you like? </speak>"
            )
            .reprompt(
                "<speak> You can say Author Bio <break time='0.5s'/>  Hollywoods Lesson <break time='0.5s'/>   " +
                "Haiku Background.  Contact Info.  Or<break time='0.25s'/>  Help.  Which would you like? </speak>"
            )
            .shouldEndSession(false);
    }
);


skill.intent('AuthorBio',
    {
        "utterances": [
            "Author Bio",
            "Bio"
        ]
    },
    function (request, response) {
        response
            .say(
                "<speak> <audio src=\"https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Author_Bio.mp3\" /> " +
                "You can say Hollywood's Lesson.  Haiku Background.  Contact Info. Or <break time='0.25s'/> " +
                " More Choices.  Which would you like? </speak>"
            )
            .reprompt(
                "<speak>  You can say Hollywood's Lesson.  Haiku Background.  Contact Info. Or <break time='0.25s'/>  " +
                "Help.  Which would you like? </speak>"
            )
            .shouldEndSession(false);
    }
);

skill.intent('HollywoodsLesson',
    {
        "utterances": [
            "Hollywoods Lesson",
            "Hollywood's Lesson"
        ]
    },
    function (request, response) {
        response
            .say(
                "<speak> Most brand strategists are trained as marketers, designers, or writers.  " +
                "Joseph Benson was trained to make movies.  Movies are stories. Brands are stories.  " +
                "The difference is that people incorporate brands into their personal stories.  " +
                "Creating the narrative, visual imagery, and audio expression of a great brand story " +
                "is very similar to the process of creating the script and film set for a movie.  " +
                "You can say Author Bio.  Haiku Background.  Contact Info.  Or <break time='0.25s'/> " +
                "More Choices.  Which would you like? </speak>"
            )
            .reprompt(
                "<speak> You can say Author Bio.  Haiku Background.  Contact Info.  Or <break time='0.25s'/> " +
                "Help.  Which would you like? </speak>"
            )
            .shouldEndSession(false);
    }
);

skill.intent('HaikuBackground',
    {
        "utterances": [
            "Haiku Background",
            "Background"
        ]
    },
    function (request, response) {
        response
            .say(
                "<speak> <audio src=\"https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Haiku_Background.mp3\" /> " +
                "You can say Author Bio.  Hollywood's Lesson.  Contact Info.  Or <break time='0.25s'/>  More Choices. " +
                " Which would you like? </speak>"
            )
            .reprompt(
                "<speak> You can say Author Bio.  Hollywood's Lesson.  Contact Info.  Or <break time='0.25s'/>  " +
                "Help.  Which would you like? </speak>"
        )
            .shouldEndSession(false);
    }
);

skill.intent('ContactInfo',
    {
        "utterances": [
            "Contact Info",
            "Contact"
        ]
    },
    function (request, response) {
        response
            .say(
                "<speak> <audio src=\"https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Contact_Info.mp3\" /> " +
                "You can say Author Bio.  Hollywood's Lesson.  Haiku Background.  Or <break time='0.25s'/>  More Choices. " +
                " Which would you like? </speak>"
            )
            .reprompt(
                "<speak> You can say Author Bio.  Hollywood's Lesson.  Haiku Background.  Or <break time='0.25s'/>  " +
                "Help.  Which would you like? </speak>"
            )
            .shouldEndSession(false);
    }
);

skill.error = function(exception, request, response) {
        console.log("Skill Exception: "+exception);
        response
            .say("<speak> I'm sorry, I didn't get that. Please say it again, or <break time='0.25s'/> " +
                "you can say help.<break time='0.25s'/> What would you like to do?</speak> ");
        response.send(exception);
};

// Expose the lambda
exports.handler = skill.lambda();

// Print schema and utterances when launched (don't put it in the lambda)
// console.log(skill.schema());
// console.log(skill.utterances());

