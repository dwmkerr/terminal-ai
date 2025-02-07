# terminal-ai

Effortless AI in your terminal.

[![main](https://github.com/dwmkerr/terminal-ai/actions/workflows/main.yml/badge.svg)](https://github.com/dwmkerr/terminal-ai/actions/workflows/main.yml) ![npm (scoped)](https://img.shields.io/npm/v/%40dwmkerr/terminal-ai) [![codecov](https://codecov.io/gh/dwmkerr/terminal-ai/graph/badge.svg?token=uGVpjGFbDf)](https://codecov.io/gh/dwmkerr/terminal-ai)

Quickly turn on, turn off, list, show costs and connect to your AWS instances. Great for saving costs by running servers in the cloud and starting them only when needed.

![Recording of a terminal session that shows Terminal AI in action](./docs/democast.svg)

## Quickstart

Install Terminal AI:

```bash
npm install @dwmkerr/terminal-ai
```

Run the tool to configure your environment and start interactively interfacing with AI:

```bash
ai
```

That's it.

Every feature can be used as a command or in an interactive session.

The quickest way to learn how to use the tool is to look at the [#examples](#examples). Each [command](#command) is documented below.

## Examples

WIP

## Commands

WIP

## Boxes


The following commands are available for `boxes`:

- [`boxes list`](#boxes-list) - shows all boxes and their status
- [`boxes run`](#boxes-run) - run a command on a box
- [`boxes start`](#boxes-list) - starts a box
- [`boxes stop`](#boxes-list) - stops a box
- [`boxes info`](#boxes-list) - shows info on a box
- [`boxes costs`](#boxes-costs) - shows the costs accrued by each both this month
- [`boxes import`](#boxes-import) - import and AWS instance and tag as a box

### `boxes list`

Run `boxes list` to show the details of boxes:

```bash
$ boxes list
steambox: stopped
  Name: Steam Box
torrentbox: running
  Name: Torrent Box
  DNS: ec2-34-221-110-58.us-west-2.compute.amazonaws.com
  IP: 34.221.110.58
```

### `boxes run`

The `run` command can be used to run any configured operation on a box. You can use it to quickly SSH into boxes, open pages in a browser or run any other command that can be run from a shell. Commands themselves are defined in the configuration file, either at the level of a box or globally for all boxes.

The syntax to run a command is below:

```
boxes run <boxId> <commandName> <parameters...>
```

Commands can be executed by providing the `-e` or `--exec` flag, and commands can copy data to the clipboard with the `-c` or `--copy-command` parameter.

Some examples for the configuration file are:


```
{
  "ssh": {
    "command": "ssh -i ${identity} ec2-user@${host} ${*}",
    "copyCommand": "ssh -i ${identity} ec2-user@${host} ${*}"
    "parameters": {
      "identity": "mykey.pem "
  },
  "dcv": {
    "command": "open -i mykey.pem dcv://Administrator@${host}:8443",
    "copyCommand": "${password}"
    "parameters": {
      "password": "<password>"
    }
  }
}
```

To SSH into a box and run `whoami` use:

```
boxes run ubuntu ssh 'whoami' -e
```

This will execute the `ssh` command. Pass `-c` to also copy that SSH command to the clipboard.

To open a DCV application to connect to a box use:

```
boxes run steambox dcv 'whoami' -ec
```

This will open the user's DCV app and copy a password to the clipboard.

Parameters for commands can be specified in the commands configuration or provided as arguments to the `run` command. Some parameter examples are:

| Parameter                   | Description                                               |
|-----------------------------|-----------------------------------------------------------|
| `${password}`               | The value of the `password` parameter in the config file. |
| `${0:user}`                 | The value of the first argument, which is called `user`.  |
| `${*}`                      | All arguments passed to the `run` command.                |
| `${instance.PublicDnsName}` | The host name of the AWS instance.                        |
| `${host}`                   | Shorthand for `${instance.PublicDnsName}`.                |
| `${ip}`                     | Shorthand for `${instance.PublicIpAddress}`.              |

Any of the variables on the AWS Instance object can be provided with an `instance` parameter, such as `${instance.PublicDnsName}`. Nested parameters from the AWS Instance are not yet supported.

Options:

- `--exec`: run the command in the current shell
- `--copy-command`: copy the `copyCommand` from the command configuration to the clipboard

Be cautious with the `--copy-command` parameter as the copy command will be shown in the console.

### `boxes start`

Run `boxes start <id>` to start a box:

```bash
$ boxes start steambox
  steambox (i-098e8d30d5e399b03): stopped -> pending
```

Options:

- `--wait`: wait for instance to complete startup
- `--yes`: [experimental] confirm restoration of archived volumes

Note that the restoration of archived volumes option is experimental and may cause data loss.

### `boxes stop`

Run `boxes start <id>` to stop a box:

```bash
$ boxes stop steambox
  steambox (i-098e8d30d5e399b03): running -> stopping
```

Options:

- `--wait`: wait for instance to complete shutdown
- `--archive-volumes`: [experimental] detach, snapshot and delete instance volumes

Note that the `--archive-volumes` option is experimental and may cause data loss.

### `boxes info`

Run `boxes info <id>` to show detailed info on a box:

```bash
$ boxes info steambox
{
  boxId: 'steambox',
  instanceId: 'i-098e8d30d5e399b03',
  name: 'Steam Box',
  status: 'stopping',
  instance: {
    AmiLaunchIndex: 0,
    ImageId: 'ami-0fae5ac34f36d5963',
    InstanceId: 'i-098e8d30d5e399b03',
    InstanceType: 'g4ad.xlarge',
...
```

### `boxes costs`

The `boxes costs` command shows the current costs accrued for each both this month. Note that calling the AWS API that gets these costs comes with a charge of $0.01 per call (at time of writing). To continue with the charge, pass the `--yes` parameter to this command.

You must ensure that the `boxes.boxId` tag is set up as a [Cost Allocation Tag](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/cost-alloc-tags.html) for costs to be reported, more information is at [Enabling Cost Reporting](#enabling-cost-reporting).

```bash
% boxes costs --yes
steambox: stopped
  Costs (this month): ~ 0.53 USD
torrentbox: stopped
  Costs (this month): ~ 0.05 USD
Non-box costs
  Costs (this month): ~ 36.92 USD
```

Additional parameters for `costs` are available:

| Parameter               | Description                                       |
|-------------------------|---------------------------------------------------|
| `-m`, `--month <month>` | Get costs for a specific month. 1=Jan, 2=Feb etc. |

### `boxes config`

Shows the current configuration that has been loaded for `boxes`. Can be helpful for troubleshooting whether things like the region are set properly:

```bash
% boxes config
{
  "boxes": ...
  "aws": {
    "region": "us-west-2"
  }
}
```

### `boxes import`

Imports an AWS instance and tags as a box, also tags its attached volumes.

```bash
% boxes import i-066771b1f0f0668af ubuntubox
  ubox (i-066771b1f0f0668af): imported successfully
```

Options:

- `--overwrite`: overwrite tags on existing instances/volumes

## Configuration

A local `boxes.json` file can be used for configuration. The following values are supported:

```
{
  "boxes": {
    /* box configuration */
  },
  "aws": {
    "region": "us-west-2"
  },
  "archiveVolumesOnStop": true,
  "debugEnable": "boxes*"
}
```

Box configuration is evolving rapidly and the documentation will be updated. The AWS configuration is more stable.

## Enabling Cost Reporting

If you want to be able to show the costs that are associated with each box, you will need to:

1. Tag each box and the resources associated with the box with the `boxes.boxid` tag
2. Activate the `boxes.boxid` tag as a cost allocation tag
3. Re-create all of the resources associated with the tag, so that AWS starts collecting cost information
4. Wait 24 hours for AWS to start processing data

## AWS Configuration

Boxes will use whatever is the currently set local AWS configuration.

Boxes manages EC2 instances that have a tag with the name `boxes.boxid`.

## Managing and Reducing Costs

As long as you have followed the [Enable Cost Reporting](#enabling-cost-reporting) guide, then most of the costs associated with a box should be tracked. However, some costs which seem to not be tracked but potentially can be material are:

- EBS instances

### Snapshot Storage

When you turn off EC2 instances, EBS devices will still be attached. Although the instance will no longer accrue charges, you EBS devices will.

To save costs, you can detach EBS devices from stopped instances, snapshot it, delete the device, then re-create the device and re-attach as needed before you restart the instance. However, this is fiddle and time consuming.

Boxes can take care of this for you - when you stop a box, just pass the `-d` or `--detach-and-archive` flag to detach and block storage devices. They will be snapshotted and boxes will restore and re-attach the devices automatically when you restart them.

Boxes puts tags on the instance to track the details of the devices which must be restored - not that if you restart the instance yourself you will have to recreate the devices yourself too, so detaching/archiving is easier if you only use Boxes to manage the device.

## Developer Guide

Clone the repo, install dependencies, build, link, then the `boxes` command will be available:

```bash
git clone git@github.com:dwmkerr/boxes.git
# optionally use the latest node with:
# nvm use --lts
npm install
npm run build
npm link boxes # link the 'boxes' command.

# Now run boxes commands such as:
boxes list

# Clean up when you are done...
npm unlink
```

The CLI uses the current local AWS configuration and will manage any EC2 instances with a tag named `boxes.boxid`. The value of the tag is the identifier used to manage the specific box.

Note that you will need to rebuild the code if you change it, so run `npm run build` before using the `boxes` alias. A quick way to do this is to run:

```bash
npm run relink
```

If you are developing and would like to run the `boxes` command without relinking, just build, link, then run:

```bash
npm run build:watch
```

This will keep the `./build` folder up-to-date and the `boxes` command will use the latest compiled code. This will *sometimes* work but it might miss certain changes, so `relink` is the safer option. `build:watch` works well if you are making small changes to existing files, but not if you are adding new files (it seems).

### Debugging

The [`debug`](https://github.com/debug-js/debug) library is used to make it easy to provide debug level output. Debug logging to the console can be enabled with:

```bash
AI_DEBUG_ENABLE="1" npm start
```

The debug namespaces can be configured like so:

```bash
AI_DEBUG_NAMESPACE='ai*'
```

### Debug Commands

**debug config** - show how the configuration has been constructed


### Error Handling

To show a warning and terminate the application, throw a `TerminatingWarning` error:

```js
import { TerminatingWarning } from "./errors.js";
throw new TerminatingWarning("Your AWS profile is not set");
```

### Terminal Recording / asciinema

To create a terminal recording for the documentation:

- Install [asciinema](https://asciinema.org/) `brew install asciinema`
- Check that you have your profiles setup as documented in `./scripts/record-demo.sh`
- Run the script to start a 'clean' terminal `./scripts/record-demo.sh`
- Download your recording, e.g. to `./docs/620124.cast`
- Install [svg-term-cli](https://github.com/marionebl/svg-term-cli) `npm install -g svg-term-cli`
- Convert to SVG: `svg-term --in ./docs/620124.cast --out docs/democast.svg --window --no-cursor --from=1000`

The demo script is currently:

- `boxes ls`
- `boxes start steambox`
- `boxes costs --yes`
- `boxes ssh torrentbox`
- `boxes stop steambox`
- `boxes ls`

### Concepts

**Actions** - these are commander.js functions that are called by the CLI. They should validate/decode parameters and ask for missing parameters. They will then call a **command**.
**Commands** - these are the underlying APIs that the CLI offers - they are agnostic of the command line interface (and could therefore be exposed in a web server or so on).

## Design Goals

- **Interactive by default** - with no input, `ai` is friendly and interactive. Everything that can be done interactively can be done non-interactively. Interactive operations hint at how to run non-interactively.

## TODO

Quick and dirty task-list.

- [x] base ok boxes
- [ ] interactive by default
- [ ] nth: 'vanilla' flag (no prompts)
- [ ] really user friendly way to get API key set
- [ ] we can check first time run via presence of config file
- [ ] Input: <prompt>: input
- [ ] Call from vi example
- [ ] Put in effective shell chapter
- [ ] Check competitors
- [ ] Spinners
- [ ] Interactive mode shows prompt in green press up down to cycle modes
- [ ] Chat mode default
- [ ] Output: file -suggestion name and format eg ics 
- [ ] Clipboard
- [ ] Structure: context prompt / input prompt / text / output mode
- [ ] GitHub mode
- [ ] Vanilla mode
- [ ] Online instructions for api key
- [ ] Videos on LinkedIn
- [ ] When code is shown offer copy command
- [ ] Execution context tty 
- [ ] Location specific prompts, eg create a .ai folder, include prompts in it, tai shows them
- [ ] docs: readline/prompt input keyboard shortcuts (cancel, copy, etc)
- [ ] nth: unhandled error prettier printing
