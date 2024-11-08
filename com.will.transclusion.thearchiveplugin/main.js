"use strict";

/**
 * Plugin for "The Archive"
 * Creates a document for concatenating notes
 *   - The user must have the template note open
 *   - The template note must contain a list of note titles or links
 *   - One on each line in the order desired
 *   - Everything else in the template file will be ignored
 *   - The user is prompted for a title for the output file
 *   - The filename is made with the current timestamp
 *   - No front matter is inserted at the top of the created note
 *   - The output is also copied to the clipboard for placement in other applications
 * 
 * NB:
 *   - The timestamp is precise to the minute
 *
 * @summary Create new note that is a transclusion/concatenation of other notes
 * @created on     : 2024-10-28 
 * @last modified  : 2024-11-07
 */

// Get the selected template note
const templateSelected = input.notes.selected;
if (!templateSelected || templateSelected.length === 0) {
    throw new Error("No template note selected.");
}
const templateNote = templateSelected[0];

// Remove the UID from the templateNote.filename for later use in creating a new note.
const templateNotename = templateNote.filename.replace(/\b \d{12}\b/, '').trim();

// New Note's UID
const uid = app.unusedFilename();

// New Note Title
const title = `${templateNotename} Transcluded`;

/**
 * Function to find lines starting with "%%%" and extract clean note titles.
 * It filters out lines that start with "UUID" and removes unwanted prefixes.
 *
 * @param {string} text - The markdown text from the template note.
 * @returns {string[]} - Array of cleaned note titles to be transcluded.
 */
function findLinesWithPattern(text) {
    // Regex pattern to capture lines starting with "%%%" followed by spaces and note title
    const pattern = /^%%% +(.+)$/gm;
    const matches = [];
    let match;

    // Execute the regex on the input text
    while ((match = pattern.exec(text)) !== null) {
        // match[1] contains the note title after "%%% "
        let noteTitle = match[1].trim();

        // Filter out lines where the noteTitle starts with "UUID"
        if (noteTitle.startsWith("UUID")) {
            continue; // Skip this entry
        }

        // Remove "- ", "[[", and "]]" from the noteTitle
        noteTitle = noteTitle.replace(/^- /g, '').replace(/\[\[|\]\]/g, '').trim();

        if (noteTitle) {
            matches.push(noteTitle);
        }
    }

    return matches;
}

// Read the markdown file from the selected template note
const markdownText = input.text.all;

// Find lines with the "%%%" pattern, filter, and clean them
const linesWithPattern = findLinesWithPattern(markdownText);

// Initialize an array to collect filenames that encounter errors
const missingFilenames = [];

// Prepare the content of the new note
let draftContent = "";

// Handle the case where no lines are found by giving the user a hint
if (linesWithPattern.length === 0) {
    draftContent = `There are no notes defined to be transcluded in ${templateNotename}.

Review your template file and set every file you want to
transclude on its own line preceded with "%%% ".
Place them in the order you want them to appear in the transcluded note.
You can intersperse them with other text, but the line with each note must start with "%%% ".
`.trim();
} else {
    linesWithPattern.forEach(filename => {
        // Find the corresponding note by filename
        const note = input.notes.all.find(note => note.filename === filename);
        if (note && note.content) {
            // Append the note's content to draftContent
            draftContent += `${note.content.trim()}\n`;
            console.log(`Appended content from "${filename}".`);
        } else {
            console.error(`Note with filename "${templateNotename}" not found or has no content.`);
            // Collect the missing filename instead of appending immediately
            missingFilenames.push(filename);
        }
    });

    // After processing all filenames, check if there are any missing
    if (missingFilenames.length > 0) {
        // Create a list of missing filenames
        const missingList = missingFilenames.map(name => `   - ${name}`).join('\n');

        // Append the list and help text to draftContent
        draftContent += `\n# HELP\n<!-- Malformed %%% Lines in ${templateNotename} -->
${missingList}
----
   - Check the note title and the existence of each note.
   - Verify the spelling of each note title. Do not include the file extention.
   - Ensure each concatenated note is on a separate line starting with "%%% " followed by the note's title.
   - Example line: %%% Note Title
----\n`;
    }
}

// Output the concatenated content
console.log("Draft Content:\n", draftContent);

// Set the output with the described filename
// output.changeFile.filename = `${title} ${uid}`; // Assuming .md extension
//STUB - output.changeFile.content = draftContent.trim();
output.pasteboard.content = draftContent.trim();
output.display.content = draftContent.trim();

// Log the output assignments for verification
console.log(`Output Filename: ${output.changeFile.filename}`);
console.log(`Output Content:\n${output.changeFile.content}`);
console.log(`Copied to Clipboard: ${output.pasteboard.content}`);