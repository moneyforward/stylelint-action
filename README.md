# Code review using stylelint

Analyze code statically by using [stylelint](https://stylelint.io/) in Github actions

## Inputs

### `files`

Specify patterns by glob

(Multiple patterns can be specified by separating them with line feed)

### `options`

Changes `stylelint` command line options.

Specify the options in JSON array format.
e.g.: `'["-s", "css"]'`

### `working_directory`

Changes the current working directory of the Node.js process

### `reporter_type_notation`

Change the reporter.

(Multiple can be specified separated by commas)

## Example usage

```yaml
name: Analyze code statically
"on": pull_request
jobs:
  stylelint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Analyze code statically using stylelint
        uses: moneyforward/stylelint-action@v0
```

## Contributing
Bug reports and pull requests are welcome on GitHub at https://github.com/moneyforward/stylelint-action

## License
The gem is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
