const fs = require("fs");
const path = require("path");
const glob = require("glob");
const jsmediatags = require("jsmediatags");
const source = path.resolve(process.argv[2]);
const destination = path.resolve(process.argv[3]);
const books = glob.sync(source + "/**/*.mp3");

/**
 *
 * Usage: node ./open-audible-to-jellyfin.js /path/to/open-audible/books /path/to/jellyfin/media/Audiobooks
 * Author: @mbround18
 * arguements:
 *        1. path to open-audible books
 *        2. path to jellyfin media > Audiobooks folder
 *
 */

books.forEach(function (book) {
  jsmediatags.read(book, {
    onSuccess: function ({ tags: { artist } }) {
      const fileName = path.basename(book);
      console.log(`Processing: ${fileName} by ${artist}`);
      const filePath = path.join(destination, artist, fileName);
      if (!fs.existsSync(path.dirname(filePath))) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.copyFileSync(book, filePath);
        console.log(`Completed: ${fileName} by ${artist}`);
      } else {
        console.log(`Skipped: ${fileName} by ${artist}`);
      }
    },
    onError: function (error) {
      console.log(error);
    },
  });
});
