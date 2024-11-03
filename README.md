## Transclusion Plugin for The Archive
@created on     : 2024-10-28

This repository creates a note for the transclusion/concatenating of multiple notes together in a single note as a plug-in for [The Archive](https://zettelkasten.de/the-archive/). 

## Getting the template or root file set up.

To create your root note:

1. The template note must contain a list of note titles or links
2. One on each line in the order desired
3. Everything else in the template file will be ignored

To activate the plugin

1. The user must have the template note open
2. The user is prompted for a title for the output file
3. The filename is made with the current timestamp
4. No front matter is inserted at the top of the created note
5. The output is also copied to the clipboard for placement is other applications
6. The timestamp is precise to the minute

### Customization

- In the line "output.changeFile.filename = `${title} ${uid}`;", the uid and title can be switched.
