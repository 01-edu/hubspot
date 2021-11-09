
// open the text file containing the mail body and returns it.
function readMail (mailName)
{
    var fs = require('fs');

    try {
        var mailBody = fs.readFileSync(mailName, 'utf8'); 
        return mailBody;  
    } catch(e) {
        console.log('Error:', e.stack);
    }
}

module.exports = { readMail };