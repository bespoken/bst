/**
 * Created by bvizy on 9/23/16.
 */

/**
 * Provide enumerated items (json). Could be an RSS feed or whatever.
 *
 * @type {{findItem, randomItem}}
 */
var dataProvider = (function () {
    var items = [
        {
            "tags": "cool,whatever",
            "url": "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-One.mp3"
        },
        {
            "tags": "cool,whatever",
            "url": "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Two.mp3"
        },
        {
            "tags": "cool,whatever",
            "url": "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Three.mp3"
        },
        {
            "tags": "cool,whatever",
            "url": "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Four.mp3"
        },
        {
            "tags": "cool,whatever",
            "url": "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Five.mp3"
        },
        {
            "tags": "cool,whatever",
            "url": "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Six.mp3"
        },
        {
            "tags": "cool,whatever",
            "url": "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Seven.mp3"
        },
        {
            "tags": "cool,whatever",
            "url": "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Eight.mp3"
        },
        {
            "tags": "cool,whatever",
            "url": "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Nine.mp3"
        },
        {
            "tags": "cool,whatever",
            "url": "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Ten.mp3"
        },
        {
            "tags": "cool,whatever",
            "url": "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Eleven.mp3"
        },
        {
            "tags": "cool,whatever",
            "url": "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Twelwe.mp3"
        },
        {
            "tags": "cool,whatever",
            "url": "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Thirteen.mp3"
        },
        {
            "tags": "cool,whatever",
            "url": "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Fourteen.mp3"
        },
        {
            "tags": "cool,whatever",
            "url": "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Fifteen.mp3"
        },
        {
            "tags": "cool,whatever",
            "url": "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Sixteen.mp3"
        },
        {
            "tags": "cool,whatever",
            "url": "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Seventeen.mp3"
        },
        {
            "tags": "cool,whatever",
            "url": "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Eighteen.mp3"
        },
        {
            "tags": "cool,whatever",
            "url": "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Nineteen.mp3"
        },

        {
            "tags": "cool,whatever",
            "url": "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Twenty.mp3"
        },
        {
            "tags": "cool,whatever",
            "url": "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Twenty-One.mp3"
        },
        {
            "tags": "cool,whatever",
            "url": "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Twenty-Two.mp3"
        },
        {
            "tags": "cool,whatever",
            "url": "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Twenty-Three.mp3"
        },
        {
            "tags": "cool,whatever",
            "url": "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Twenty-Four.mp3"
        },
        {
            "tags": "cool,whatever",
            "url": "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Twenty-Five.mp3"
        },
        {
            "tags": "cool,whatever",
            "url": "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Twenty-Six.mp3"
        },
        {
            "tags": "cool,whatever",
            "url": "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Twenty-Seven.mp3"
        },
        {
            "tags": "cool,whatever",
            "url": "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Twenty-Eight.mp3"
        },
        {
            "tags": "cool,whatever",
            "url": "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Twenty-Nine.mp3"
        },

        {
            "tags": "cool,whatever",
            "url": "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Thirty-.mp3"
        },
        {
            "tags": "cool,whatever",
            "url": "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Thirty-One.mp3"
        },
        {
            "tags": "cool,whatever",
            "url": "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Thirty-Two.mp3"
        },
        {
            "tags": "cool,whatever",
            "url": "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Thirty-Three.mp3"
        },
        {
            "tags": "cool,whatever",
            "url": "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Thirty-Four.mp3"
        },
        {
            "tags": "cool,whatever",
            "url": "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Thirty-Five.mp3"
        },
        {
            "tags": "cool,whatever",
            "url": "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Thirty-Six.mp3"
        },
        {
            "tags": "cool,whatever",
            "url": "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Thirty-Seven.mp3"
        },
        {
            "tags": "cool,whatever",
            "url": "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Thirty-Eight.mp3"
        },
        {
            "tags": "cool,whatever",
            "url": "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Thirty-Nine.mp3"
        },

        {
            "tags": "cool,whatever",
            "url": "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Forty.mp3"
        },
        {
            "tags": "cool,whatever",
            "url": "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Forty-One.mp3"
        },
        {
            "tags": "cool,whatever",
            "url": "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Forty-Two.mp3"
        },
        {
            "tags": "cool,whatever",
            "url": "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Forty-Three.mp3"
        },
        {
            "tags": "cool,whatever",
            "url": "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Forty-Four.mp3"
        },
        {
            "tags": "cool,whatever",
            "url": "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Forty-Five.mp3"
        },
        {
            "tags": "cool,whatever",
            "url": "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Forty-Six.mp3"
        },
        {
            "tags": "cool,whatever",
            "url": "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Forty-Seven.mp3"
        },
        {
            "tags": "cool,whatever",
            "url": "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Forty-Eight.mp3"
        },
        {
            "tags": "cool,whatever",
            "url": "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Forty-Nine.mp3"
        },

        {
            "tags": "cool,whatever",
            "url": "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Fifty.mp3"
        },
        {
            "tags": "cool,whatever",
            "url": "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Fifty-One.mp3"
        },
        {
            "tags": "cool,whatever",
            "url": "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Fifty-Two.mp3"
        },
        {
            "tags": "cool,whatever",
            "url": "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Fifty-Three.mp3"
        },
        {
            "tags": "cool,whatever",
            "url": "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Fifty-Four.mp3"
        },
        {
            "tags": "cool,whatever",
            "url": "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Fifty-Five.mp3"
        },
        {
            "tags": "cool,whatever",
            "url": "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Fifty-Six.mp3"
        },
        {
            "tags": "cool,whatever",
            "url": "https://s3.amazonaws.com/xapp-files/Alexa_Skills/Brand_Haiku/Brand_Haiku-Fifty-Seven.mp3"
        }
    ];

    return {
        /**
         * Find one with index
         *
         * @param number
         * @returns {{tags, url}|*}
         */
        findItem: function (number) {
            return items[number];
        },

        /**
         * Find a random one, optionally with a tag
         *
         * @param tag
         * @returns {{tags, url}|*}
         */
        randomItem: function (tag) {
            if (tag) {
                // TODO: Implement it ...
                return items[1];
            } else {
                return items[2];
            }
        }
    };

})();

module.exports = dataProvider;