# High Priority
What parameters should be passed?
    Use key-value args for startup
 
Some times does not reply right away?
    What is that about?
    Seems like it may be startup time on the server?
    
Add url configurator command
 
Add docs on URL configuration

Add help command

Clean up dependencies

Add a license

Move to public repo

# Lower priority
Add more comments and tests

Handle two people registering with the same ID

Handle chunked message reply from proxied service more exactly
    Is probably doing a double callback, which could be a problem

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
Is there a way to do absolute references with typescript?

How to keep typings and packages aligned? What if the versions are different?

Should I use globals or local for typings? What difference does it really make?
    Supposedly globals might have namespace conflicts, but don't really understand this