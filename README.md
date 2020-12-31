# ebukafy

A collection of tools used to convert html or txt files into ebooks.

# Installation

`npm install ebukafy --save`

# Tools

Note that to run any of these tools you need to preced them with `ebukafy` (e.g. if you want to run `create-skeleton`, you need to run `ebukafy create-skeleton`).

- ### `ebukafy create-skeleton`
      NAME
           create-skeleton -- creates a skeleton epub directory

      SYNOPSIS
           create-skeleton [-h] [-u uid] -a author -l language -t title 
           target_directory

      DESCRIPTION
           This tool creates a new skeleton of an epub directory at target_directory
           The contents of this skeleton folder can be found at the GitHub 
           repository. According to the epub standard the uid, title, and language
           are all required. Including the author is just good practice.

           The options are as follows:

           -h       Display usage statement. 
       
           -u       Optional. Set uid manually. If not set, it will be
                    randomly generated. A uid is mandatory according to the
                    epub standard.

           -a       Set the author of book. 

           -l       Set the language of book. This should be the IANA language tag.
                    If you don't know the tag for a language look up 'IANA Language
                    Subtag Registry'.

           -t       Set the title of the book.

      EXAMPLES
           To create an epub skeleton in the current working directory you can run
           
               create-skeleton -a Homer -l grc -t 'The Odyssey' .

           Note the '' around the title since it's two words. You can do that same
           for the author if their name is made up of two words.
               
               
