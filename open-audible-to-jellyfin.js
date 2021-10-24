const fs = require("fs");
const path = require("path");
const glob = require("glob");
const jsmediatags = require("jsmediatags");
const source = path.resolve(process.argv[2]);
const destination = path.resolve(process.argv[3]);
let books = glob.sync(source + "/**/*.mp3");

/**
 *
 * Usage: node ./open-audible-to-jellyfin.js /path/to/open-audible/books /path/to/jellyfin/media/Audiobooks
 * Author: @mbround18
 * arguements:
 *        1. path to open-audible books
 *        2. path to jellyfin media > Audiobooks folder
 *
 */

async function main() {
  books = await Promise.all(
    books.map(async function (book) {
      return new Promise(function (resolve, reject) {
        jsmediatags.read(book, {
          onSuccess: function ({ tags: { artist } }) {
            resolve({
              source: book,
              destination: path.join(destination, artist, path.basename(book)),
              artist: artist,
              title: path.basename(book, ".mp3"),
            });
          },
          onError: function (error) {
            reject(error);
          },
        });
      });
    })
  );
  /**
   * @typedef Book
   * @type {object}
   * @property {string} source - path to mp3 file
   * @property {string} destination - path to destination folder
   * @property {string} artist - artist name
   * @property {string} title - title of book
   */

  books.forEach(
    /**
     *
     * @param {Book} book
     */
    function (book) {
      if (!fs.existsSync(book.destination)) {
        console.log(`Copying ${book.source} to ${book.destination}`);
        fs.mkdirSync(path.dirname(book.destination), { recursive: true });
        fs.copyFileSync(book.source, book.destination);
      } else {
        console.log(`${book.destination} already exists`);
      }
    }
  );
}

main().then(console.log).catch(console.error);
