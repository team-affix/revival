import Box from 'cli-box';

// Returns a string containing a box with the given text
export function boxed(text: string): string {
    // Box with aligned text to top-right
    var b4 = Box('1x1', {
        text,
        stretch: true,
        autoEOL: true,
        vAlign: 'top',
        hAlign: 'right',
    });

    return b4.toString();
}
