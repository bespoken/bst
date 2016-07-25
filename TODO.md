# High Priority
Handle multiple registrations of same node
    How to make this secure?
    Auto-generate IDs
    
Add lots of tests for lambda runner

Figure out which license to use
    Include at the top of the file
    
Add init function
    Creates config file - generates ID
    
Change @ symbols to angles in tutorials
    Add examples
    
Make Lambda runner robust

Add auto-reload on Lambda

Move to public repo

Need to remove this file and developer before distributing?

# Medium
Add better docs for each command
    Use the readthedocs.org
  
Add support for auto-recompile in Sample Java project

Print out bst version number on start

Create diagrams for it

Figure out how to do whole project recompile
    
Add debug level
    Set in config?
    
# Lower priority
Add more comments and tests

Add socket labels

Better sockethandler tests
    Better mocks? Or use actual sockets?
    
What to do with Alexa request signatures?

Add npmignore to publish less NPM stuff

Figure out how to do batch lint

Automate publishing

Handle chunked message reply from proxied service more exactly
    Is probably doing a double callback, which could be a problem

Figure out how to use colors with Winston and 

Prevent hacking of service?

Figure out how to get real IP addresses on AWS
    There is a proxy mode for load balancer we can use I think
    
Factor part of webhook request into http message class?

Do I need to close sockets once replies are sent? (SourceSocket.end() in Node)

Figure out how to run unit tests as ts files (rather than js)

Add unique ID for webhook connections

Figure out how to pass-thru the original calling IP to bespoke-client

Added npm install step to docker file?
 
** IDE

** Design
Store off which node instance is managing which connection (assumes multiple BSS instances)

Pick out a logging library

Figure out how to handle signing from AWS


** Investigate
How to keep typings and packages aligned? What if the versions are different?

Should I use globals or local for typings? What difference does it really make?
    Supposedly globals might have namespace conflicts, but don't really understand this