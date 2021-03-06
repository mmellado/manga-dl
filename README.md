# manga-dl

Node script to download manga from FunManda in PDF format

## Install

I didn't want to publish this script to NPM, so you'll have to install it directly from this repository

```bash
npm install -g mmellado/manga-dl
```
Files are downloaded to `~/manga-dl/[manga name]`

> Note: This has not been tested on Windows, but should work fine on any Unix system.

## Usage

You can download any Manga that is available in [FunManga](https://funmanga.com). All you have to do is find it there, and grab the name from the url. (`https://www.funmanga.com/one-piece1` => `one-piece1`)

### Download all chapters

```bash
manga-dl [manga name]
```

### Download a specific chapter

```
manga-dl [manga-name] -c [chapter number]
```

### Example - All chapters

```bash
manga-dl one-piece1
```

### Example - Single chapter

If you only wanted chapter 50

```bash
manga-dl one-piece1 -c 50
```
