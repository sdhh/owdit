#!/usr/bin/env node
const subcommand = require("subcommand");
const defaultFormatter = require("../lib/formatters/default");
const owdit = require("..");

function usage()
{
  console.log(`
  usage: owdit [--flag]

  owdit checks your node modules for known vulnerabilities.
  owdit uses the dependencies entry from the package.json to find out which packages are installed.
  When there is a mismatch between what is installed in \`node_modules\` and what is specified
  in \`package.json\` an error is thrown. In that case \`npm prune\` can be used to clear any
  extraneous packages and \`npm install\` to install missing packages.

  Flags:
    --version (-v)            - Prints the owdit version
    --help (-h)               - Prints this.
    --output(-o) <formatter>  - Formats the output of owdit given the specified formatter

      The following formatters are currently available:

        ${defaultFormatter.key} - ${defaultFormatter.description}
  `);
}

function onCommand(args)
{
  if (args.version) {
    return console.log(require("../package.json").version);
  }
  if (args.help) {
    return usage();
  }

  owdit.check(process.cwd(), (err, vulnerabilityReport) => {
    if (err) {
      console.error(err);
      process.exitCode = -1;
    } else {
      console.log(args.output.format(vulnerabilityReport));
      process.exitCode = vulnerabilityReport.vulnerabilityCount;
    }
  });
}

const config = {
  root: {
    name: "",
    options: [
      {
        name: "version",
        abbr: "v",
        boolean: false
      }
    ],
    command: onCommand
  },
  commands: [],
  defaults: [
    {
      name: "help",
      boolean: true,
      abbr: "h",
      alias: "?"
    },
    {
      name: "output",
      boolean: false,
      default: defaultFormatter,
      abbr: "o"
    }
  ]
  // none: function (args) {
  //   usage();
  //   process.exit(1);
  // }
};

const route = subcommand(config);
route(process.argv.slice(2));
