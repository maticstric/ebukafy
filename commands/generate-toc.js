/*
 *  Generates the toc.xhtml and toc.ncx files.
 */

const path = require('path');
const fs = require('fs');
const parseArgs = require('minimist');
const replaceInFile = require('../utils/replace-in-file').replaceInFile;
const arabicToRoman = require('../utils/arabic-to-roman').arabicToRoman;

const USAGE = 'usage: generate-toc [-hi] epub_directory';
const ERR_STRING = 'Error in \'generate-toc\':';
const MISSING_TITLE_STRING = 'MISSING TITLE';

const TOC_NCX_ITEM =
`	<navPoint id="navpoint-ARABIC" playOrder="ARABIC">
		<navLabel>
			<text>TITLE</text>
		</navLabel>
		<content src="SOURCE"/>
	</navPoint>`

const TOC_XHTML_ITEM =
`	<li>
		<a href="SOURCE">TITLE</a>
	</li>`

exports.execute = async (args) => {
  args = processArgs(args);

  let epubDirectory = args._[0];

  if (!epubDirectory) {
    usage();
  }

  let tocNcx = await getTocNcx(epubDirectory);
  let tocXhtml = await getTocXhtml(epubDirectory);

  if (args['in-place']) {
    inPlaceToc(epubDirectory, tocNcx, tocXhtml);   
  } else {
    console.log('toc.ncx\n--------');
    console.log(tocNcx);
    console.log('\ntoc.xhtml\n--------');
    console.log(tocXhtml);
  }
}

const getTocXhtml = async (epubDirectory) => {
  let spine = await getSpine(epubDirectory);
  let spineItems = await getSpineItems(spine);

  let toc = '<ol>\n';

  for (let i = 0; i < spineItems.length; i++) {
    let spineItem = spineItems[i][0]; // [0] = full match

    let href = await getHrefFromSpineItem(epubDirectory, spineItem);
    let title = await getTitleFromHref(epubDirectory, href);

    let tocItem = TOC_XHTML_ITEM;

    if (title) {
      tocItem = tocItem.replace('TITLE', title);
    } else {
      tocItem = tocItem.replace('TITLE', MISSING_TITLE_STRING);
    }

    tocItem = tocItem.replace('SOURCE', href);

    toc += tocItem + '\n';
  }

  toc += '</ol>';

  return toc;
}

const getTocNcx = async (epubDirectory) => {
  let spine = await getSpine(epubDirectory);
  let spineItems = await getSpineItems(spine);

  let toc = '<navMap id="navmap">\n';

  for (let i = 0; i < spineItems.length; i++) {
    let spineItem = spineItems[i][0]; // [0] = full match

    let href = await getHrefFromSpineItem(epubDirectory, spineItem);
    let title = await getTitleFromHref(epubDirectory, href);

    let tocItem = TOC_NCX_ITEM;

    if (title) {
      tocItem = tocItem.replace('TITLE', title);
    } else {
      tocItem = tocItem.replace('TITLE', MISSING_TITLE_STRING);
    }

    tocItem = tocItem.replace('SOURCE', href);
    tocItem = tocItem.replace(/ARABIC/g, i + 1);

    toc += tocItem + '\n';
  }

  toc += '</navMap>';

  return toc;
}

const inPlaceToc = async (epubDirectory, tocNcx, tocXhtml) => {
  let tocNcxPath = path.resolve(epubDirectory, 'EPUB', 'toc.ncx');
  let tocXhtmlPath = path.resolve(epubDirectory, 'EPUB', 'toc.xhtml');

  let tocNcxRegex = /\s*<navMap\ id=\"navmap\">.*<\/navMap>/s;
  let tocXhtmlRegex = /\s*<ol>.*<\/ol>/s;

  // Modify tocs so that the indentation works out in the content.opf
  tocNcx = '\n\t' + tocNcx.split('\n').join('\n\t');
  tocXhtml = '\t\t' + tocXhtml;
  tocXhtml = '\n\t' + tocXhtml.split('\n').join('\n\t\t\t');

  await replaceInFile(tocNcxPath, [tocNcxRegex], [tocNcx]);
  await replaceInFile(tocXhtmlPath, [tocXhtmlRegex], [tocXhtml]);
}

const getSpineItems = (spine) => {
  let spineItemRegex = /<itemref.*?\/>/g
  let spineItems = Array.from(spine.matchAll(spineItemRegex));

  return spineItems;
}

const getHrefFromSpineItem = async (epubDirectory, spineItem) => {
  let manifest = await getManifest(epubDirectory);

  let idrefRegex = /<itemref\ idref=\"(.*)\"\/>/
  let idref = spineItem.match(idrefRegex)[1]; // [1] = first match
  idref = escapeRegExp(idref);

  let manifestItemRegex = new RegExp('<item.*id=\"' + idref + '\".*\/>');
  let manifestItem = manifest.match(manifestItemRegex)[0]; // [0] = full match

  let manifestHrefRegex = /href=\"(.*?)\"/;
  let manifestHref = manifestItem.match(manifestHrefRegex)[1]; // [1] = first match

  return manifestHref;
}

const getTitleFromHref = (epubDirectory, href) => {
  let filePath = path.resolve(epubDirectory, 'EPUB', href);

  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', function(err, data) {
      if(err) {
        console.error(`\n${ERR_STRING} ${err.message}`);
        usage();
      }

      let regex = /<title>(.*)<\/title>/;
       
      let title = data.match(regex);

      if (title) {
        title = title[1]; // [1] = first match
      } else {
        title = MISSING_TITLE_STRING;
      }

      resolve(title);
    });
  });
}

const getSpine = (epubDirectory) => {
  let contentOpfPath = path.resolve(epubDirectory, 'EPUB', 'content.opf');

  return new Promise((resolve, reject) => {
    fs.readFile(contentOpfPath, 'utf8', function(err, data) {
      if(err) {
        console.error(`\n${ERR_STRING} ${err.message}`);
        usage();
      }

      let regex = /<spine\ toc=\"ncx\">(.*)<\/spine>/s;
       
      let spine = data.match(regex)[1]; // The [1] means the first capture group

      resolve(spine);
    });
  });
}

const getManifest = (epubDirectory) => {
  let contentOpfPath = path.resolve(epubDirectory, 'EPUB', 'content.opf');

  return new Promise((resolve, reject) => {
    fs.readFile(contentOpfPath, 'utf8', function(err, data) {
      if(err) {
        console.error(`\n${ERR_STRING} ${err.message}`);
        usage();
      }

      let regex = /<manifest>(.*)<\/manifest>/s;
       
      let manifest = data.match(regex)[1]; // The [1] means the first capture group

      resolve(manifest);
    });
  });
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

const processArgs = (args) => {
  args = parseArgs(args, {
    alias: {
      'help': 'h',
      'in-place': 'i'
    },
    boolean: [
      'help',
      'in-place'
    ]
  });

  if (args.help) {
    usage();
  }

  return args;
}

const usage = () => {
  console.error(USAGE);
  process.exit(1);
}
