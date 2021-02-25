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

const TOC_NCX_ITEM =
`	<navPoint id="navpoint-ARABIC" playOrder="ARABIC">
		<navLabel>
			<text>ROMAN</text>
		</navLabel>
		<content src="text/SOURCE"/>
	</navPoint>`

const TOC_XHTML_ITEM =
`	<li>
		<a href="text/SOURCE">ROMAN</a>
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

const getTocXhtml = async (epubDirectory) => {
  let spine = await getSpine(epubDirectory);

  let regex = /<itemref\ idref=\"(.*)\"\/>/g
  let spineItems = Array.from(spine.matchAll(regex));

  let toc = '<ol>\n';

  for (let i = 0; i < spineItems.length; i++) {
    let tocItemName = spineItems[i][1]; // Get capture groups from each

    tocItem = TOC_XHTML_ITEM.replace('ROMAN', arabicToRoman(i + 1));
    tocItem = tocItem.replace('SOURCE', tocItemName);

    toc += tocItem + '\n';
  }

  toc += '</ol>';

  return toc;
}

const getTocNcx = async (epubDirectory) => {
  let spine = await getSpine(epubDirectory);

  let regex = /<itemref\ idref=\"(.*)\"\/>/g
  let spineItems = Array.from(spine.matchAll(regex));

  let toc = '<navMap id="navmap">\n';

  for (let i = 0; i < spineItems.length; i++) {
    let tocItemName = spineItems[i][1]; // Get capture groups from each

    let tocItem = TOC_NCX_ITEM.replace(/ARABIC/g, i + 1);
    tocItem = tocItem.replace('ROMAN', arabicToRoman(i + 1));
    tocItem = tocItem.replace('SOURCE', tocItemName);

    toc += tocItem + '\n';
  }

  toc += '</navMap>';

  return toc;
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
