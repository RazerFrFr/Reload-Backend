const verifyFile = (req, res, next) => {
    const fileParam = req.params.file;    
    if (!fileParam) {
        return res.status(404).send('File not found');
    }
    
    // thank me later skids now u wont get nuked out of no where
    const traversalRegex = /(\.\.$|\.\.[^/]|~|\\{1,2}|\/\/|%5c|\.%2e|%2e\.|﹒﹒|．．|\.\.\\|\.\.\/\.\.)/i;

    if (traversalRegex.test(fileParam)) {
        return res.status(404).send('File not found');
    }
    
    next();
};

module.exports = verifyFile;