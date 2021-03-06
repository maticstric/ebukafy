# ebukafy

A collection of tools used to convert html or text files into ebooks.

# Installation

`npm install ebukafy --save`

# Usage

`ebukafy [-hv] command [args ...]`

To use `ebukafy` look at the list of commands/tools in the [Tools](#tools) section below. The arguments needed change based on the command.

Normal use of `ebukafy` would look something like this:

1. Download some html that you want to convert into an ebook with a tool like `wget`
2. Run `ebukafy create-skeleton` to create a skeleton of an epub directory
3. Put the downloaded html into the `EPUB/text` directory of the skeleton
4. Since most html files online will have a bunch of cruft at the beginning of the book, at the end of the book, and between the chapters, remove everything that you won't need. You essentially just want to keep all the paragraph tags: the actual text of the book
5. Run `ebukafy split` to split the big html file into multiple files with correct headers
6. You can use `ebukafy smarten-quotes` to convert any straight quotes to curly/smart quotes
7. After all the xhtml files in the `EPUB/text` directory are as you want them to be, run `ebukafy generate-manifest` and `ebukafy generate-spine` to populate the manifest and spine tags in the `content.opf` file. While the manifest should be good as is, the spine needs to be reordered *in reading order*, not alphabetical as is the default (more info in the [generate-spine README](#ebukafy-generate-spine)). This is also a good time to add any extra metadata you might find useful in the metadata tag of the `content.opf` file. [Here](https://wiki.mobileread.com/wiki/Metadata#ePUB_metadata) are some examples of what you can add
8. Run `ebukafy generate-toc` to generate the table of contents from the spine done in the previous step
9. Optionally replace the cover image. The one provided in the skeleton is just an all black 1400 x 2100 jpg. To change it just replace the cover in the `EPUB/images` directory. Keep the name as `cover.jpg` or manually edit `content.opf` if you know what you're doing
10. After everything is done run `ebukafy build` to build this epub folder into an actual epub file
11. Before reading, run `ebukafy epubcheck` to make sure everything within the epub is up to the specification of the epub standard and fix any errors
12. To read on a kobo or kindle please use a tool like [Calibre](https://calibre-ebook.com/) to convert the book to the appropriate format (kepub and azw3 respectively)

# Tools

Note that to run any of these tools you need to precede them with `ebukafy` (e.g. if you want to run `create-skeleton`, you need to run `ebukafy create-skeleton`).

- ### `ebukafy build`
      NAME
           build -- builds the epub directory into an epub file

      SYNOPSIS
           build [-h] [-o output_file] epub_directory

      DESCRIPTION
           This tool builds the epub directory into an actual epub file. Ignoring
           a few important details, this is essentially done by zipping up 
           the folder. Additionally, this updates the mandatory 'dcterms:modified'
           value in the content.opf file.

           The options are as follows:

           -h       Display usage statement. 
       
           -o       Optional. Set the outputed epub to be called something
                    other than 'output.epub', which is the default.

      EXAMPLES
           Note that the 'epub directory' is actually the parent directory of the
           'EPUB' directory. In other words, the command should be run in this
           directory:
           
           epub-directory/
              mimetype
              META-INF/
                container.xml
              EPUB/
                [etc]

           To build just go into 'epub-directory' and run 
           
                build -o homer_the-odyssey.epub .

- ### `ebukafy create-skeleton`
      NAME
           create-skeleton -- creates a skeleton epub directory

      SYNOPSIS
           create-skeleton [-h] [-a author] [-u uid] -l language -t title 
           target_directory

      DESCRIPTION
           This tool creates a new skeleton of an epub directory at target_directory
           The contents of this skeleton folder can be found at the GitHub 
           repository. According to the epub standard the uid, title, and language
           are all required. Including the author is just good practice.

           The options are as follows:

           -h       Display usage statement. 
       
           -a       Optional. Set the author of the book. 

           -u       Optional. Set uid manually. If not set, it will be
                    randomly generated. A uid is mandatory according to the
                    epub standard.

           -l       Set the language of the book. This should be the IANA language
                    tag. If you don't know the tag for a language look up 'IANA 
                    Language Subtag Registry'.

           -t       Set the title of the book.

      EXAMPLES
           To create an epub skeleton in the current working directory you can run
           
                create-skeleton -a Homer -l grc -t 'The Odyssey' .

           Note the '' around the title since it's two words.

- ### `ebukafy epubcheck`
      NAME
           epubcheck -- checks for any errors regarding the epub specification

      SYNOPSIS
           epubcheck [-h] target_epub

      DESCRIPTION
           epubcheck is a tool which 'validates the conformance of EPUB 
           publications against the EPUB specifications.' The GitHub repository
           for epubcheck can be found here: https://github.com/w3c/epubcheck
           Note that this tool is written in java so you need java to run it.
           It will output any errors or just say that your epub is up to standard.

           The options are as follows:

           -h       Display usage statement. 

      EXAMPLES
           To check if your epub conforms to the epub standards just run
           
                epubcheck homer_the-odyssey.epub

- ### `ebukafy generate-manifest`
      NAME
           generate-manifest -- generates the manifest part of the content.opf file

      SYNOPSIS
           generate-manifest [-hi] epub_directory

      DESCRIPTION
           This tool generates the manifest part of the content.opf file. It goes
           through the text, css, and images folders and the toc.ncx and toc.xhtml
           files and adds them as items between the two manifest tags. Without the
           'i' option it just prints it to stdout. With the 'i' option it
           replaces the manifest in-place.

           The options are as follows:

           -h       Display usage statement. 

           -i       Instead of outputting the manifest into stdout, it overwrites
                    the manifest in the actual content.opf file, in-place.

      EXAMPLES
           Note that the 'epub directory' is actually the parent directory of the
           'EPUB' directory. In other words, the command should be run in this
           directory:
           
           epub-directory/
              mimetype
              META-INF/
                container.xml
              EPUB/
                [etc]

           To generate the manifest just go into 'epub-directory' and run 
           
                generate-manifest -i .

- ### `ebukafy generate-spine`
      NAME
           generate-spine -- generates the spine part of the content.opf file

      SYNOPSIS
           generate-spine [-hi] epub_directory

      DESCRIPTION
           This tool generates the spine part of the content.opf file. It does
           this simply by going through the text folder. Without the 'i' option
           it just prints it to stdout. With the 'i' option it replaces 
           the spine in-place.

           NOTE: You will most likely want to manually reorder the spine. By 
           default it will order the spine in alphabetical order. So, for example,
           'chapter-10.xhtml' will come before 'chapter-2.xhtml'. However, 
           the spine needs to be in the order that the book is supposed to be read,
           so 'chapter-2.xhtml' should come before 'chapter-10.xhtml'.

           The options are as follows:

           -h       Display usage statement. 

           -i       Instead of outputting the spine into stdout, it overwrites
                    the spine in the actual content.opf file, in-place.

      EXAMPLES
           Note that the 'epub directory' is actually the parent directory of the
           'EPUB' directory. In other words, the command should be run in this
           directory:
           
           epub-directory/
              mimetype
              META-INF/
                container.xml
              EPUB/
                [etc]

           To generate the spine just go into 'epub-directory' and run 
           
                generate-spine -i .

           And don't forget to manually reorder it into reading order!

- ### `ebukafy generate-toc`
      NAME
           generate-toc -- generates the toc.ncx and toc.xhtml files

      SYNOPSIS
           generate-toc [-hio] epub_directory

      DESCRIPTION
           This tool generates toc.ncx and toc.xhtml files. Without the 'i'
           option it just prints it to stdout. With the 'i' option it replaces 
           the files in-place. This command looks at the <spine> tag in the
           content.opf file so make sure to run generate-spine before generating
           the table of contents.

           NOTE: The titles of each chapter are set as whatever is in the <title>
           tag. If the <title> tag is not present, the toc will simply say
           "MISSING TITLE".

           The options are as follows:

           -h       Display usage statement. 

           -i       Instead of outputting the toc into stdout, it overwrites
                    the tocs in the toc.xhtml and toc.ncx files, in-place.

      EXAMPLES
           Note that the 'epub directory' is actually the parent directory of the
           'EPUB' directory. In other words, the command should be run in this
           directory:
           
           epub-directory/
              mimetype
              META-INF/
                container.xml
              EPUB/
                [etc]

           You can generate the toc files like so:
           
                generate-toc -i .

           And make sure that the spine in the content.opf file is complete
           before you run generate-toc!

- ### `ebukafy smarten-quotes`
      NAME
           smarten-quotes -- convert straight quotes to smart quotes

      SYNOPSIS
           smarten-quotes [-h] target_file ...

      DESCRIPTION
           Online transcriptions often use straight quotes since they're easier
           to type on the keyboard. However, books look bad if you just use
           straight quotes so this tool, for purposes of better typography, allows 
           you to convert them to smart quotes (aka curly quotes). Note that this
           tool looks specifically between <p> tags, so if you have any quotes
           outside of a <p> tag that you want to smarten, you will have to do so
           manually.
             Also, if your book is in a language with a different quote system 
           you can first use this tool to convert them to the standard english 
           ones and then do a search and replace to your language's quotes 
           („…“, «…», »…«, etc.) using a tool like sed.

           The options are as follows:

           -h       Display usage statement. 

      EXAMPLES
           Say you have a bunch of text files in the text/ folder. You can use
           this tool like so:

                ebukafy smarten-quotes EPUB/text/*

- ### `ebukafy split`
      NAME
           split -- split file at every '<!--split-->' into separate files

      SYNOPSIS
           split [-h] target_file

      DESCRIPTION
           This tool splits a file at every '<!--split-->' into chapter-n.xhtml, 
           where n is just an index starting at 1. Oftentimes you start making
           your ebook with a gigantic text/html file. It is much better practice 
           to split your file into separate chapters. This tool will also put in
           the appropriate header information into each chapter-n.xhtml file
           such as the chapter's roman numeral.

           The options are as follows:

           -h       Display usage statement. 

      EXAMPLES
           Say you have a file like this and you put in the splits like so

                foofoo
                <!--split-->
                barbar
                <!--split-->
                bazbaz

           This will result in three files, chapter-1.xhtml to chapter-3.xhtml.
           Besides the header, the content of chapter-1.xhtml will be 'foofoo',
           the content of chapter-2.xhtml will be 'barbar', and the content of
           chapter-3.xhtml will be 'bazbaz'. The best way to see exactly what
           this does is to try it with an example such as the one above.
