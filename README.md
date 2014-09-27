# doomsday

**Ship software like the universe is about to end.**

![](http://samsite.stuffandymakesco.netdna-cdn.com/wp-content/uploads/2011/01/IMG_0967.jpg)

Doomsday is a project aiming to deploy software using the Sparkfun 
[Big Red Dome Button](https://www.sparkfun.com/products/9181) and a
[Raspberry Pi](http://www.raspberrypi.org/). You know your SaaS shop is really a
badass code factory, and you need a badass button to let everyone know you're
pushing to production. That's where Doomsday comes in.

### Step 1: Choose a plugin (or build your own)

You can configure Doomsday in a `~/.doomsdayrc` file. This is a JSON formatted
file containing the following keys:

`plugin` - The plugin you want to use.
`plugin_opts` - Any options that must be passed to the plugin at run time.

The only deploy system currently supported is
[Dreadnot](https://github.com/racker/dreadnot).

### Step 2: Configure Doomsday

#### Dreadnot configuration

Set `plugin` to `"dreadnot"`. The following plugin options are accepted:

- `ssl` - Set this to true if your Dreadnot server is behind HTTPS.
- `host` - Your Dreadnot server's host name.
- `username` - Your Dreadnot username.
- `password` - Your Dreadnot password.
- `stack` - The Dreadnot stack you want to deploy.
- `region` - The region you want to deploy to.

### Plugin API

Each plugin should export an object with a single
`deploy(logger, options, callback)` method. Plugins are encouraged to log in
detail what is happening with the deployment and should log to the provided
logger, which is a [Winston](https://github.com/flatiron/winston) logger. The
`options` are passed directly from `~/.doomsdayrc`. Plugins should propagate
errors immediately in the standard Node style, but should not call back with
success until the deployment is finished. This will allow Doomsday to flash the
button until the deploy succeeds.

Photo credit:
http://stuffandymakes.com/2011/01/08/hack-the-sparkfun-big-red-dome-button/
