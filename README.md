# ebukafy

A collection of tools used to convert html or txt files into ebooks.

# Installation

`npm install ebukafy --save`

# Usage

`ebukafy [-h] command [args ...]`

To use ebukafy look at the list of commands/tools in the [Tools](#tools) section below. The arguments needed change based on the command.

Normal use of `ebukafy` would look something like this:

1. Download some html that you want to convert into an ebook with a tool like `wget`
2. Run `ebukafy create-skeleton` to create a skeleton of an epub directory
3. Put the downloaded html into the EPUB/text directory of the skeleton
4. Run `ebukafy split` to split the big html file into multiple files with correct headers
5. Manually (for now) edit the `content.opf`, `toc.xhtml`, and `toc.ncx` files. The skeleton includes an example chapter to show you the way these files should look. If you don't know anything about the internals of an epub this step will be difficult but it's much easier that it sounds. Just look up 'anatomy of an epub file' and read up
6. After everything is done run `ebukafy build` to build this epub folder into an actual epub file
7. Before reading run `ebukafy epubcheck` to make sure everything within the epub is up to the specification of the epub standard
8. To read on a kobo or kindle please use a tool like [Calibre](https://calibre-ebook.com/) to convert the book to the approriate format (kepub and azw3/mobi respectively)

# Tools

Note that to run any of these tools you need to preced them with `ebukafy` (e.g. if you want to run `create-skeleton`, you need to run `ebukafy create-skeleton`).

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
       
           -a       Optional. Set the author of book. 

           -u       Optional. Set uid manually. If not set, it will be
                    randomly generated. A uid is mandatory according to the
                    epub standard.

           -l       Set the language of book. This should be the IANA language tag.
                    If you don't know the tag for a language look up 'IANA Language
                    Subtag Registry'.

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
           epubcheck is a tool which "validates the conformance of EPUB 
           publications against the EPUB specifications." The GitHub repository
           for epubcheck can be found here: https://github.com/w3c/epubcheck
           Note that this tool is written in java so you need java to run it.
           It will output any errors or just say that your epub is up to standard.

           The options are as follows:

           -h       Display usage statement. 

      EXAMPLES
           To check if your epub conforms to the epub standards just run
           
                epubcheck homer_the-odyssey.epub

- ### `ebukafy split`
      NAME
           split -- split file at every '<!--split-->' into separate files

      SYNOPSIS
           split [-h] target_file

      DESCRIPTION
           This tool splits a file at every '<!--split-->' into chapter-n.xhtml, 
           where n is just an index starting at 1. Oftentimes you start making
           your ebook with a gigantic text/html file. It is much better practice 
           to split your file into seperate chapters. This tool will also put in
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
