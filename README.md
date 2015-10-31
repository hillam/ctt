# ctt
Chrome Time Tracker is a Google Chrome extension that tracks time spent on sites
you visit.

This application is currently in development.

### Dev note:
I have realized a way to keep the current data structure in tact when sending to
the rails server. The structure is as follows:
```javascript
{
    facebook.com:   200,
    reddit.com:     184,
    ...
}
```

The ruby code to deal with this in my 'new time entry' rails controller can look
something like this:
```ruby
## before sending data to the server, I'll wrap the sites object into {'sites': {}}
params.require(:sites).each do |host,time|
    unless current_user.nil?
        # create an entry for a site entry for a given host/time pair
        current_user.sites.find_by(host: host).entries.create(time: time)
    end
end
```
