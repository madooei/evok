# Examples Using `@madooei/evok`

Several example showing how to use `@madooei/evok`.

## Setup

```bash
npm install
```

## Run the Example

```bash
npx tsx src/demo-01.ts # and so on...
``` 

## How does it work?

The `@madooei/evok` is a local package that is installed using the `file:` protocol; see the `dependencies` section in the `package.json` file:

```json
  "dependencies": {
    "@madooei/evok": "file:../../packages/evok"
  },
```

If you want to use the package through NPM, you can do so by changing the `dependencies` section in the `package.json` file to:

```json
  "dependencies": {
    "@madooei/evok": "latest"
  },
```

Then install the dependencies again and it will be installed through NPM (assuming you have published the package to NPM).
