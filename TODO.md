Figure out why the thing stops working some times
    Better tracing?
    
Handle chunked message reply from proxied service more exactly
    Is probably doing a double callback, which could be a problem

Add mocks for testing sockethandler and bespoke client

Add unique ID for webhook connections

Get unit tests passing

Add tslint

Auto-assign node ID

Figure out how to run unit tests as ts files (rather than js)

Look into BDD best practices

Figure out how to pass-thru the original calling IP to bespoke-client
    
Factor part of webhook request into http message class?

Move main routine to bin?

Do I need to close sockets once replies are sent? (SourceSocket.end() in Node)

Added npm install step to docker file?

Figure out how to make this available
    Structure of project - what should be in what repository
    Do we open-source the server-side piece?
    Make available via npm?   
 
What parameters should be passed?
    Use key-value args for startup

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