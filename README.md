# DrFetus
A custom bot created for the 0.1% Discord community.


## Configuration

For the bot to work, there needs to be a `config.json` file and `.env` file in the main directory.

### Example of `config.json`

```
{
    "DATABASE_URL": [
        {
            "symbol": database_name,
            "url": "mongodb://username:password@host_ip:host_port/database_name?authSource=auth_database_name"
        }
    ]
}
```
### Example of `.env`
```
ACCESS_TOKEN=SUPERsecretACCESStoken
DISCORD_TOKEN=iAMaSUPERsecretTOKENdoNOTgiveMEtoANYONE666
```

## Starting the bot

To work, bot requires a running mongoDB database.
- how to set up database:
- command for the mongo daemon: `mongod --auth --fork --port MONGO_PORT --bind_ip 0.0.0.0 --dbpath /var/lib/mongodb --logpath /var/lib/mongod.log`

How to start the bot on Ubuntu remote server:
- clone the repository - `git clone http://github.com/PointOnePercent/DrFetus`
- install dependencies - `npm install`
- don't forget to start mongoDB instance and set up the `config.json` file
- start the bot with `npm run fetus` command (or `forever start -c "npm run fetus" ./` if you want to rum daemon)

How to stop the daemon
- forever stop <process number>
- `ps -ef | grep fetus`
- `kill <PID>`

